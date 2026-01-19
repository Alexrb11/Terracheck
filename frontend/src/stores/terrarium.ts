import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Animal {
  _id: string
  name: string
  species: {
    _id: string
    commonName: string
    scientificName: string
    biome: string
  }
  sex: 'male' | 'female' | 'unknown'
  birthDate?: string
  weight?: number
}

export interface Terrarium {
  _id: string
  name: string
  type: 'mesh' | 'glass' | 'hybrid'
  dimensions: {
    width: number
    height: number
    depth: number
  }
  sensors?: {
    temperature: number | null
    humidity: number | null
    lastUpdated?: string
  }
  animals: Animal[]
  hasCompatibilityIssue?: boolean
  liters?: number
  notes?: string
}

const API_URL = '/api/terrariums'

// Helper para obtener headers con auth
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export const useTerrariumStore = defineStore('terrarium', () => {
  // State
  const terrariums = ref<Terrarium[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const getTerrariumById = computed(() => {
    return (id: string) => terrariums.value.find(t => t._id === id)
  })

  // Actions
  const fetchTerrariums = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(API_URL, {
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener terrarios')
      }

      terrariums.value = data.data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      terrariums.value = []
    } finally {
      loading.value = false
    }
  }

  const addTerrarium = async (terrarium: {
    name: string
    type: 'mesh' | 'glass' | 'hybrid'
    dimensions: { width: number; height: number; depth: number }
    notes?: string
  }) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(terrarium)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear terrario')
      }

      // Refrescar la lista
      await fetchTerrariums()
      return data.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateTerrarium = async (id: string, updates: Partial<Terrarium>) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar terrario')
      }

      // Actualizar en el estado local
      const index = terrariums.value.findIndex(t => t._id === id)
      if (index !== -1) {
        terrariums.value[index] = { ...terrariums.value[index], ...data.data }
      }

      return data.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteTerrarium = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar terrario')
      }

      // Eliminar del estado local
      terrariums.value = terrariums.value.filter(t => t._id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return false
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    terrariums,
    loading,
    error,
    // Computed
    getTerrariumById,
    // Actions
    fetchTerrariums,
    addTerrarium,
    updateTerrarium,
    deleteTerrarium,
    clearError
  }
})
