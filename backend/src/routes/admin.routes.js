import { Router } from 'express'
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getSystemStats
} from '../controllers/admin.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { checkPermission } from '../middleware/checkPermission.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(protect)

// Estadísticas del sistema (requiere view_statistics)
router.get('/stats', checkPermission('view_statistics'), getSystemStats)

// Rutas de gestión de usuarios (requieren manage_users)
router.get('/users', checkPermission('manage_users'), getAllUsers)
router.get('/users/:id', checkPermission('manage_users'), getUserById)
router.patch('/users/:id/role', checkPermission('manage_users'), updateUserRole)
router.patch('/users/:id/status', checkPermission('manage_users'), updateUserStatus)
router.delete('/users/:id', checkPermission('manage_users'), deleteUser)

export default router
