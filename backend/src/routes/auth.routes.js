import { Router } from 'express'
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

// Rutas públicas
router.post('/register', register)
router.post('/login', login)

// Rutas protegidas
router.get('/me', protect, getMe)
router.put('/me', protect, updateProfile)
router.put('/password', protect, updatePassword)

export default router
