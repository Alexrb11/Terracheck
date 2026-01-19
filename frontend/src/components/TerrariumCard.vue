<template>
  <div
    :class="[
      'bg-white rounded-3xl shadow-lg p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer',
      terrarium.hasCompatibilityIssue ? 'border-4 border-red-300' : 'border-4 border-transparent'
    ]"
    @click="$router.push(`/terrarium/${terrarium.id}`)"
    role="button"
    tabindex="0"
    @keyup.enter="$router.push(`/terrarium/${terrarium.id}`)"
    aria-label="Ver detalles del terrario"
  >
    <!-- Header con nombre y tipo -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-2xl font-semibold text-slate-800">{{ terrarium.name }}</h3>
      <component
        :is="terrarium.type === 'glass' ? SquareIcon : Grid3x3Icon"
        :size="32"
        class="text-emerald-600"
      />
    </div>

    <!-- Alerta de compatibilidad -->
    <div
      v-if="terrarium.hasCompatibilityIssue"
      class="flex items-center gap-2 mb-4 p-3 bg-red-50 rounded-2xl border border-red-200"
    >
      <AlertTriangleIcon :size="24" class="text-red-600 flex-shrink-0" />
      <span class="text-sm font-medium text-red-700">
        Problema de compatibilidad detectado
      </span>
    </div>

    <!-- Información de condiciones -->
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="flex items-center gap-2">
        <ThermometerIcon :size="20" class="text-amber-500" />
        <div>
          <p class="text-xs text-slate-500">Temperatura</p>
          <p class="text-lg font-semibold text-slate-800">
            {{ terrarium.temperature }}°C
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <DropletIcon :size="20" class="text-blue-500" />
        <div>
          <p class="text-xs text-slate-500">Humedad</p>
          <p class="text-lg font-semibold text-slate-800">
            {{ terrarium.humidity }}%
          </p>
        </div>
      </div>
    </div>

    <!-- Animales -->
    <div class="mt-4 pt-4 border-t border-stone-200">
      <p class="text-sm font-medium text-slate-600 mb-2">
        Animales ({{ terrarium.animals.length }})
      </p>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="animal in terrarium.animals"
          :key="animal.id"
          class="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-2xl"
        >
          <div
            class="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center"
          >
            <span class="text-emerald-700 font-semibold text-sm">
              {{ animal.name.charAt(0) }}
            </span>
          </div>
          <span class="text-sm font-medium text-slate-700">{{ animal.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Terrarium } from '@/stores/terrarium'
import {
  SquareIcon,
  Grid3x3Icon,
  AlertTriangleIcon,
  ThermometerIcon,
  DropletIcon
} from 'lucide-vue-next'

defineProps<{
  terrarium: Terrarium
}>()
</script>
