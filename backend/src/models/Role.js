import mongoose from 'mongoose'

/**
 * Modelo Role
 * Define perfiles de usuario con conjuntos de permisos
 */
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del rol es requerido'],
    unique: true,
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  slug: {
    type: String,
    required: [true, 'El slug del rol es requerido'],
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  isSystem: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Método para verificar si el rol tiene un permiso específico
roleSchema.methods.hasPermission = function(permissionSlug) {
  if (!this.populated('permissions')) {
    throw new Error('Permissions must be populated before checking')
  }
  return this.permissions.some(p => p.slug === permissionSlug)
}

// Virtual para contar usuarios con este rol
roleSchema.virtual('userCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'role',
  count: true
})

// Índices
roleSchema.index({ slug: 1 })
roleSchema.index({ isSystem: 1 })

const Role = mongoose.model('Role', roleSchema)

export default Role
