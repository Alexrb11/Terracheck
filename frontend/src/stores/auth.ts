import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export interface UserRole {
  id: string
  name: string
  slug: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole | null
  permissions: string[]
  createdAt: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
  }
}

const API_URL = '/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value)
  
  // El usuario es admin si tiene el rol super_admin o tiene permiso access_admin_panel
  const isAdmin = computed(() => {
    if (!user.value) return false
    return user.value.role?.slug === 'super_admin' || 
           user.value.permissions?.includes('access_admin_panel')
  })

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (permissionSlug: string): boolean => {
    if (!user.value?.permissions) return false
    return user.value.permissions.includes(permissionSlug)
  }

  // Verificar si el usuario tiene alguno de los permisos
  const hasAnyPermission = (permissionSlugs: string[]): boolean => {
    if (!user.value?.permissions) return false
    return permissionSlugs.some(slug => user.value!.permissions.includes(slug))
  }

  // Actions
  const login = async (email: string, password: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data: AuthResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al iniciar sesión')
      }

      if (data.data) {
        token.value = data.data.token
        user.value = data.data.user
        localStorage.setItem('token', data.data.token)
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return false
    } finally {
      loading.value = false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      })

      const data: AuthResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al registrar usuario')
      }

      // Auto-login después de registrar
      if (data.data) {
        token.value = data.data.token
        user.value = data.data.user
        localStorage.setItem('token', data.data.token)
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  const fetchCurrentUser = async (): Promise<boolean> => {
    if (!token.value) return false

    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error('Token inválido')
      }

      user.value = data.data
      return true
    } catch {
      // Token inválido, limpiar sesión
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      return false
    }
  }

  const initializeAuth = async () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      await fetchCurrentUser()
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Helper para obtener headers con auth
  const getAuthHeaders = (): HeadersInit => {
    return {
      'Content-Type': 'application/json',
      ...(token.value ? { 'Authorization': `Bearer ${token.value}` } : {})
    }
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Computed
    isAuthenticated,
    isAdmin,
    // Methods
    hasPermission,
    hasAnyPermission,
    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
    initializeAuth,
    clearError,
    getAuthHeaders
  }
})
