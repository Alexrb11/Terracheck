import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAnimalStore } from './animal'

export interface Animal {
  _id: string
  name: string
  species: {
    _id: string
    commonName: string
    scientificName: string
    biome: 'tropical' | 'desert' | 'temperate'
  }
  sex: 'male' | 'female' | 'unknown'
  birthDate?: string
  weight?: number
  imageUrl?: string
}

export interface Terrarium {
  _id: string
  name: string
  type: 'mesh' | 'glass' | 'hybrid'
  biome: 'tropical' | 'desert' | 'temperate'
  dimensions: {
    width: number
    height: number
    depth: number
  }
  animals: Animal[]
  hasCompatibilityIssue?: boolean
  parameters?: {
    compatibility: {
      isCompatible: boolean
      errors: string[]
    }
    temperature: {
      min: number
      max: number
    }
    humidity: {
      min: number
      max: number
    }
  } | null
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

  const fetchTerrariumById = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener el terrario')
      }

      // Actualizar el terrario en el estado local
      const index = terrariums.value.findIndex(t => t._id === id)
      if (index !== -1) {
        terrariums.value[index] = data.data
      } else {
        // Si no existe, añadirlo
        terrariums.value.push(data.data)
      }

      return data.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return null
    } finally {
      loading.value = false
    }
  }

  const addTerrarium = async (terrarium: {
    name: string
    type: 'mesh' | 'glass' | 'hybrid'
    biome: 'tropical' | 'desert' | 'temperate'
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

  const addAnimalToTerrarium = async (
    terrariumId: string,
    animalData: {
      name: string
      sex: 'male' | 'female' | 'unknown'
      species: string // ID de la especie
      birthDate?: string
      weight?: number
      notes?: string
    }
  ): Promise<{ success: boolean; message?: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/animals', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...animalData,
          terrarium: terrariumId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Capturar warnings de compatibilidad
        if (data.warnings && data.warnings.length > 0) {
          return {
            success: true,
            message: data.warnings.join('. ')
          }
        }
        throw new Error(data.message || 'Error al añadir animal')
      }

      // Refrescar la lista de terrarios para obtener el nuevo animal
      await fetchTerrariums()

      // Verificar si hay warnings
      if (data.warnings && data.warnings.length > 0) {
        return {
          success: true,
          message: data.warnings.join('. ')
        }
      }

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      error.value = message
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const removeAnimalFromTerrarium = async (animalId: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`/api/animals/${animalId}/move`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ terrariumId: null })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al quitar animal del terrario')
      }

      // Sincronizar el estado del animal en animalStore
      const animalStore = useAnimalStore()
      const animalInList = animalStore.myAnimals.find(a => a._id === animalId)
      if (animalInList) {
        animalInList.terrarium = null
      }

      // Refrescar la lista de terrarios
      await fetchTerrariums()
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
    fetchTerrariumById,
    addTerrarium,
    updateTerrarium,
    deleteTerrarium,
    addAnimalToTerrarium,
    removeAnimalFromTerrarium,
    clearError
  }
})
