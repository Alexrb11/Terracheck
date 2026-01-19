import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'terrarium-keeper-secret-key-2024'

/**
 * Middleware de protección de rutas
 * Verifica el token JWT y adjunta el usuario a req.user
 */
export const protect = async (req, res, next) => {
  try {
    let token

    // Verificar si existe el header Authorization con formato Bearer
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    // Verificar si existe token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token no proporcionado.'
      })
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, JWT_SECRET)

      // Buscar usuario por ID del token
      const user = await User.findById(decoded.id).select('-password')

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado. Usuario no encontrado.'
        })
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado. Cuenta desactivada.'
        })
      }

      // Adjuntar usuario a la request
      req.user = user
      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token inválido o expirado.'
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor de autenticación',
      error: error.message
    })
  }
}

/**
 * Genera un token JWT para un usuario
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    JWT_SECRET,
    { expiresIn: '30d' } // Token válido por 30 días
  )
}

export default { protect, generateToken }
