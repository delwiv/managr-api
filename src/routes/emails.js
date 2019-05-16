import { Router } from 'express'
import { sendMails } from '../lib/queues'

const router = Router()

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

router.post('/', async (req, res) => {
  try {
    console.log({ body: req.body })
    const { toRecontactDelay, emails, type } = req.body
    const today = new Date()
    const thisMonth = today.getMonth()
    const toRecontact = today.getMonth(today.setMonth(thisMonth + toRecontactDelay))
    await sendMails({
      toRecontact,
      emails: emails.filter(e => e.match(emailRegex)),
      type: type || '4bands',
    })
    res.json({ status: 'queued', count: req.body.emails.length })
  } catch (error) {
    res.status(500).json({ error })
  }
})

export default router
