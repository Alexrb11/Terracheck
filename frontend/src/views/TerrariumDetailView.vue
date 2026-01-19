<template>
  <div class="min-h-screen pb-20 md:pb-0">
    <Navigation />

    <main class="max-w-4xl mx-auto px-4 py-6">
      <div v-if="terrarium" class="space-y-6">
        <!-- Botón volver -->
        <button
          @click="$router.push('/')"
          class="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors mb-4"
        >
          <ArrowLeftIcon :size="20" />
          <span class="font-medium">Volver</span>
        </button>

        <!-- Header del Terrario -->
        <div class="bg-white rounded-3xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-3xl font-bold text-slate-800">{{ terrarium.name }}</h1>
            <component
              :is="terrarium.type === 'glass' ? SquareIcon : Grid3x3Icon"
              :size="40"
              class="text-emerald-600"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl">
              <ThermometerIcon :size="24" class="text-amber-500" />
              <div>
                <p class="text-xs text-slate-500">Temperatura</p>
                <p class="text-xl font-semibold text-slate-800">
                  {{ terrarium.temperature }}°C
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl">
              <DropletIcon :size="24" class="text-blue-500" />
              <div>
                <p class="text-xs text-slate-500">Humedad</p>
                <p class="text-xl font-semibold text-slate-800">
                  {{ terrarium.humidity }}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Animales -->
        <div class="bg-white rounded-3xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-slate-800 mb-4">Animales</h2>
          <div class="space-y-3">
            <div
              v-for="animal in terrarium.animals"
              :key="animal.id"
              class="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl"
            >
              <div
                class="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center"
              >
                <span class="text-emerald-700 font-semibold text-lg">
                  {{ animal.name.charAt(0) }}
                </span>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-slate-800 text-lg">{{ animal.name }}</p>
                <p class="text-slate-600">{{ animal.species }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <p class="text-slate-600 text-lg">Terrario no encontrado</p>
        <button
          @click="$router.push('/')"
          class="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTerrariumStore } from '@/stores/terrarium'
import Navigation from '@/components/Navigation.vue'
import {
  ArrowLeftIcon,
  SquareIcon,
  Grid3x3Icon,
  ThermometerIcon,
  DropletIcon
} from 'lucide-vue-next'

const route = useRoute()
const store = useTerrariumStore()

const terrarium = computed(() =>
  store.getTerrariumById(route.params.id as string)
)
</script>
