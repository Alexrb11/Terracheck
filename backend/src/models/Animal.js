import mongoose from 'mongoose'

const animalSchema = new mongoose.Schema({
  // Propietario del animal
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario propietario es requerido']
  },

  name: {
    type: String,
    required: [true, 'El nombre del animal es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },

  // Fecha de nacimiento aproximada
  birthDate: {
    type: Date,
    default: null
  },

  // Sexo
  sex: {
    type: String,
    enum: {
      values: ['male', 'female', 'unknown'],
      message: 'El sexo debe ser male, female o unknown'
    },
    default: 'unknown'
  },

  // Referencia a la especie
  species: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Species',
    required: [true, 'La especie es requerida']
  },

  // Referencia al terrario donde vive
  terrarium: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terrarium',
    default: null
  },

  // Peso en gramos (opcional)
  weight: {
    type: Number,
    default: null,
    min: 0
  },

  // Notas adicionales
  notes: {
    type: String,
    default: ''
  },

  // Imagen de perfil (URL opcional)
  imageUrl: {
    type: String,
    default: null
  },

  // Galería de imágenes (Array de URLs)
  gallery: {
    type: [String],
    default: []
  },

  // Estado (activo = vivo)
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Índices
animalSchema.index({ user: 1, isActive: 1 })
animalSchema.index({ terrarium: 1 })
animalSchema.index({ species: 1 })

const Animal = mongoose.model('Animal', animalSchema)

export default Animal
