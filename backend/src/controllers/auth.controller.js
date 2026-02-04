import User from '../models/User.js'
import Role from '../models/Role.js'
import Terrarium from '../models/Terrarium.js'
import Animal from '../models/Animal.js'
import Friendship from '../models/Friendship.js'
import { generateToken } from '../middleware/auth.middleware.js'

// Regex para validar username: solo letras, números, guión bajo y guión (evita inyecciones)
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,50}$/

// POST /api/auth/register - Registrar nuevo usuario
export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body

    // Validar campos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona nombre, email y contraseña'
      })
    }
    if (!username || typeof username !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'El username es obligatorio'
      })
    }
    const usernameTrim = username.trim()
    if (usernameTrim.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'El username debe tener al menos 3 caracteres'
      })
    }
    if (!USERNAME_REGEX.test(usernameTrim)) {
      return res.status(400).json({
        success: false,
        message: 'El username solo puede contener letras, números, guión bajo (_) y guión (-). No se permiten espacios ni símbolos especiales.'
      })
    }

    // Verificar si el email ya existe
    const existingEmail = await User.findOne({ email: email.toLowerCase() })
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cuenta con este email'
      })
    }

    // Verificar si el username ya existe (case-insensitive, guardamos en lowercase)
    const existingUsername = await User.findOne({ username: usernameTrim.toLowerCase() })
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cuenta con este username'
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
      username: usernameTrim.toLowerCase(),
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
          username: user.username,
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
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0]
      return res.status(400).json({
        success: false,
        message: field === 'username' ? 'Ya existe una cuenta con este username' : 'Ya existe una cuenta con este email'
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
          username: user.username || null,
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

// GET /api/auth/users/:username - Obtener perfil público de un usuario por username (con privacidad y amistad)
export const getProfileByUsername = async (req, res) => {
  try {
    const usernameParam = (req.params.username || '').trim()
    if (!usernameParam) {
      return res.status(400).json({
        success: false,
        message: 'Username no proporcionado'
      })
    }
    const targetUser = await User.findOne({ username: usernameParam.toLowerCase(), isActive: true }).populate({
      path: 'role',
      select: 'name slug'
    })

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    const viewerId = req.user._id
    const isSelf = targetUser._id.toString() === viewerId.toString()

    let isAdmin = false
    if (!isSelf) {
      const viewer = await User.findById(viewerId).populate('role', 'slug')
      const slug = viewer?.role?.slug
      isAdmin = slug === 'super_admin' || slug === 'admin'
    }

    const friendship = await Friendship.findOne({
      $or: [
        { requester: viewerId, recipient: targetUser._id },
        { requester: targetUser._id, recipient: viewerId }
      ]
    })

    let friendshipStatus = 'none'
    if (isSelf) {
      friendshipStatus = 'self'
    } else if (friendship) {
      if (friendship.status === 'accepted') {
        friendshipStatus = 'friends'
      } else if (friendship.requester.toString() === viewerId.toString()) {
        friendshipStatus = 'pending_sent'
      } else {
        friendshipStatus = 'pending_received'
      }
    }

    const canSeeFullProfile = isSelf || isAdmin || (friendship?.status === 'accepted')

    const baseUser = {
      id: targetUser._id,
      name: targetUser.name,
      username: targetUser.username || null,
      avatar: null,
      role: targetUser.role ? {
        id: targetUser.role._id,
        name: targetUser.role.name,
        slug: targetUser.role.slug
      } : null,
      createdAt: targetUser.createdAt
    }

    if (canSeeFullProfile) {
      const [terrariumCount, animalCount] = await Promise.all([
        Terrarium.countDocuments({ user: targetUser._id, isActive: true }),
        Animal.countDocuments({ user: targetUser._id, isActive: true })
      ])
      const payload = {
        user: baseUser,
        stats: { terrariums: terrariumCount, animals: animalCount },
        isPrivate: false,
        friendshipStatus
      }
      if (friendshipStatus === 'pending_received' && friendship) {
        payload.pendingRequestId = friendship._id
      }
      return res.json({ success: true, data: payload })
    }

    const payload = {
      user: baseUser,
      stats: { terrariums: 0, animals: 0 },
      isPrivate: true,
      friendshipStatus
    }
    if (friendshipStatus === 'pending_received' && friendship) {
      payload.pendingRequestId = friendship._id
    }
    return res.json({ success: true, data: payload })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
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
        updatedAt: user.updatedAt,
        privacySettings: user.privacySettings || {
          profileVisibility: 'public',
          showTerrariums: 'friends_only',
          showAnimals: 'friends_only'
        }
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
    const { name, email, username, privacySettings } = req.body

    const updateData = {}
    if (name) updateData.name = name
    if (email) {
      if (email !== req.user.email) {
        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe una cuenta con este email'
          })
        }
      }
      updateData.email = email.toLowerCase()
    }

    // Validar y actualizar username si se proporciona
    if (username !== undefined && username !== null) {
      const usernameTrim = String(username).trim()
      if (usernameTrim.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'El username debe tener al menos 3 caracteres'
        })
      }
      if (!USERNAME_REGEX.test(usernameTrim)) {
        return res.status(400).json({
          success: false,
          message: 'El username solo puede contener letras, números, guión bajo (_) y guión (-). No se permiten espacios ni símbolos especiales.'
        })
      }
      const usernameLower = usernameTrim.toLowerCase()
      if (usernameLower !== (req.user.username || '').toLowerCase()) {
        const existingUser = await User.findOne({ username: usernameLower })
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe una cuenta con este username'
          })
        }
        updateData.username = usernameLower
      }
    }

    if (privacySettings && typeof privacySettings === 'object') {
      const validEnums = {
        profileVisibility: ['public', 'friends_only', 'private'],
        showTerrariums: ['everyone', 'friends_only', 'private'],
        showAnimals: ['everyone', 'friends_only', 'private']
      }
      for (const key of ['profileVisibility', 'showTerrariums', 'showAnimals']) {
        if (privacySettings[key] != null && validEnums[key]?.includes(privacySettings[key])) {
          updateData[`privacySettings.${key}`] = privacySettings[key]
        }
      }
    }

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
        updatedAt: user.updatedAt,
        privacySettings: user.privacySettings || {
          profileVisibility: 'public',
          showTerrariums: 'friends_only',
          showAnimals: 'friends_only'
        }
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
