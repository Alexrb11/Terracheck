import Notification from '../models/Notification.js'

// GET /api/notifications - Obtener mis notificaciones
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name username avatar')
      .populate({
        path: 'activity',
        select: 'type content animal terrarium',
        populate: [
          { path: 'animal', select: 'name imageUrl' },
          { path: 'terrarium', select: 'name imageUrl' }
        ]
      })

    const total = await Notification.countDocuments({ recipient: userId })

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error al obtener notificaciones:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: error.message
    })
  }
}

// GET /api/notifications/count - Obtener conteo de notificaciones no leídas
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    })

    res.json({
      success: true,
      data: { unreadCount }
    })
  } catch (error) {
    console.error('Error al contar notificaciones no leídas:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener el conteo',
      error: error.message
    })
  }
}

// PUT /api/notifications/:id/read - Marcar notificación como leída
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    // Si id es 'all', marcar todas como leídas
    if (id === 'all') {
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
      )
      return res.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas'
      })
    }

    // Marcar una específica
    const notification = await Notification.findOne({
      _id: id,
      recipient: userId
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      })
    }

    notification.isRead = true
    await notification.save()

    res.json({
      success: true,
      data: notification,
      message: 'Notificación marcada como leída'
    })
  } catch (error) {
    console.error('Error al marcar notificación:', error)
    res.status(500).json({
      success: false,
      message: 'Error al actualizar notificación',
      error: error.message
    })
  }
}
