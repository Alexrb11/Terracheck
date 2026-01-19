import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export interface Permission {
  _id: string
  name: string
  slug: string
  description: string
  category: string
}

export interface Role {
  _id: string
  name: string
  slug: string
  description: string
  permissions: Permission[]
  isSystem: boolean
  userCount?: number
  createdAt: string
  updatedAt: string
}

export interface GroupedPermissions {
  [category: string]: Permission[]
}

const API_URL = '/api/admin/roles'

export const useRolesStore = defineStore('roles', () => {
  const authStore = useAuthStore()
  
  // State
  const roles = ref<Role[]>([])
  const permissions = ref<Permission[]>([])
  const groupedPermissions = ref<GroupedPermissions>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const systemRoles = computed(() => roles.value.filter(r => r.isSystem))
  const customRoles = computed(() => roles.value.filter(r => !r.isSystem))

  // Actions
  const fetchRoles = async (): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(API_URL, {
        headers: authStore.getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al obtener roles')
      }

      roles.value = data.data
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchPermissions = async (): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/permissions`, {
        headers: authStore.getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al obtener permisos')
      }

      permissions.value = data.data
      groupedPermissions.value = data.grouped || {}
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return false
    } finally {
      loading.value = false
    }
  }

  const createRole = async (roleData: {
    name: string
    description?: string
    permissions?: string[]
  }): Promise<Role | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: authStore.getAuthHeaders(),
        body: JSON.stringify(roleData)
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al crear rol')
      }

      // Actualizar lista local
      await fetchRoles()
      return data.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateRole = async (
    roleId: string,
    roleData: {
      name?: string
      description?: string
      permissions?: string[]
    }
  ): Promise<Role | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/${roleId}`, {
        method: 'PUT',
        headers: authStore.getAuthHeaders(),
        body: JSON.stringify(roleData)
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al actualizar rol')
      }

      // Actualizar lista local
      await fetchRoles()
      return data.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteRole = async (roleId: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/${roleId}`, {
        method: 'DELETE',
        headers: authStore.getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al eliminar rol')
      }

      // Actualizar lista local
      await fetchRoles()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return false
    } finally {
      loading.value = false
    }
  }

  const getRoleById = (roleId: string): Role | undefined => {
    return roles.value.find(r => r._id === roleId)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    roles,
    permissions,
    groupedPermissions,
    loading,
    error,
    // Computed
    systemRoles,
    customRoles,
    // Actions
    fetchRoles,
    fetchPermissions,
    createRole,
    updateRole,
    deleteRole,
    getRoleById,
    clearError
  }
})
