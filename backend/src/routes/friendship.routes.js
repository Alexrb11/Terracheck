import { Router } from 'express'
import {
  searchUsers,
  sendRequest,
  acceptRequest,
  rejectRequest,
  removeFriend,
  getFriendships
} from '../controllers/friendship.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()
router.use(protect)

// GET /api/friends/search?q= - Buscar usuarios por username
router.get('/search', searchUsers)

// GET /api/friends/status - Listar amigos, entrantes y salientes
router.get('/status', getFriendships)

// POST /api/friends/request/:userId - Enviar solicitud
router.post('/request/:userId', sendRequest)

// PUT /api/friends/accept/:requestId - Aceptar solicitud
router.put('/accept/:requestId', acceptRequest)

// DELETE /api/friends/reject/:requestId - Rechazar o cancelar solicitud
router.delete('/reject/:requestId', rejectRequest)

// DELETE /api/friends/remove/:userId - Eliminar amigo
router.delete('/remove/:userId', removeFriend)

export default router
