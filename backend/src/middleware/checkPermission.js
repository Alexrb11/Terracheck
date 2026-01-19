import User from '../models/User.js'

/**
 * Middleware dinámico para verificar permisos basados en base de datos
 * @param {string} permissionSlug - El slug del permiso requerido
 * @returns {Function} Middleware de Express
 */
export const checkPermission = (permissionSlug) => {
  return async (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado. Usuario no autenticado.'
        })
      }

      // Obtener usuario con rol y permisos populados
      const user = await User.findById(req.user._id).populate({
        path: 'role',
        populate: {
          path: 'permissions',
          select: 'slug name'
        }
      })

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado.'
        })
      }

      if (!user.role) {
        return res.status(403).json({
          success: false,
          message: 'El usuario no tiene un rol asignado.'
        })
      }

      // Verificar si el rol tiene el permiso solicitado
      const hasPermission = user.role.permissions?.some(
        p => p.slug === permissionSlug
      )

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. No tienes el permiso requerido.',
          requiredPermission: permissionSlug
        })
      }

      // Adjuntar el rol populado al request para uso posterior
      req.userRole = user.role
      next()
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        error: error.message
      })
    }
  }
}

/**
 * Middleware para verificar si el usuario tiene alguno de los permisos
 * @param {string[]} permissionSlugs - Array de slugs de permisos
 * @returns {Function} Middleware de Express
 */
export const checkAnyPermission = (permissionSlugs) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado. Usuario no autenticado.'
        })
      }

      const user = await User.findById(req.user._id).populate({
        path: 'role',
        populate: {
          path: 'permissions',
          select: 'slug name'
        }
      })

      if (!user || !user.role) {
        return res.status(403).json({
          success: false,
          message: 'El usuario no tiene un rol asignado.'
        })
      }

      const hasAnyPermission = permissionSlugs.some(slug =>
        user.role.permissions?.some(p => p.slug === slug)
      )

      if (!hasAnyPermission) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. No tienes ninguno de los permisos requeridos.',
          requiredPermissions: permissionSlugs
        })
      }

      req.userRole = user.role
      next()
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        error: error.message
      })
    }
  }
}

export default { checkPermission, checkAnyPermission }
