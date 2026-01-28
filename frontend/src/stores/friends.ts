import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_URL = '/api/friends'

export interface FriendItem {
  id: string
  userId: string
  name: string
  username?: string | null
  friendshipId?: string
  requestId?: string
  createdAt?: string
}

function getAuthHeaders (): HeadersInit {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

export const useFriendsStore = defineStore('friends', () => {
  const friends = ref<FriendItem[]>([])
  const incomingRequests = ref<FriendItem[]>([])
  const outgoingRequests = ref<FriendItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const hasIncoming = computed(() => incomingRequests.value.length > 0)

  async function fetchStatus () {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API_URL}/status`, { headers: getAuthHeaders() })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al cargar amistades')
      }
      friends.value = data.data.friends || []
      incomingRequests.value = data.data.incomingRequests || []
      outgoingRequests.value = data.data.outgoingRequests || []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido'
      friends.value = []
      incomingRequests.value = []
      outgoingRequests.value = []
    } finally {
      loading.value = false
    }
  }

  async function sendRequest (userId: string): Promise<{ ok: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_URL}/request/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        return { ok: false, message: data.message || 'Error al enviar solicitud' }
      }
      await fetchStatus()
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : 'Error al enviar' }
    }
  }

  async function acceptRequest (requestId: string): Promise<{ ok: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_URL}/accept/${requestId}`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        return { ok: false, message: data.message || 'Error al aceptar' }
      }
      await fetchStatus()
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : 'Error al aceptar' }
    }
  }

  async function rejectRequest (requestId: string): Promise<{ ok: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_URL}/reject/${requestId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        return { ok: false, message: data.message || 'Error al rechazar' }
      }
      await fetchStatus()
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : 'Error al rechazar' }
    }
  }

  async function removeFriend (userId: string): Promise<{ ok: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_URL}/remove/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        return { ok: false, message: data.message || 'Error al eliminar' }
      }
      await fetchStatus()
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : 'Error al eliminar' }
    }
  }

  async function searchUsers (q: string): Promise<{ id: string; name: string; username: string | null }[]> {
    if (!q || q.length < 2) return []
    try {
      const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(q)}`, {
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (!res.ok || !data.success) return []
      return data.data || []
    } catch {
      return []
    }
  }

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    loading,
    error,
    hasIncoming,
    fetchStatus,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    searchUsers
  }
})
