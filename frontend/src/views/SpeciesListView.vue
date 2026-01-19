<template>
  <div class="min-h-screen pb-20 md:pb-0 bg-stone-50">
    <Navigation />

    <main class="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <!-- Header -->
      <div class="mb-6 md:mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
          Catálogo de Especies
        </h1>
        <p class="text-slate-600 text-lg">
          Explora las especies disponibles y sus requerimientos
        </p>
      </div>

      <!-- Loading -->
      <div v-if="speciesStore.loading" class="flex items-center justify-center py-16">
        <LoaderIcon :size="48" class="text-emerald-600 animate-spin" />
      </div>

      <!-- Error -->
      <div
        v-else-if="speciesStore.error"
        class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
      >
        <AlertCircleIcon :size="48" class="text-red-500 mx-auto mb-4" />
        <p class="text-red-700">{{ speciesStore.error }}</p>
        <button
          @click="speciesStore.fetchSpecies()"
          class="mt-4 px-6 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>

      <!-- Grid de Especies -->
      <div
        v-else-if="speciesStore.species.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="species in speciesStore.species"
          :key="species._id"
          class="bg-white rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
        >
          <!-- Imagen -->
          <div class="aspect-video relative overflow-hidden bg-stone-200">
            <img
              v-if="species.imageUrl"
              :src="species.imageUrl"
              :alt="species.commonName"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center"
            >
              <FishIcon :size="64" class="text-stone-400" />
            </div>
            
            <!-- Badge Bioma -->
            <div class="absolute top-3 right-3">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold shadow-md',
                  species.biome === 'Tropical' 
                    ? 'bg-emerald-500 text-white' 
                    : species.biome === 'Arid' 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-blue-500 text-white'
                ]"
              >
                {{ getBiomeLabel(species.biome) }}
              </span>
            </div>
          </div>

          <!-- Contenido -->
          <div class="p-5">
            <!-- Nombre -->
            <h3 class="text-xl font-bold text-slate-800 mb-1">
              {{ species.commonName }}
            </h3>
            <p class="text-slate-500 italic text-sm mb-3">
              {{ species.scientificName }}
            </p>

            <!-- Descripción -->
            <p class="text-slate-600 text-sm mb-4 line-clamp-2">
              {{ species.description || 'Sin descripción disponible.' }}
            </p>

            <!-- Badges -->
            <div class="flex flex-wrap gap-2 mb-4">
              <!-- Nivel -->
              <span
                :class="[
                  'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                  getDifficultyLevel(species) === 'Principiante'
                    ? 'bg-green-100 text-green-700'
                    : getDifficultyLevel(species) === 'Intermedio'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                ]"
              >
                <StarIcon :size="12" />
                {{ getDifficultyLevel(species) }}
              </span>

              <!-- Arborícola -->
              <span
                v-if="species.requirements.arboreal"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700"
              >
                <TreePineIcon :size="12" />
                Arborícola
              </span>

              <!-- UV -->
              <span
                v-if="species.parameters.uvIndex > 0"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-700"
              >
                <SunIcon :size="12" />
                UV {{ species.parameters.uvIndex }}
              </span>
            </div>

            <!-- Parámetros -->
            <div class="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
              <div class="flex items-center gap-2">
                <ThermometerIcon :size="16" class="text-amber-500" />
                <span class="text-xs text-slate-600">
                  {{ species.parameters.tempMin }}-{{ species.parameters.tempMax }}°C
                </span>
              </div>
              <div class="flex items-center gap-2">
                <DropletIcon :size="16" class="text-blue-500" />
                <span class="text-xs text-slate-600">
                  {{ species.parameters.humidityMin }}-{{ species.parameters.humidityMax }}%
                </span>
              </div>
              <div class="flex items-center gap-2">
                <BoxIcon :size="16" class="text-slate-400" />
                <span class="text-xs text-slate-600">
                  Min {{ species.requirements.minLiters }}L
                </span>
              </div>
              <div class="flex items-center gap-2">
                <RulerIcon :size="16" class="text-slate-400" />
                <span class="text-xs text-slate-600">
                  Altura {{ species.requirements.minHeight }}cm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <div class="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <FishIcon :size="48" class="text-emerald-600" />
        </div>
        <h3 class="text-xl font-semibold text-slate-800 mb-2">
          No hay especies disponibles
        </h3>
        <p class="text-slate-600">El catálogo de especies está vacío</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSpeciesStore, type Species } from '@/stores/species'
import Navigation from '@/components/Navigation.vue'
import {
  LoaderIcon,
  AlertCircleIcon,
  FishIcon,
  ThermometerIcon,
  DropletIcon,
  BoxIcon,
  RulerIcon,
  StarIcon,
  TreePineIcon,
  SunIcon
} from 'lucide-vue-next'

const speciesStore = useSpeciesStore()

const getBiomeLabel = (biome: string): string => {
  const labels: Record<string, string> = {
    'Tropical': 'Tropical',
    'Arid': 'Desierto',
    'Temperate': 'Templado'
  }
  return labels[biome] || biome
}

const getDifficultyLevel = (species: Species): string => {
  // Calcular dificultad basándose en los requerimientos
  const uvRequirement = species.parameters.uvIndex
  const humidityRange = species.parameters.humidityMax - species.parameters.humidityMin
  const tempRange = species.parameters.tempMax - species.parameters.tempMin
  const sizeRequirement = species.requirements.minLiters

  let score = 0

  // UV alto = más difícil
  if (uvRequirement >= 8) score += 2
  else if (uvRequirement >= 4) score += 1

  // Humedad alta requerida = más difícil
  if (species.parameters.humidityMin >= 70) score += 1

  // Rango de temp estrecho = más difícil
  if (tempRange <= 5) score += 1

  // Tamaño grande = más difícil
  if (sizeRequirement >= 150) score += 1

  if (score <= 1) return 'Principiante'
  if (score <= 2) return 'Intermedio'
  return 'Avanzado'
}

onMounted(() => {
  speciesStore.fetchSpecies()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
