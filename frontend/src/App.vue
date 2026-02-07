<template>
  <div class="app-layout">
    <!-- Textura de grano sutil para calidez táctil -->
    <div class="grain-overlay"></div>
    
    <Navigation v-if="showNavigation" />

    <!-- Transición líquida entre vistas -->
    <RouterView v-slot="{ Component }">
      <transition name="fade-page" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text-main);
  position: relative;
}

/* Textura de grano para aspecto artesanal */
.grain-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}

/* Transiciones "fade-page" suaves y estables */
.fade-page-enter-active,
.fade-page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-page-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Navigation from '@/components/Navigation.vue'

const route = useRoute()
// Ocultar navegación en rutas de autenticación
const showNavigation = computed(() => {
  return !['login', 'register'].includes(route.name as string)
})
</script>
