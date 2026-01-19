import User from '../models/User.js'
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

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password
    })

    // Generar token
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
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
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

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

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
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
    const user = await User.findById(req.user._id)

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
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

// PUT /api/auth/me - Actualizar perfil
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body

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

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    )

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    })
  }
}

// PUT /api/auth/password - Cambiar contraseña
export const updatePassword = async (req, res) => {
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

    // Generar nuevo token
    const token = generateToken(user._id)

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
      data: { token }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    })
  }
}
