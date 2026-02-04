import { Router } from 'express'
import { getPublicProfile } from '../controllers/user.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

// Endpoint público (pero usa authenticate para saber quién pregunta, si hay token)
router.get('/profile/:username', authenticate, getPublicProfile)

export default router
