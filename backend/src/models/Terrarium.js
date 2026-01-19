import mongoose from 'mongoose'

const terrariumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del terrario es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },

  // Dimensiones en centímetros
  dimensions: {
    width: {
      type: Number,
      required: [true, 'El ancho es requerido'],
      min: [10, 'El ancho mínimo es 10cm']
    },
    depth: {
      type: Number,
      required: [true, 'El fondo es requerido'],
      min: [10, 'El fondo mínimo es 10cm']
    },
    height: {
      type: Number,
      required: [true, 'La altura es requerida'],
      min: [10, 'La altura mínima es 10cm']
    }
  },

  // Tipo de terrario
  type: {
    type: String,
    required: true,
    enum: {
      values: ['glass', 'mesh', 'hybrid'],
      message: 'El tipo debe ser glass, mesh o hybrid'
    },
    default: 'glass'
  },

  // Sensores actuales (opcional)
  sensors: {
    temperature: {
      type: Number,
      default: null
    },
    humidity: {
      type: Number,
      default: null
    },
    lastUpdated: {
      type: Date,
      default: null
    }
  },

  // Imagen (URL opcional)
  imageUrl: {
    type: String,
    default: null
  },

  // Notas adicionales
  notes: {
    type: String,
    default: ''
  },

  // Estado activo
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual para calcular litros
terrariumSchema.virtual('liters').get(function() {
  const { width, depth, height } = this.dimensions
  return Math.round((width * depth * height) / 1000)
})

// Virtual para obtener animales (se poblará en las queries)
terrariumSchema.virtual('animals', {
  ref: 'Animal',
  localField: '_id',
  foreignField: 'terrarium'
})

const Terrarium = mongoose.model('Terrarium', terrariumSchema)

export default Terrarium
