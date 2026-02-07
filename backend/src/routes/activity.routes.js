import { Router } from 'express'
import {
  getFeed,
  toggleLike,
  deleteActivity
} from '../controllers/activity.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

// Todas las rutas requieren autenticación
router.use(protect)

// GET /api/activities - Obtener feed de actividades
router.get('/', getFeed)

// POST /api/activities/:id/like - Dar/quitar like a una actividad
router.post('/:id/like', toggleLike)

// DELETE /api/activities/:id - Eliminar una actividad
router.delete('/:id', deleteActivity)

export default router
