<template>
  <div class="min-h-screen pb-20 md:pb-0">
    <!-- Header Desktop -->
    <header class="hidden md:block bg-white shadow-sm border-b border-stone-200">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <h1 class="text-3xl font-bold text-emerald-600">TerrariumKeeper</h1>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div class="mb-6 md:mb-8">
        <h2 class="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
          Mis Terrarios
        </h2>
        <p class="text-slate-600 text-lg">
          Gestiona y monitorea tus terrarios
        </p>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="flex items-center justify-center py-16">
        <LoaderIcon :size="48" class="text-emerald-600 animate-spin" />
      </div>

      <!-- Error -->
      <div
        v-else-if="store.error"
        class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
      >
        <AlertCircleIcon :size="48" class="text-red-500 mx-auto mb-4" />
        <p class="text-red-700">{{ store.error }}</p>
        <button
          @click="store.fetchTerrariums()"
          class="mt-4 px-6 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>

      <!-- Grid de Terrarios -->
      <div
        v-else-if="store.terrariums.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <TerrariumCard
          v-for="terrarium in store.terrariums"
          :key="terrarium._id"
          :terrarium="terrarium"
        />
      </div>

      <!-- Estado vacío -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <div class="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <BoxIcon :size="48" class="text-emerald-600" />
        </div>
        <h3 class="text-xl font-semibold text-slate-800 mb-2">
          No tienes terrarios aún
        </h3>
        <p class="text-slate-600 mb-6">Comienza agregando tu primer terrario</p>
        <button
          @click="$router.push('/add')"
          class="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-semibold text-lg hover:bg-emerald-700 transition-colors shadow-lg"
        >
          Agregar Terrario
        </button>
      </div>
    </main>

    <!-- Navegación Móvil (Bottom Bar) -->
    <Navigation />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTerrariumStore } from '@/stores/terrarium'
import TerrariumCard from '@/components/TerrariumCard.vue'
import Navigation from '@/components/Navigation.vue'
import { BoxIcon, LoaderIcon, AlertCircleIcon } from 'lucide-vue-next'

const store = useTerrariumStore()

onMounted(() => {
  store.fetchTerrariums()
})
</script>
