import User from '../models/User.js'
import Role from '../models/Role.js'
import Terrarium from '../models/Terrarium.js'
import Animal from '../models/Animal.js'

/**
 * GET /api/admin/users
 * Lista todos los usuarios con paginación
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const search = req.query.search || ''
    const roleFilter = req.query.role || ''

    // Construir query
    const query = {}
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (roleFilter) {
      query.role = roleFilter
    }

    // Ejecutar query con paginación
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate('role', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ])

    // Obtener estadísticas adicionales para cada usuario
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const terrariumCount = await Terrarium.countDocuments({ 
          user: user._id, 
          isActive: true 
        })
        const animalCount = await Animal.countDocuments({ 
          terrarium: { 
            $in: await Terrarium.find({ user: user._id }).select('_id') 
          },
          isActive: true 
        })

        return {
          ...user.toObject(),
          stats: {
            terrariums: terrariumCount,
            animals: animalCount
          }
        }
      })
    )

    res.json({
      success: true,
      data: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    })
  }
}

/**
 * GET /api/admin/users/:id
 * Obtiene un usuario específico con sus datos completos
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('role', 'name slug permissions')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    // Obtener terrarios y todos los animales del usuario (no solo los asignados a terrario)
    const terrariums = await Terrarium.find({ user: user._id, isActive: true })
    const animals = await Animal.find({ user: user._id, isActive: true })
      .populate('species', 'commonName scientificName')

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        terrariums,
        animals
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    })
  }
}

/**
 * PATCH /api/admin/users/:id/role
 * Cambia el rol de un usuario
 */
export const updateUserRole = async (req, res) => {
  try {
    const { role: roleId } = req.body
    const userId = req.params.id

    // Validar que se proporcionó un rol
    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: 'El rol es requerido'
      })
    }

    // Validar que el rol exista
    const role = await Role.findById(roleId)
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Rol no válido'
      })
    }

    // Evitar que un admin se quite el rol a sí mismo
    const currentUser = await User.findById(userId).populate('role')
    if (req.user._id.toString() === userId && currentUser.role?.slug === 'super_admin') {
      return res.status(400).json({
        success: false,
        message: 'No puedes cambiar tu propio rol de Super Admin'
      })
    }

    const user = await User.findById(userId).populate('role')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    // Guardar rol anterior para el log
    const previousRole = user.role?.name || 'Sin rol'

    user.role = roleId
    await user.save()
    await user.populate('role', 'name slug')

    res.json({
      success: true,
      message: `Rol actualizado de ${previousRole} a ${role.name}`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: {
          id: user.role._id,
          name: user.role.name,
          slug: user.role.slug
        },
        previousRole
      }
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
 * PATCH /api/admin/users/:id/status
 * Activa o desactiva un usuario
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body
    const userId = req.params.id

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive debe ser un booleano'
      })
    }

    // Evitar que un admin se desactive a sí mismo
    if (req.user._id.toString() === userId && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivar tu propia cuenta'
      })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password').populate('role', 'name slug')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    res.json({
      success: true,
      message: isActive ? 'Usuario activado' : 'Usuario desactivado',
      data: user
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado del usuario',
      error: error.message
    })
  }
}

/**
 * DELETE /api/admin/users/:id
 * Elimina un usuario y opcionalmente sus datos asociados
 */
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id
    const { cascade } = req.query // ?cascade=true para eliminar datos asociados

    // Evitar que un admin se elimine a sí mismo
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta desde el panel de admin'
      })
    }

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    let deletedData = {
      terrariums: 0,
      animals: 0
    }

    if (cascade === 'true') {
      // Obtener terrarios del usuario
      const terrariums = await Terrarium.find({ user: userId })
      const terrariumIds = terrariums.map(t => t._id)

      // Eliminar animales de esos terrarios
      const animalsResult = await Animal.deleteMany({ terrarium: { $in: terrariumIds } })
      deletedData.animals = animalsResult.deletedCount

      // Eliminar terrarios
      const terrariumsResult = await Terrarium.deleteMany({ user: userId })
      deletedData.terrariums = terrariumsResult.deletedCount
    }

    // Eliminar usuario
    await User.findByIdAndDelete(userId)

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente',
      data: {
        deletedUser: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        cascade: cascade === 'true',
        deletedData
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    })
  }
}

/**
 * GET /api/admin/stats
 * Obtiene estadísticas generales del sistema
 */
export const getSystemStats = async (req, res) => {
  try {
    // Obtener rol de super admin para contar admins
    const superAdminRole = await Role.findOne({ slug: 'super_admin' })

    const [
      totalUsers,
      activeUsers,
      adminUsers,
      totalTerrariums,
      totalAnimals,
      totalSpecies,
      totalRoles
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      superAdminRole ? User.countDocuments({ role: superAdminRole._id }) : 0,
      Terrarium.countDocuments({ isActive: true }),
      Animal.countDocuments({ isActive: true }),
      (await import('../models/Species.js')).default.countDocuments(),
      Role.countDocuments()
    ])

    // Usuarios registrados en los últimos 30 días
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          newLast30Days: newUsers
        },
        terrariums: totalTerrariums,
        animals: totalAnimals,
        species: totalSpecies,
        roles: totalRoles
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    })
  }
}
