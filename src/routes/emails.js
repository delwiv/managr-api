import { Router } from 'express'
import { sendMails } from '../lib/queues'

const router = Router()

router.post('/', async (req, res) => {
  console.log({ body: req.body })
  await sendMails({ ...req.body, type: 'mail' })
  res.json({ status: 'queued', count: req.body.emails.length })
})

export default router
