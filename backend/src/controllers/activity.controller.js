import Activity from '../models/Activity.js'
import Friendship from '../models/Friendship.js'
import User from '../models/User.js'

// GET /api/activities - Obtener feed de actividades
export const getFeed = async (req, res) => {
  try {
    const userId = req.user._id
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    // 1. Buscar amigos aceptados
    const friendships = await Friendship.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    })

    // Extraer IDs de amigos
    const friendIds = friendships.map(friendship => 
      friendship.requester.toString() === userId.toString() 
        ? friendship.recipient 
        : friendship.requester
    )

    // 2. Buscar usuarios públicos
    const publicUsers = await User.find({
      'privacySettings.profileVisibility': 'public',
      isActive: true,
      _id: { $ne: userId } // Excluir al usuario actual
    }).select('_id')

    const publicUserIds = publicUsers.map(user => user._id)

    // 3. Construir lista de usuarios visibles: yo + amigos + públicos
    const visibleUserIds = [userId, ...friendIds, ...publicUserIds]

    // 4. Buscar actividades de usuarios visibles
    const activities = await Activity.find({
      user: { $in: visibleUserIds },
      isActive: true
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name username email privacySettings')
      .populate({
        path: 'animal',
        select: 'name imageUrl species user',
        populate: { path: 'species', select: 'commonName scientificName' }
      })
      .populate({
        path: 'terrarium',
        select: 'name imageUrl biome user'
      })

    // 5. Filtrar actividades respetando privacidad de terrarios/animales
    const filteredActivities = activities.filter(activity => {
      // Si la actividad es del propio usuario, siempre mostrarla
      if (activity.user._id.toString() === userId.toString()) {
        return true
      }

      // Verificar si el usuario de la actividad es amigo
      const isActivityUserFriend = friendIds.some(
        friendId => friendId.toString() === activity.user._id.toString()
      )

      // Si la actividad involucra un animal
      if (activity.animal) {
        const animalOwnerSettings = activity.user.privacySettings

        // Si el dueño del animal no es público y no es amigo, ocultar
        if (!isActivityUserFriend && animalOwnerSettings.showAnimals !== 'everyone') {
          return false
        }
      }

      // Si la actividad involucra un terrario
      if (activity.terrarium) {
        const terrariumOwnerSettings = activity.user.privacySettings

        // Si el dueño del terrario no es público y no es amigo, ocultar
        if (!isActivityUserFriend && terrariumOwnerSettings.showTerrariums !== 'everyone') {
          return false
        }
      }

      return true
    })

    // 6. Contar total de actividades (para paginación)
    const total = await Activity.countDocuments({
      user: { $in: visibleUserIds },
      isActive: true
    })

    res.json({
      success: true,
      data: filteredActivities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error al obtener feed:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener el feed de actividades',
      error: error.message
    })
  }
}

// POST /api/activities/:id/like - Dar like a una actividad
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const activity = await Activity.findById(id)

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      })
    }

    // Verificar si ya dio like
    const likeIndex = activity.likes.findIndex(
      like => like.toString() === userId.toString()
    )

    if (likeIndex > -1) {
      // Quitar like
      activity.likes.splice(likeIndex, 1)
    } else {
      // Agregar like
      activity.likes.push(userId)
    }

    await activity.save()

    res.json({
      success: true,
      data: activity,
      message: likeIndex > -1 ? 'Like eliminado' : 'Like agregado'
    })
  } catch (error) {
    console.error('Error al dar like:', error)
    res.status(500).json({
      success: false,
      message: 'Error al procesar el like',
      error: error.message
    })
  }
}

// DELETE /api/activities/:id - Eliminar una actividad (solo el propietario)
export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const activity = await Activity.findById(id)

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      })
    }

    // Solo el propietario puede eliminar
    if (activity.user.toString() !== userId.toString()) {
      // Verificar si es admin
      const userWithRole = await User.findById(userId).populate('role', 'slug')
      const roleSlug = userWithRole.role?.slug
      
      if (roleSlug !== 'admin' && roleSlug !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar esta actividad'
        })
      }
    }

    // Soft delete
    activity.isActive = false
    await activity.save()

    res.json({
      success: true,
      message: 'Actividad eliminada correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar actividad:', error)
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la actividad',
      error: error.message
    })
  }
}
