import express from 'express'
import contactController from '../controllers/contactController.js'

const router = express.Router()

router.get('/', contactController.list)
router.get('/:id', contactController.show)
router.post('/', contactController.create)
router.put('/:id', contactController.update)
router.delete('/:id', contactController.remove)

export default router
