import mongoose from 'mongoose'

/**
 * Modelo Permission
 * Representa una acción específica que puede ser asignada a roles
 */
const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del permiso es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  slug: {
    type: String,
    required: [true, 'El slug del permiso es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[a-z_]+$/,
      'El slug solo puede contener letras minúsculas y guiones bajos'
    ]
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  category: {
    type: String,
    default: 'general',
    enum: ['users', 'roles', 'terrariums', 'animals', 'species', 'system', 'general']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Índices
permissionSchema.index({ slug: 1 })
permissionSchema.index({ category: 1 })

const Permission = mongoose.model('Permission', permissionSchema)

export default Permission
