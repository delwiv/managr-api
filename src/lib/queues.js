import fs from 'fs'
import kue from 'kue'
import uuid from 'uuid/v4'
import { join } from 'path'
import { format } from 'date-fns'

import Contact from '../models/ContactModel'
import redis, { MAILCOUNT_KEY } from './redis'
import { sendMail } from './gmail'
// import { sendProgress } from './websocket'

const getBody = type => fs.readFileSync(join(__dirname, `../mails/${type}.html`)).toString('utf8')

const NB_PARALLEL_EMAILS = 4
const jobs = kue.createQueue()

const JOB_DELAY = 1000 * 60 * 60 * 3 // 3h

jobs.on('error', async err => {
  console.log(require('util').inspect({ err }, true, 10, true))
  await sendMail({
    body: err.toString('utf8') + err.stack.toString('utf8'),
    subject: 'Massmail error happened',
    to: 'delwiv@protonmail.com',
  })
})

export const sendMails = async ({ emails, type, toRecontact }) => {
  for (const email of emails) {
    try {
      const contact = await Contact.findOne({ $or: [{ mail: email }, { mail2: email }, { mail3: email }] })
      const job = jobs.create('sendMail', { email, type, total: emails.length, toRecontact, name: contact.nom }).save()
      await Contact.updateOne(
        { $or: [{ mail: email }, { mail2: email }, { mail3: email }] },
        { sendMailStatus: { date: new Date(), status: 'queued' } }
      )
      job.attempts(10).backoff({ type: 'exponential' })
      const last24hours = await redis.find(`*${MAILCOUNT_KEY}.*`)
      console.log({ last24hours: last24hours.length })
      if (last24hours.length >= 500) job.delay(JOB_DELAY)
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('errCreateJob', { error })
      const errorMessage = error.message === 'Invalid to header' ? `Mauvaise adresse email : ${email}` : error.message
      await Contact.updateOne(
        { $or: [{ mail: email }, { mail2: email }, { mail3: email }] },
        { sendMailStatus: { date: new Date(), error: errorMessage } }
      )
    }
  }
}

// const getProgress = progress => Math.round(+progress * 100) / 100

jobs.process('sendMail', NB_PARALLEL_EMAILS, async (job, done) => {
  const { name, email, total, type, toRecontact } = job.data
  try {
    await Contact.updateOne(
      { $or: [{ mail: email }, { mail2: email }, { mail3: email }] },
      { sendMailStatus: { date: new Date(), status: 'sending' } }
    )
    console.log({ name, email })
    // let lastTime = Date.now()
    console.log({ email, total })
    await sendMail({
      body: getBody(type),
      // subject : `${name} - Proposition spectacle`
      subject: `${name} - Proposition Spectacle (${email})`,
      //to: email.trim(),
      to: `mailfredericrobert@gmail.com`,
    })

    await Contact.updateOne(
      { $or: [{ mail: email }, { mail2: email }, { mail3: email }] },
      {
        sendMailStatus: { date: new Date(), status: 'sent' },
        mois_contact: toRecontact + 1,
        envoi_mail: format(new Date(), 'DD/MM/YY'),
      }
    )
    await redis.set(`${MAILCOUNT_KEY}.${uuid()}`, true)
    done()
  } catch (error) {
    console.error('errCreateJob', { error })
    await Contact.updateOne(
      { $or: [{ mail: email }, { mail2: email }, { mail3: email }] },
      { sendMailStatus: { date: new Date(), error: error.message } }
    )
    done(error)
  }
})