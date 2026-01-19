import mongoose from 'mongoose'

const animalSchema = new mongoose.Schema({
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

  // Imagen (URL opcional)
  imageUrl: {
    type: String,
    default: null
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
animalSchema.index({ terrarium: 1 })
animalSchema.index({ species: 1 })

const Animal = mongoose.model('Animal', animalSchema)

export default Animal
