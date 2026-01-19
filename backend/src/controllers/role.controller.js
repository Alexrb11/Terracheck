import Role from '../models/Role.js'
import Permission from '../models/Permission.js'
import User from '../models/User.js'

// ============== PERMISOS ==============

/**
 * GET /api/admin/roles/permissions
 * Lista todos los permisos disponibles
 */
export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find({ isActive: true })
      .sort({ category: 1, name: 1 })

    // Agrupar por categoría para el frontend
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = []
      }
      acc[perm.category].push(perm)
      return acc
    }, {})

    res.json({
      success: true,
      data: permissions,
      grouped
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener permisos',
      error: error.message
    })
  }
}

/**
 * POST /api/admin/roles/permissions
 * Crea un nuevo permiso (solo para desarrollo/admin avanzado)
 */
export const createPermission = async (req, res) => {
  try {
    const { name, slug, description, category } = req.body

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y slug son requeridos'
      })
    }

    const existingPermission = await Permission.findOne({ slug })
    if (existingPermission) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un permiso con ese slug'
      })
    }

    const permission = await Permission.create({
      name,
      slug,
      description,
      category: category || 'general'
    })

    res.status(201).json({
      success: true,
      message: 'Permiso creado exitosamente',
      data: permission
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear permiso',
      error: error.message
    })
  }
}

// ============== ROLES ==============

/**
 * GET /api/admin/roles
 * Lista todos los roles con sus permisos
 */
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find()
      .populate('permissions', 'name slug category')
      .sort({ isSystem: -1, name: 1 })

    // Obtener conteo de usuarios por rol
    const rolesWithCount = await Promise.all(
      roles.map(async (role) => {
        const userCount = await User.countDocuments({ role: role._id })
        return {
          ...role.toObject(),
          userCount
        }
      })
    )

    res.json({
      success: true,
      data: rolesWithCount
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener roles',
      error: error.message
    })
  }
}

/**
 * GET /api/admin/roles/:id
 * Obtiene un rol específico
 */
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate('permissions', 'name slug description category')

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      })
    }

    const userCount = await User.countDocuments({ role: role._id })

    res.json({
      success: true,
      data: {
        ...role.toObject(),
        userCount
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener rol',
      error: error.message
    })
  }
}

/**
 * POST /api/admin/roles
 * Crea un nuevo rol
 */
export const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del rol es requerido'
      })
    }

    // Generar slug desde el nombre
    const slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '')

    // Verificar unicidad
    const existingRole = await Role.findOne({ 
      $or: [{ name }, { slug }] 
    })
    
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un rol con ese nombre'
      })
    }

    // Validar que los permisos existan
    if (permissions && permissions.length > 0) {
      const validPermissions = await Permission.find({
        _id: { $in: permissions }
      })
      
      if (validPermissions.length !== permissions.length) {
        return res.status(400).json({
          success: false,
          message: 'Algunos permisos no son válidos'
        })
      }
    }

    const role = await Role.create({
      name,
      slug,
      description,
      permissions: permissions || [],
      isSystem: false // Los roles creados por API nunca son de sistema
    })

    await role.populate('permissions', 'name slug category')

    res.status(201).json({
      success: true,
      message: 'Rol creado exitosamente',
      data: role
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear rol',
      error: error.message
    })
  }
}

/**
 * PUT /api/admin/roles/:id
 * Actualiza un rol existente
 */
export const updateRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body
    const roleId = req.params.id

    const role = await Role.findById(roleId)

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      })
    }

    // Validar que los permisos existan
    if (permissions && permissions.length > 0) {
      const validPermissions = await Permission.find({
        _id: { $in: permissions }
      })
      
      if (validPermissions.length !== permissions.length) {
        return res.status(400).json({
          success: false,
          message: 'Algunos permisos no son válidos'
        })
      }
    }

    // Actualizar campos
    if (name) {
      // Verificar unicidad del nombre
      const existingRole = await Role.findOne({ 
        name, 
        _id: { $ne: roleId } 
      })
      
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro rol con ese nombre'
        })
      }
      
      role.name = name
      // Solo actualizar slug si no es de sistema
      if (!role.isSystem) {
        role.slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '')
      }
    }

    if (description !== undefined) {
      role.description = description
    }

    if (permissions !== undefined) {
      role.permissions = permissions
    }

    await role.save()
    await role.populate('permissions', 'name slug category')

    res.json({
      success: true,
      message: 'Rol actualizado exitosamente',
      data: role
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar rol',
      error: error.message
    })
  }
}

/**
 * DELETE /api/admin/roles/:id
 * Elimina un rol
 */
export const deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id

    const role = await Role.findById(roleId)

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      })
    }

    // No permitir eliminar roles de sistema
    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un rol de sistema'
      })
    }

    // Verificar si hay usuarios con este rol
    const userCount = await User.countDocuments({ role: roleId })
    
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar. Hay ${userCount} usuario(s) con este rol asignado.`,
        userCount
      })
    }

    await Role.findByIdAndDelete(roleId)

    res.json({
      success: true,
      message: 'Rol eliminado exitosamente',
      data: {
        id: role._id,
        name: role.name
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar rol',
      error: error.message
    })
  }
}
