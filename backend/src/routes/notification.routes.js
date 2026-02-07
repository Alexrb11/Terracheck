import { Router } from 'express'
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead
} from '../controllers/notification.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(protect)

// GET /api/notifications - Obtener mis notificaciones
router.get('/', getMyNotifications)

// GET /api/notifications/count - Obtener conteo de no leídas
router.get('/count', getUnreadCount)

// PUT /api/notifications/:id/read - Marcar como leída
router.put('/:id/read', markAsRead)

export default router
