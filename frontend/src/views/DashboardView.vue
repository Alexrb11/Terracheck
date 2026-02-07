<template>
  <div class="dashboard-view">
    <main class="container dashboard-view__main">
      <div class="dashboard-view__header">
        <div class="dashboard-view__header-top">
          <h2 class="dashboard-view__title">Mis Terrarios</h2>
          <button
            @click="$router.push('/add')"
            class="btn btn-primary dashboard-view__add-button"
          >
            <PlusIcon :size="20" />
            <span class="dashboard-view__add-text--desktop">Nuevo Terrario</span>
            <span class="dashboard-view__add-text--mobile">Crear</span>
          </button>
        </div>
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

      <!-- Grid de Terrarios (solo los tuyos) -->
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
        <h3 class="dashboard-view__empty-title">No tienes terrarios aún</h3>
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
import { BoxIcon, LoaderIcon, AlertCircleIcon, PlusIcon } from 'lucide-vue-next'

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

.dashboard-view__header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.dashboard-view__title {
  font-size: 2rem;
  font-weight: 400;
  color: var(--color-text-main);
  margin: 0;
  font-family: var(--font-family-serif);
  letter-spacing: -0.03em;
}

@media (min-width: 768px) {
  .dashboard-view__title {
    font-size: 2.75rem;
  }
}

.dashboard-view__add-button {
  flex-shrink: 0;
}

.dashboard-view__add-text--mobile {
  display: inline;
}

.dashboard-view__add-text--desktop {
  display: none;
}

@media (min-width: 768px) {
  .dashboard-view__add-text--mobile {
    display: none;
  }

  .dashboard-view__add-text--desktop {
    display: inline;
  }
}

.dashboard-view__subtitle {
  font-size: 1.125rem;
  color: var(--color-text-muted);
  margin: 0;
  font-style: italic;
  font-weight: 400;
}

/* Empty State - Cálido y expresivo */
.dashboard-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 1rem;
  text-align: center;
  background: linear-gradient(135deg, var(--color-accent) 0%, transparent 100%);
  border-radius: var(--radius-xl);
  margin: 2rem 0;
}

.dashboard-view__empty-icon-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; /* Forma orgánica */
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-float);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

.dashboard-view__empty-icon {
  color: white;
}

.dashboard-view__empty-title {
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--color-text-main);
  margin-bottom: 0.75rem;
  font-family: var(--font-family-serif);
}

.dashboard-view__empty-text {
  color: var(--color-text-muted);
  margin-bottom: 2rem;
  font-size: 1.125rem;
  font-style: italic;
}

/* Loading State - Animación orgánica */
.dashboard-view__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  gap: 1.5rem;
}

.dashboard-view__loader-icon {
  color: var(--color-primary);
  animation: spin-bounce 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  filter: drop-shadow(0 8px 16px rgba(74, 103, 65, 0.3));
}

@keyframes spin-bounce {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

/* Error State - Cálido y expresivo */
.dashboard-view__alert-icon {
  color: var(--color-secondary);
  margin: 0 auto 1rem;
  display: block;
  animation: shake 0.5s ease-in-out;
  filter: drop-shadow(0 4px 8px rgba(212, 163, 115, 0.3));
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0) rotate(0deg);
  }
  25% {
    transform: translateX(-8px) rotate(-5deg);
  }
  75% {
    transform: translateX(8px) rotate(5deg);
  }
}

.dashboard-view__error-text {
  color: var(--color-text-main);
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
}

</style>
