import express from 'express'
import contactController from '../controllers/contactController.js'
import Contact from '../models/ContactModel.js'

const router = express.Router()

router.post('/fixDocs', async (req, res, next) => {
  try {
    const fixed = await Contact.fixDocs()
    res.json({ fixed })
  } catch (error) {
    next(error)
  }
})

router.get('/', contactController.list)
router.get('/:id', contactController.show)
router.post('/', contactController.create)
router.put('/:id', contactController.update)
router.delete('/:id', contactController.remove)

export default router
