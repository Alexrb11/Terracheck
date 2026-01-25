import { Router } from 'express'
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

// Rutas públicas
router.post('/register', register)
router.post('/login', login)

// Rutas protegidas
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.put('/password', protect, changePassword)
router.delete('/account', protect, deleteAccount)

export default router
