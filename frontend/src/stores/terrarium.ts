import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Animal {
  id: string
  name: string
  species: string
  gender: 'male' | 'female' | 'unknown'
  avatar?: string
}

export interface Terrarium {
  id: string
  name: string
  type: 'mesh' | 'glass'
  temperature: number
  humidity: number
  width: number
  height: number
  depth: number
  animals: Animal[]
  hasCompatibilityIssue?: boolean
}

export const useTerrariumStore = defineStore('terrarium', () => {
  const terrariums = ref<Terrarium[]>([
    {
      id: '1',
      name: 'Terrario Desierto',
      type: 'glass',
      temperature: 28,
      humidity: 30,
      width: 60,
      height: 40,
      depth: 30,
      animals: [
        {
          id: 'a1',
          name: 'Leo',
          species: 'Gecko Leopardo',
          gender: 'male'
        }
      ],
      hasCompatibilityIssue: false
    },
    {
      id: '2',
      name: 'Terrario Selva',
      type: 'glass',
      temperature: 24,
      humidity: 80,
      width: 80,
      height: 60,
      depth: 40,
      animals: [
        {
          id: 'a2',
          name: 'Verde',
          species: 'Rana Dardo',
          gender: 'female'
        },
        {
          id: 'a3',
          name: 'Azul',
          species: 'Rana Dardo',
          gender: 'female'
        }
      ],
      hasCompatibilityIssue: false
    },
    {
      id: '3',
      name: 'Terrario Tropical',
      type: 'mesh',
      temperature: 26,
      humidity: 70,
      width: 100,
      height: 50,
      depth: 50,
      animals: [
        {
          id: 'a4',
          name: 'Rex',
          species: 'Gecko Leopardo',
          gender: 'male'
        },
        {
          id: 'a5',
          name: 'Max',
          species: 'Gecko Leopardo',
          gender: 'male'
        }
      ],
      hasCompatibilityIssue: true // Dos machos juntos
    }
  ])

  const getTerrariumById = computed(() => {
    return (id: string) => terrariums.value.find(t => t.id === id)
  })

  const addTerrarium = (terrarium: Omit<Terrarium, 'id'>) => {
    const newTerrarium: Terrarium = {
      ...terrarium,
      id: Date.now().toString()
    }
    terrariums.value.push(newTerrarium)
    return newTerrarium
  }

  const updateTerrarium = (id: string, updates: Partial<Terrarium>) => {
    const index = terrariums.value.findIndex(t => t.id === id)
    if (index !== -1) {
      terrariums.value[index] = { ...terrariums.value[index], ...updates }
    }
  }

  const deleteTerrarium = (id: string) => {
    const index = terrariums.value.findIndex(t => t.id === id)
    if (index !== -1) {
      terrariums.value.splice(index, 1)
    }
  }

  return {
    terrariums,
    getTerrariumById,
    addTerrarium,
    updateTerrarium,
    deleteTerrarium
  }
})
