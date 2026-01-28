import Friendship from '../models/Friendship.js'
import User from '../models/User.js'

/**
 * GET /api/friends/search?q=username
 * Buscar usuarios por username (coincidencia parcial).
 */
export const searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || '').trim()
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      })
    }

    const users = await User.find({
      isActive: true,
      username: { $regex: q, $options: 'i' }
    })
      .select('name username')
      .limit(20)
      .lean()

    res.json({
      success: true,
      data: users.map((u) => ({
        id: u._id,
        name: u.name,
        username: u.username || null
      }))
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al buscar usuarios',
      error: error.message
    })
  }
}

/**
 * POST /api/friends/request/:userId
 * Enviar solicitud de amistad. userId = recipient.
 */
export const sendRequest = async (req, res) => {
  try {
    const requesterId = req.user._id
    const recipientId = req.params.userId

    if (requesterId.toString() === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes enviarte una solicitud a ti mismo'
      })
    }

    const recipient = await User.findById(recipientId)
    if (!recipient || !recipient.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    const existing = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    })

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'Ya sois amigos'
        })
      }
      if (existing.status === 'pending') {
        if (existing.requester.toString() === requesterId.toString()) {
          return res.status(400).json({
            success: false,
            message: 'Ya has enviado una solicitud a este usuario'
          })
        }
        return res.status(400).json({
          success: false,
          message: 'Este usuario ya te envió una solicitud'
        })
      }
    }

    const friendship = await Friendship.create({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    })

    await friendship.populate([
      { path: 'requester', select: 'name username' },
      { path: 'recipient', select: 'name username' }
    ])

    res.status(201).json({
      success: true,
      message: 'Solicitud enviada',
      data: friendship
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al enviar solicitud',
      error: error.message
    })
  }
}

/**
 * PUT /api/friends/accept/:requestId
 * Aceptar solicitud. Solo el recipient puede aceptar.
 */
export const acceptRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId
    const userId = req.user._id

    const friendship = await Friendship.findById(requestId)
    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      })
    }

    if (friendship.recipient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Solo el destinatario puede aceptar la solicitud'
      })
    }

    if (friendship.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'La solicitud no está pendiente'
      })
    }

    friendship.status = 'accepted'
    await friendship.save()
    await friendship.populate([
      { path: 'requester', select: 'name username' },
      { path: 'recipient', select: 'name username' }
    ])

    res.json({
      success: true,
      message: 'Solicitud aceptada',
      data: friendship
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al aceptar solicitud',
      error: error.message
    })
  }
}

/**
 * DELETE /api/friends/reject/:requestId
 * Rechazar o cancelar solicitud. Tanto recipient (rechazar) como requester (cancelar) pueden eliminar.
 */
export const rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId
    const userId = req.user._id

    const friendship = await Friendship.findById(requestId)
    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      })
    }

    const isRequester = friendship.requester.toString() === userId.toString()
    const isRecipient = friendship.recipient.toString() === userId.toString()

    if (!isRequester && !isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'No puedes modificar esta solicitud'
      })
    }

    await Friendship.findByIdAndDelete(requestId)

    res.json({
      success: true,
      message: isRecipient ? 'Solicitud rechazada' : 'Solicitud cancelada'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
      error: error.message
    })
  }
}

/**
 * DELETE /api/friends/remove/:userId
 * Eliminar amistad. userId = el otro usuario.
 */
export const removeFriend = async (req, res) => {
  try {
    const userId = req.user._id
    const friendId = req.params.userId

    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: friendId },
        { requester: friendId, recipient: userId }
      ],
      status: 'accepted'
    })

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'No existe amistad con este usuario'
      })
    }

    await Friendship.findByIdAndDelete(friendship._id)

    res.json({
      success: true,
      message: 'Amigo eliminado'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar amigo',
      error: error.message
    })
  }
}

/**
 * GET /api/friends/status
 * Lista friends, incomingRequests, outgoingRequests.
 */
export const getFriendships = async (req, res) => {
  try {
    const userId = req.user._id

    const [friendsDocsCorrect, incomingDocs, outgoingDocs] = await Promise.all([
      Friendship.find({
        $or: [
          { requester: userId },
          { recipient: userId }
        ],
        status: 'accepted'
      })
        .populate('requester', 'name username')
        .populate('recipient', 'name username'),
      Friendship.find({ recipient: userId, status: 'pending' })
        .populate('requester', 'name username'),
      Friendship.find({ requester: userId, status: 'pending' })
        .populate('recipient', 'name username')
    ])

    const friends = friendsDocsCorrect.map((f) => {
      const other = f.requester._id.toString() === userId.toString() ? f.recipient : f.requester
      return {
        id: f._id,
        userId: other._id,
        name: other.name,
        username: other.username,
        friendshipId: f._id
      }
    })

    const incomingRequests = incomingDocs.map((f) => ({
      id: f._id,
      userId: f.requester._id,
      name: f.requester.name,
      username: f.requester.username,
      requestId: f._id,
      createdAt: f.createdAt
    }))

    const outgoingRequests = outgoingDocs.map((f) => ({
      id: f._id,
      userId: f.recipient._id,
      name: f.recipient.name,
      username: f.recipient.username,
      requestId: f._id,
      createdAt: f.createdAt
    }))

    res.json({
      success: true,
      data: {
        friends,
        incomingRequests,
        outgoingRequests
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener amistades',
      error: error.message
    })
  }
}
