import mongoose from 'mongoose'
import Notification from './Notification.js'
import Friendship from './Friendship.js'

const activitySchema = new mongoose.Schema({
  // Usuario que realizó la actividad
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },

  // Tipo de actividad
  type: {
    type: String,
    enum: {
      values: ['new_animal', 'new_terrarium', 'update_photo'],
      message: 'El tipo debe ser new_animal, new_terrarium o update_photo'
    },
    required: [true, 'El tipo de actividad es requerido']
  },

  // Animal relacionado (opcional)
  animal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal',
    default: null
  },

  // Terrario relacionado (opcional)
  terrarium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terrarium',
    default: null
  },

  // Contenido descriptivo de la actividad
  content: {
    type: String,
    trim: true,
    maxlength: [500, 'El contenido no puede exceder 500 caracteres']
  },

  // Estado activo
  isActive: {
    type: Boolean,
    default: true
  },

  // Likes/reacciones
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
})

// Índices para búsquedas eficientes
activitySchema.index({ user: 1, createdAt: -1 })
activitySchema.index({ type: 1 })
activitySchema.index({ createdAt: -1 })
activitySchema.index({ animal: 1 })
activitySchema.index({ terrarium: 1 })

// Hook post-save: Notificar a amigos cuando se crea una nueva actividad
activitySchema.post('save', async function(doc, next) {
  try {
    // Solo notificar si es una actividad nueva (recién creada)
    // Mongoose no permite verificar isNew aquí, pero asumimos que es nueva al crear
    
    // 1. Buscar amigos aceptados del usuario
    const friendships = await Friendship.find({
      $or: [{ requester: doc.user }, { recipient: doc.user }],
      status: 'accepted'
    })

    const friendIds = friendships.map(f => 
      f.requester.toString() === doc.user.toString() ? f.recipient : f.requester
    )

    if (friendIds.length > 0) {
      const notifications = friendIds.map(friendId => ({
        recipient: friendId,
        sender: doc.user,
        type: 'new_post',
        activity: doc._id
      }))
      await Notification.insertMany(notifications)
    }
  } catch (error) {
    console.error('Error generando notificaciones de actividad:', error)
  }
  next()
})

const Activity = mongoose.model('Activity', activitySchema)

export default Activity
