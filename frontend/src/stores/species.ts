import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SpeciesParameters {
  tempMin: number
  tempMax: number
  humidityMin: number
  humidityMax: number
  uvIndex: number
}

export interface SpeciesRequirements {
  minLiters: number
  minHeight: number
  arboreal: boolean
}

export interface Species {
  _id: string
  scientificName: string
  commonName: string
  family: string
  biome: 'tropical' | 'desert' | 'temperate'
  parameters: SpeciesParameters
  requirements: SpeciesRequirements
  compatibility: string[]
  description?: string
  imageUrl?: string
  isActive: boolean
}

const API_URL = '/api/species'

// Helper para obtener headers con auth
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export const useSpeciesStore = defineStore('species', () => {
  // State
  const species = ref<Species[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchSpecies = async () => {
    // Si ya tenemos especies cargadas, no recargar
    if (species.value.length > 0) return

    loading.value = true
    error.value = null

    try {
      const response = await fetch(API_URL, {
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener especies')
      }

      species.value = data.data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      species.value = []
    } finally {
      loading.value = false
    }
  }

  const getSpeciesById = (id: string) => {
    return species.value.find(s => s._id === id)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    species,
    loading,
    error,
    // Actions
    fetchSpecies,
    getSpeciesById,
    clearError
  }
})
