import User from '../models/User.js'
import Role from '../models/Role.js'
import { generateToken } from '../middleware/auth.middleware.js'

// POST /api/auth/register - Registrar nuevo usuario
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validar campos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona nombre, email y contraseña'
      })
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cuenta con este email'
      })
    }

    // Buscar el rol de usuario por defecto
    const defaultRole = await Role.findOne({ slug: 'user' })
    if (!defaultRole) {
      return res.status(500).json({
        success: false,
        message: 'Error de configuración: rol de usuario no encontrado'
      })
    }

    // Crear usuario con rol de usuario por defecto
    const user = await User.create({
      name,
      email,
      password,
      role: defaultRole._id
    })

    // Popular rol para la respuesta
    await user.populate({
      path: 'role',
      select: 'name slug',
      populate: { path: 'permissions', select: 'slug' }
    })

    // Generar token
    const token = generateToken(user._id)

    // Extraer permisos del usuario
    const permissions = user.role.permissions?.map(p => p.slug) || []

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: {
            id: user.role._id,
            name: user.role.name,
            slug: user.role.slug
          },
          permissions,
          createdAt: user.createdAt
        },
        token
      }
    })
  } catch (error) {
    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    })
  }
}

// POST /api/auth/login - Iniciar sesión
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona email y contraseña'
      })
    }

    // Buscar usuario e incluir password para verificar
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate({
        path: 'role',
        select: 'name slug',
        populate: { path: 'permissions', select: 'slug' }
      })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      })
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada. Contacta al administrador.'
      })
    }

    // Verificar contraseña
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      })
    }

    // Generar token
    const token = generateToken(user._id)

    // Extraer permisos del usuario
    const permissions = user.role?.permissions?.map(p => p.slug) || []

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role ? {
            id: user.role._id,
            name: user.role.name,
            slug: user.role.slug
          } : null,
          permissions,
          createdAt: user.createdAt
        },
        token
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    })
  }
}

// GET /api/auth/me - Obtener usuario actual
export const getMe = async (req, res) => {
  try {
    // req.user ya está disponible gracias al middleware protect
    const user = await User.findById(req.user._id).populate({
      path: 'role',
      select: 'name slug',
      populate: { path: 'permissions', select: 'slug name' }
    })

    const permissions = user.role?.permissions?.map(p => p.slug) || []

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username || null,
        role: user.role ? {
          id: user.role._id,
          name: user.role.name,
          slug: user.role.slug
        } : null,
        permissions,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario',
      error: error.message
    })
  }
}

// PUT /api/auth/profile - Actualizar perfil
export const updateProfile = async (req, res) => {
  try {
    const { name, email, username } = req.body

    // Verificar si el nuevo email ya existe (si se está cambiando)
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una cuenta con este email'
        })
      }
    }

    // Verificar si el nuevo username ya existe (si se está cambiando)
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una cuenta con este username'
        })
      }
    }

    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email.toLowerCase()
    if (username !== undefined) updateData.username = username || null

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: 'role',
      select: 'name slug',
      populate: { path: 'permissions', select: 'slug' }
    })

    const permissions = user.role?.permissions?.map(p => p.slug) || []

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username || null,
        role: user.role ? {
          id: user.role._id,
          name: user.role.name,
          slug: user.role.slug
        } : null,
        permissions,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  } catch (error) {
    if (error.code === 11000) {
      // Error de duplicado
      const field = Object.keys(error.keyPattern)[0]
      return res.status(400).json({
        success: false,
        message: `Ya existe una cuenta con este ${field === 'email' ? 'email' : 'username'}`
      })
    }
    res.status(400).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    })
  }
}

// PUT /api/auth/password - Cambiar contraseña
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona la contraseña actual y la nueva'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      })
    }

    // Obtener usuario con password
    const user = await User.findById(req.user._id).select('+password')

    // Verificar contraseña actual
    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      })
    }

    // Actualizar contraseña
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    })
  }
}

// DELETE /api/auth/account - Eliminar cuenta (borrado lógico)
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    // Borrado lógico: establecer isActive en false
    user.isActive = false
    await user.save()

    res.json({
      success: true,
      message: 'Cuenta eliminada exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cuenta',
      error: error.message
    })
  }
}
