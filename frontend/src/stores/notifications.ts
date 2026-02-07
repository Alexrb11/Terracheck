import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export interface NotificationSender {
  _id: string
  name: string
  username?: string
  avatar?: string | null
}

export interface NotificationActivity {
  _id: string
  type: string
  content?: string
  animal?: {
    _id: string
    name: string
    imageUrl?: string
  }
  terrarium?: {
    _id: string
    name: string
    imageUrl?: string
  }
}

export interface Notification {
  _id: string
  recipient: string
  sender: NotificationSender
  type: 'new_post' | 'like_post' | 'friend_request' | 'friend_accept'
  activity?: NotificationActivity
  isRead: boolean
  createdAt: string
  updatedAt: string
}

const API_URL = '/api/notifications'

export const useNotificationStore = defineStore('notifications', () => {
  const authStore = useAuthStore()

  // State
  const items = ref<Notification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasUnread = computed(() => unreadCount.value > 0)

  // Actions
  const fetchNotifications = async (limit = 20): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}?limit=${limit}`, {
        headers: authStore.getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al obtener notificaciones')
      }

      items.value = data.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Error fetching notifications:', err)
    } finally {
      loading.value = false
    }
  }

  const checkUnread = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/count`, {
        headers: authStore.getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al obtener conteo')
      }

      unreadCount.value = data.data.unreadCount
    } catch (err) {
      console.error('Error checking unread count:', err)
    }
  }

  const markAsRead = async (id: 'all' | string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/${id}/read`, {
        method: 'PUT',
        headers: authStore.getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al marcar como leída')
      }

      // Actualizar el estado local
      if (id === 'all') {
        items.value.forEach(notification => {
          notification.isRead = true
        })
        unreadCount.value = 0
      } else {
        const notification = items.value.find(n => n._id === id)
        if (notification) {
          notification.isRead = true
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
      throw err
    }
  }

  // Helper para obtener texto descriptivo de la notificación
  const getNotificationText = (notification: Notification): string => {
    const senderName = notification.sender.name

    switch (notification.type) {
      case 'new_post':
        return `${senderName} ha publicado una nueva actividad`
      case 'like_post':
        return `A ${senderName} le ha gustado tu publicación`
      case 'friend_request':
        return `${senderName} te ha enviado una solicitud de amistad`
      case 'friend_accept':
        return `${senderName} ha aceptado tu solicitud de amistad`
      default:
        return `${senderName} ha interactuado contigo`
    }
  }

  // Helper para obtener la ruta de navegación
  const getNotificationRoute = (notification: Notification): string => {
    switch (notification.type) {
      case 'new_post':
      case 'like_post':
        return `/feed` // O podría ser una ruta específica de la actividad
      case 'friend_request':
      case 'friend_accept':
        return `/profile/${notification.sender.username || notification.sender._id}`
      default:
        return '/feed'
    }
  }

  // Inicializar (cargar conteo de no leídas)
  const initialize = async (): Promise<void> => {
    if (authStore.isAuthenticated) {
      await checkUnread()
    }
  }

  // Limpiar estado al cerrar sesión
  const reset = (): void => {
    items.value = []
    unreadCount.value = 0
    error.value = null
  }

  return {
    // State
    items,
    unreadCount,
    loading,
    error,
    // Computed
    hasUnread,
    // Actions
    fetchNotifications,
    checkUnread,
    markAsRead,
    getNotificationText,
    getNotificationRoute,
    initialize,
    reset
  }
})
