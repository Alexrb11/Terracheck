<template>
  <!-- Navegación Móvil (Bottom Bar) -->
  <nav
    class="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-lg md:hidden z-50"
    aria-label="Navegación principal"
  >
    <div class="flex justify-around items-center h-16">
      <router-link
        to="/"
        class="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-colors"
        :class="
          $route.path === '/'
            ? 'text-emerald-600 bg-emerald-50'
            : 'text-slate-600 hover:text-emerald-600'
        "
        aria-label="Mis Terrarios"
      >
        <LayoutGridIcon :size="28" />
        <span class="text-xs font-medium">Terrarios</span>
      </router-link>

      <router-link
        to="/add"
        class="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-colors"
        :class="
          $route.path === '/add'
            ? 'text-emerald-600 bg-emerald-50'
            : 'text-slate-600 hover:text-emerald-600'
        "
        aria-label="Agregar Terrario"
      >
        <PlusCircleIcon :size="28" />
        <span class="text-xs font-medium">Agregar</span>
      </router-link>

      <button
        class="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-colors text-slate-600 hover:text-emerald-600"
        aria-label="Especies"
        @click="handleSpeciesClick"
      >
        <FishIcon :size="28" />
        <span class="text-xs font-medium">Especies</span>
      </button>
    </div>
  </nav>

  <!-- Navegación Desktop (Top Bar) -->
  <nav
    class="hidden md:block bg-white shadow-sm border-b border-stone-200"
    aria-label="Navegación principal"
  >
    <div class="max-w-7xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <router-link
          to="/"
          class="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          TerrariumKeeper
        </router-link>

        <div class="flex items-center gap-6">
          <router-link
            to="/"
            class="flex items-center gap-2 px-4 py-2 rounded-2xl font-medium transition-colors"
            :class="
              $route.path === '/'
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
            "
          >
            <LayoutGridIcon :size="20" />
            <span>Mis Terrarios</span>
          </router-link>

          <router-link
            to="/add"
            class="flex items-center gap-2 px-4 py-2 rounded-2xl font-medium transition-colors"
            :class="
              $route.path === '/add'
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
            "
          >
            <PlusCircleIcon :size="20" />
            <span>Agregar</span>
          </router-link>

          <button
            class="flex items-center gap-2 px-4 py-2 rounded-2xl font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            @click="handleSpeciesClick"
          >
            <FishIcon :size="20" />
            <span>Especies</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  LayoutGridIcon,
  PlusCircleIcon,
  FishIcon
} from 'lucide-vue-next'

const handleSpeciesClick = () => {
  // TODO: Implementar vista de especies
  alert('Vista de especies próximamente')
}
</script>
