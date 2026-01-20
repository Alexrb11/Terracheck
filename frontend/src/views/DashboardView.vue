<template>
  <div class="dashboard-view">
    <Navigation />

    <!-- Contenido Principal -->
    <main class="container dashboard-view__main">
      <div class="dashboard-view__header">
        <h2 class="dashboard-view__title">
          Mis Terrarios
        </h2>
        <p class="dashboard-view__subtitle">
          Gestiona y monitorea tus terrarios
        </p>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="dashboard-view__loading">
        <LoaderIcon :size="48" class="dashboard-view__loader-icon" />
      </div>

      <!-- Error -->
      <div
        v-else-if="store.error"
        class="alert alert-danger"
      >
        <AlertCircleIcon :size="48" class="dashboard-view__alert-icon" />
        <p class="dashboard-view__error-text">{{ store.error }}</p>
        <button
          @click="store.fetchTerrariums()"
          class="btn btn-danger"
        >
          Reintentar
        </button>
      </div>

      <!-- Grid de Terrarios -->
      <div
        v-else-if="store.terrariums.length > 0"
        class="grid-gallery"
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
        class="dashboard-view__empty"
      >
        <div class="dashboard-view__empty-icon-wrapper">
          <BoxIcon :size="48" class="dashboard-view__empty-icon" />
        </div>
        <h3 class="dashboard-view__empty-title">
          No tienes terrarios aún
        </h3>
        <p class="dashboard-view__empty-text">Comienza agregando tu primer terrario</p>
        <button
          @click="$router.push('/add')"
          class="btn btn-primary"
        >
          Agregar Terrario
        </button>
      </div>
    </main>
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

<style scoped>
.dashboard-view {
  min-height: 100vh;
  padding-bottom: 80px; /* Espacio para la navegación móvil */
}

@media (min-width: 768px) {
  .dashboard-view {
    padding-bottom: 0;
  }
}

.dashboard-view__main {
  padding-top: 1.5rem;
  padding-bottom: 2rem;
}

@media (min-width: 768px) {
  .dashboard-view__main {
    padding-top: 2rem;
  }
}

.dashboard-view__header {
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .dashboard-view__header {
    margin-bottom: 2rem;
  }
}

.dashboard-view__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
}

@media (min-width: 768px) {
  .dashboard-view__title {
    font-size: 1.875rem;
  }
}

.dashboard-view__subtitle {
  font-size: 1.125rem;
  color: var(--color-text-muted);
}

/* Loading State */
.dashboard-view__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.dashboard-view__loader-icon {
  color: var(--color-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Error State */
.dashboard-view__alert-icon {
  color: var(--color-accent);
  margin: 0 auto 1rem;
  display: block;
}

.dashboard-view__error-text {
  color: #991b1b;
  margin-bottom: 1rem;
}

/* Empty State */
.dashboard-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
}

.dashboard-view__empty-icon-wrapper {
  width: 96px;
  height: 96px;
  border-radius: 9999px;
  background-color: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.dashboard-view__empty-icon {
  color: var(--color-primary);
}

.dashboard-view__empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
}

.dashboard-view__empty-text {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}
</style>
