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
  gallery?: string[]
  createdAt?: string
}

const API_URL = '/api/animals'

// Helper para obtener headers con auth
const getAuthHeaders = (includeContentType = true): HeadersInit => {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = {}
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
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

  // Subir imagen de perfil
  const uploadProfileImage = async (id: string, file: File): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('image', file)

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/${id}/profile-image`, {
        method: 'PUT',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al subir la imagen de perfil')
      }

      // Actualizar el animal en el estado local
      const updatedAnimal = data.data
      const index = myAnimals.value.findIndex(a => a._id === id)
      if (index !== -1) {
        myAnimals.value[index].imageUrl = updatedAnimal.imageUrl
      }

      if (currentAnimal.value?._id === id) {
        currentAnimal.value.imageUrl = updatedAnimal.imageUrl
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return false
    } finally {
      loading.value = false
    }
  }

  // Añadir imágenes a la galería
  const addToGallery = async (id: string, files: FileList | File[]): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const formData = new FormData()
      const fileArray = Array.from(files)
      
      fileArray.forEach(file => {
        formData.append('images', file)
      })

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/${id}/gallery`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al añadir imágenes a la galería')
      }

      // Actualizar el animal en el estado local
      const updatedGallery = data.data.gallery
      const index = myAnimals.value.findIndex(a => a._id === id)
      if (index !== -1) {
        myAnimals.value[index].gallery = updatedGallery
      }

      if (currentAnimal.value?._id === id) {
        currentAnimal.value.gallery = updatedGallery
      }

      // Recargar el animal completo para tener todos los datos actualizados
      await fetchAnimalById(id)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return false
    } finally {
      loading.value = false
    }
  }

  // Eliminar imagen de la galería
  const removeFromGallery = async (id: string, imageUrl: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_URL}/${id}/gallery/remove`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ imageUrl })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar la imagen de la galería')
      }

      // Actualizar el animal en el estado local
      const updatedGallery = data.data.gallery
      const index = myAnimals.value.findIndex(a => a._id === id)
      if (index !== -1) {
        myAnimals.value[index].gallery = updatedGallery
      }

      if (currentAnimal.value?._id === id) {
        currentAnimal.value.gallery = updatedGallery
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return false
    } finally {
      loading.value = false
    }
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
    uploadProfileImage,
    addToGallery,
    removeFromGallery,
    clearError
  }
})
