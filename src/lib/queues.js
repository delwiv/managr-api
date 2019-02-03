import fs from 'fs'
import kue from 'kue'
import uuid from 'uuid/v4'
import { join } from 'path'

import Contact from '../models/ContactModel'
import redis from './redis'
import { sendMail } from './gmail'
// import { sendProgress } from './websocket'

const getBody = type => fs.readFileSync(join(__dirname, `../mails/${type}.html`)).toString('utf8')

const NB_PARALLEL_EMAILS = 4
const REDIS_KEY = 'email.task'
const jobs = kue.createQueue()

const JOB_DELAY = 1000 * 60 * 60 * 3 // 3h

jobs.on('error', async err => {
  console.log(require('util').inspect({ err }, true, 10, true))
  await sendMail({
    body: err.toString('utf8') + err.stack.toString('utf8'),
    subject: 'Massmail error happened',
    to: 'delwiv@gmail.com',
  })
})

export const sendMails = async ({ emails, type, toRecontact }) => {
  for (const email of emails) {
    try {
      const job = jobs.create('sendMail', { email, type, total: emails.length, toRecontact }).save()
      await Contact.updateOne(
        { $or: [{ mail: email }, { mail2: email }, { mail3: email }] },
        { sendMailStatus: { date: new Date(), status: 'queued' } }
      )
      job.attempts(10).backoff({ type: 'exponential' })
      const last24hours = await redis.find(`*${REDIS_KEY}.*`)
      console.log({ last24hours: last24hours.length })
      if (last24hours.length >= 500) job.delay(JOB_DELAY)
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('errCreateJob', { error })
      await Contact.updateOne(
        { $or: [{ mail: email }, { mail2: email }, { mail3: email }] },
        { sendMailStatus: { date: new Date(), status: `error=${error.message}` } }
      )
    }
  }
}

// const getProgress = progress => Math.round(+progress * 100) / 100

jobs.process('sendMail', NB_PARALLEL_EMAILS, async (job, done) => {
  const { email, total, type, toRecontact } = job.data
  try {
    await Contact.updateOne(
      { $or: [{ mail: email }, { mail2: email }, { mail3: email }] },
      { sendMailStatus: { date: new Date(), status: 'sending' } }
    )
    // let lastTime = Date.now()
    console.log({ email, total })
    await sendMail({
      body: getBody(type),
      subject: `Jazz ${email}`,
      to: 'delwiv@gmail.com',
    })
    await Contact.updateOne(
      { $or: [{ mail: email }, { mail2: email }, { mail3: email }] },
      { sendMailStatus: { date: new Date(), status: 'sent' }, mois_contact: +toRecontact }
    )
    await redis.set(`${REDIS_KEY}.${uuid()}`, true)
    done()
  } catch (error) {
    console.error('errCreateJob', { error })
    await Contact.updateOne(
      { $or: [{ mail: email }, { mail2: email }, { mail3: email }] },
      { sendMailStatus: { date: new Date(), status: `error=${error.message}` } }
    )
    done(error)
  }
})
