import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un email válido'
    ]
  },
  username: {
    type: String,
    required: [true, 'El username es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'El username debe tener al menos 3 caracteres'],
    maxlength: [50, 'El username no puede exceder 50 caracteres'],
    match: [
      /^[a-zA-Z0-9_-]+$/,
      'El username solo puede contener letras, números, guión bajo (_) y guión (-). No se permiten espacios ni símbolos especiales.'
    ]
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir password en queries por defecto
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'El rol es requerido']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Middleware: Hashear password antes de guardar
userSchema.pre('save', async function(next) {
  // Solo hashear si el password fue modificado
  if (!this.isModified('password')) {
    return next()
  }

  // Generar salt y hashear
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Método: Comparar password ingresado con el hash
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Método: Verificar si el usuario tiene un permiso específico
userSchema.methods.hasPermission = async function(permissionSlug) {
  await this.populate({
    path: 'role',
    populate: { path: 'permissions' }
  })
  
  if (!this.role || !this.role.permissions) {
    return false
  }
  
  return this.role.permissions.some(p => p.slug === permissionSlug)
}

// Índice para búsquedas por email, username y rol
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })
userSchema.index({ role: 1 })

const User = mongoose.model('User', userSchema)

export default User
