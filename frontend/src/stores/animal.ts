import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AnimalWithTerrarium {
  _id: string
  name: string
  species: {
    _id: string
    commonName: string
    scientificName: string
    biome: string
    parameters?: {
      tempMin: number
      tempMax: number
      humidityMin: number
      humidityMax: number
      uvIndex: number
    }
    imageUrl?: string
    description?: string
  }
  terrarium: {
    _id: string
    name: string
    type?: string
    biome?: string
    dimensions?: {
      width: number
      height: number
      depth: number
    }
    sensors?: {
      temperature: number | null
      humidity: number | null
    }
  } | null
  sex: 'male' | 'female' | 'unknown'
  birthDate?: string
  weight?: number
  notes?: string
  imageUrl?: string
  createdAt?: string
}

const API_URL = '/api/animals'

// Helper para obtener headers con auth
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export const useAnimalStore = defineStore('animal', () => {
  // State
  const myAnimals = ref<AnimalWithTerrarium[]>([])
  const currentAnimal = ref<AnimalWithTerrarium | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchMyAnimals = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/mine`, {
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener mis animales')
      }

      myAnimals.value = data.data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      myAnimals.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchAnimalById = async (id: string) => {
    loading.value = true
    error.value = null
    currentAnimal.value = null

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener el animal')
      }

      currentAnimal.value = data.data || null
      return data.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      currentAnimal.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  const updateAnimal = async (id: string, animalData: any): Promise<AnimalWithTerrarium | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(animalData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar el animal')
      }

      const updatedAnimal = data.data

      // Actualizar en el estado local
      const index = myAnimals.value.findIndex(a => a._id === id)
      if (index !== -1) {
        myAnimals.value[index] = updatedAnimal
      }

      // Si es el animal actual, actualizarlo también
      if (currentAnimal.value?._id === id) {
        currentAnimal.value = updatedAnimal
      }

      return updatedAnimal
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteAnimal = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar el animal')
      }

      // Eliminar del estado local
      myAnimals.value = myAnimals.value.filter(a => a._id !== id)
      if (currentAnimal.value?._id === id) {
        currentAnimal.value = null
      }

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
    myAnimals,
    currentAnimal,
    loading,
    error,
    // Actions
    fetchMyAnimals,
    fetchAnimalById,
    updateAnimal,
    deleteAnimal,
    clearError
  }
})
