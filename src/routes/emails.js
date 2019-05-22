import { Router } from 'express'
import { sendMails } from '../lib/queues'

const router = Router()

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

router.post('/', async (req, res) => {
  try {
    const { toRecontactDelay, emails, type } = req.body
    const today = new Date()
    const thisMonth = today.getMonth()
    const toRecontact = today.getMonth(today.setMonth(thisMonth + parseInt(toRecontactDelay)))
    const mails = emails.filter(e => typeof e === 'string' && e.trim().match(emailRegex))
    console.log(require('util').inspect({ thisMonth, toRecontact, mails }, true, 10, true))
    await sendMails({
      toRecontact,
      emails: mails,
      type: type || '4bands',
    })
    res.json({ status: 'queued', count: req.body.emails.length })
  } catch (error) {
    console.log(require('util').inspect({ error }, true, 10, true))
    res.status(500).json(error)
  }
})

export default router
