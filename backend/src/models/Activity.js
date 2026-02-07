import mongoose from 'mongoose'

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

const Activity = mongoose.model('Activity', activitySchema)

export default Activity
