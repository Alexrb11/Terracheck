import User from '../models/User.js'
import Friendship from '../models/Friendship.js'
import Terrarium from '../models/Terrarium.js'
import Animal from '../models/Animal.js'

// GET /api/users/profile/:username
export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params
    const requesterId = req.user?._id

    // 1. Buscar usuario objetivo con privacySettings (case insensitive)
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      isActive: true
    }).select('-password -email -role')

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }

    const targetUserId = user._id
    const isSelf = requesterId && requesterId.toString() === targetUserId.toString()

    // Rol del solicitante: admin tiene acceso total (maestro), ignora privacidad
    const requesterRoleSlug = req.user?.role?.slug
    const isAdmin = requesterRoleSlug === 'admin' || requesterRoleSlug === 'super_admin'

    // 2. Determinar estado de amistad
    let friendshipStatus = 'none'
    let friendshipDoc = null
    let isFriend = false

    if (requesterId && !isSelf) {
      friendshipDoc = await Friendship.findOne({
        $or: [
          { requester: requesterId, recipient: targetUserId },
          { requester: targetUserId, recipient: requesterId }
        ]
      })

      if (friendshipDoc) {
        if (friendshipDoc.status === 'accepted') {
          friendshipStatus = 'friends'
          isFriend = true
        } else if (friendshipDoc.status === 'pending') {
          friendshipStatus = friendshipDoc.requester.toString() === requesterId.toString()
            ? 'pending_sent'
            : 'pending_received'
        }
      }
    } else if (isSelf) {
      friendshipStatus = 'self'
      isFriend = true // para lógica de permisos
    }

    // 3. Permiso base (perfil): profileVisibility
    const settings = user.privacySettings || {}
    const profileVisibility = settings.profileVisibility || 'public'
    const showTerrariums = settings.showTerrariums || 'friends_only'
    const showAnimals = settings.showAnimals || 'friends_only'

    const canAccessProfile = isSelf || isAdmin || profileVisibility === 'public' ||
      (profileVisibility === 'friends_only' && isFriend)

    if (!canAccessProfile) {
      return res.status(403).json({ success: false, message: 'Este perfil es privado' })
    }

    // 4. Filtrar datos: quién puede ver terrarios (admin siempre ve todo)
    const canViewTerrariums = isAdmin || isSelf ||
      (showTerrariums === 'everyone') ||
      (showTerrariums === 'friends_only' && isFriend)

    // 5. Filtrar datos: quién puede ver animales (admin siempre ve todo)
    const canViewAnimals = isAdmin || isSelf ||
      (showAnimals === 'everyone') ||
      (showAnimals === 'friends_only' && isFriend)

    // 6. Obtener estadísticas (devolver 0 si no tiene permiso para no filtrar por conteo)
    const [terrariumTotal, animalTotal] = await Promise.all([
      Terrarium.countDocuments({ user: targetUserId, isActive: true }),
      Animal.countDocuments({ user: targetUserId, isActive: true })
    ])
    const terrariumCount = canViewTerrariums ? terrariumTotal : 0
    const animalCount = canViewAnimals ? animalTotal : 0

    // 7. Construir respuesta (no exponer privacySettings al cliente)
    const responseData = {
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        createdAt: user.createdAt,
        role: user.role
      },
      stats: {
        terrariums: terrariumCount,
        animals: animalCount
      },
      friendshipStatus,
      canViewTerrariums,
      canViewAnimals
    }

    if (friendshipStatus === 'pending_received') {
      responseData.pendingRequestId = friendshipDoc._id
    }

    res.json({
      success: true,
      data: responseData
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener perfil', error: error.message })
  }
}
