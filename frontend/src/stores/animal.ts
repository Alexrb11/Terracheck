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
  }
  terrarium: {
    _id: string
    name: string
  } | null
  sex: 'male' | 'female' | 'unknown'
  birthDate?: string
  weight?: number
  notes?: string
  imageUrl?: string
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

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    myAnimals,
    loading,
    error,
    // Actions
    fetchMyAnimals,
    clearError
  }
})
