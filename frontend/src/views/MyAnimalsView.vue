<template>
  <div class="my-animals-view">
    <Navigation />

    <!-- Contenido Principal -->
    <main class="container my-animals-view__main">
      <div class="my-animals-view__header">
        <h2 class="my-animals-view__title">
          Mis Especies
        </h2>
        <p class="my-animals-view__subtitle">
          Todas tus mascotas en un solo lugar
        </p>
      </div>

      <!-- Filtro de búsqueda -->
      <div class="my-animals-view__search">
        <div class="search-input-wrapper">
          <SearchIcon :size="20" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="my-animals-view__loading">
        <LoaderIcon :size="48" class="my-animals-view__loader-icon" />
      </div>

      <!-- Error -->
      <div
        v-else-if="store.error"
        class="alert alert-danger"
      >
        <AlertCircleIcon :size="48" class="my-animals-view__alert-icon" />
        <p class="my-animals-view__error-text">{{ store.error }}</p>
        <button
          @click="store.fetchMyAnimals()"
          class="btn btn-danger"
        >
          Reintentar
        </button>
      </div>

      <!-- Grid de Animales -->
      <div
        v-else-if="filteredAnimals.length > 0"
        class="grid-gallery"
      >
        <article
          v-for="animal in filteredAnimals"
          :key="animal._id"
          class="card animal-card"
          @click="goToAnimalDetail(animal._id)"
          tabindex="0"
          @keydown.enter.prevent="goToAnimalDetail(animal._id)"
          @keydown.space.prevent="goToAnimalDetail(animal._id)"
        >
          <!-- Avatar o Imagen -->
          <div class="animal-card__avatar">
            <img
              v-if="animal.imageUrl"
              :src="animal.imageUrl"
              :alt="animal.name"
              class="animal-card__image"
            />
            <span v-else class="animal-card__initial">
              {{ animal.name.charAt(0).toUpperCase() }}
            </span>
          </div>

          <!-- Información -->
          <div class="animal-card__info">
            <h3 class="animal-card__name">{{ animal.name }}</h3>
            <p class="animal-card__species">
              {{ animal.species?.commonName || 'Especie desconocida' }}
            </p>
            <p v-if="animal.species?.scientificName" class="animal-card__scientific">
              {{ animal.species.scientificName }}
            </p>
          </div>

          <!-- Ubicación -->
          <div class="animal-card__location">
            <MapPinIcon :size="16" class="location-icon" />
            <span class="location-text">
              {{ animal.terrarium?.name || 'Sin terrario' }}
            </span>
          </div>
        </article>
      </div>

      <!-- Estado vacío -->
      <div
        v-else-if="!store.loading && store.myAnimals.length === 0"
        class="my-animals-view__empty"
      >
        <div class="my-animals-view__empty-icon-wrapper">
          <PawPrintIcon :size="48" class="my-animals-view__empty-icon" />
        </div>
        <h3 class="my-animals-view__empty-title">
          No tienes mascotas aún
        </h3>
        <p class="my-animals-view__empty-text">
          Añade animales a tus terrarios para verlos aquí
        </p>
      </div>

      <!-- Sin resultados de búsqueda -->
      <div
        v-else
        class="my-animals-view__empty"
      >
        <div class="my-animals-view__empty-icon-wrapper">
          <SearchIcon :size="48" class="my-animals-view__empty-icon" />
        </div>
        <h3 class="my-animals-view__empty-title">
          No se encontraron resultados
        </h3>
        <p class="my-animals-view__empty-text">
          Intenta con otro término de búsqueda
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAnimalStore } from '@/stores/animal'
import Navigation from '@/components/Navigation.vue'
import {
  PawPrintIcon,
  LoaderIcon,
  AlertCircleIcon,
  SearchIcon,
  MapPinIcon
} from 'lucide-vue-next'

const store = useAnimalStore()
const router = useRouter()
const searchQuery = ref('')

const filteredAnimals = computed(() => {
  if (!searchQuery.value.trim()) {
    return store.myAnimals
  }

  const query = searchQuery.value.toLowerCase().trim()
  return store.myAnimals.filter(animal =>
    animal.name.toLowerCase().includes(query) ||
    animal.species?.commonName?.toLowerCase().includes(query) ||
    animal.species?.scientificName?.toLowerCase().includes(query) ||
    animal.terrarium?.name?.toLowerCase().includes(query)
  )
})

const goToAnimalDetail = (animalId: string) => {
  router.push(`/my-animals/${animalId}`)
}

onMounted(() => {
  store.fetchMyAnimals()
})
</script>

<style scoped>
.my-animals-view {
  min-height: 100vh;
  padding-bottom: 80px; /* Espacio para la navegación móvil */
}

@media (min-width: 768px) {
  .my-animals-view {
    padding-bottom: 0;
  }
}

.my-animals-view__main {
  padding-top: 1.5rem;
  padding-bottom: 2rem;
}

@media (min-width: 768px) {
  .my-animals-view__main {
    padding-top: 2rem;
  }
}

.my-animals-view__header {
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .my-animals-view__header {
    margin-bottom: 2rem;
  }
}

.my-animals-view__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 0.5rem 0;
}

@media (min-width: 768px) {
  .my-animals-view__title {
    font-size: 1.875rem;
  }
}

.my-animals-view__subtitle {
  font-size: 1.125rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* Búsqueda */
.my-animals-view__search {
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .my-animals-view__search {
    margin-bottom: 2rem;
  }
}

.search-input-wrapper {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  background: var(--color-surface);
  color: var(--color-text-main);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

/* Loading State */
.my-animals-view__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.my-animals-view__loader-icon {
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
.my-animals-view__alert-icon {
  color: var(--color-accent);
  margin: 0 auto 1rem;
  display: block;
}

.my-animals-view__error-text {
  color: #991b1b;
  margin-bottom: 1rem;
}

/* Tarjeta de Animal */
.animal-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.animal-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-float);
}

.animal-card:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.animal-card__avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  overflow: hidden;
  flex-shrink: 0;
}

.animal-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.animal-card__initial {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.animal-card__info {
  text-align: center;
  flex: 1;
}

.animal-card__name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 0.5rem 0;
}

.animal-card__species {
  font-size: 1rem;
  color: var(--color-text-muted);
  margin: 0 0 0.25rem 0;
}

.animal-card__scientific {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
}

.animal-card__location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-md);
  margin-top: auto;
}

.location-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.location-text {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

/* Empty State */
.my-animals-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
}

.my-animals-view__empty-icon-wrapper {
  width: 96px;
  height: 96px;
  border-radius: 9999px;
  background-color: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.my-animals-view__empty-icon {
  color: var(--color-primary);
}

.my-animals-view__empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
}

.my-animals-view__empty-text {
  color: var(--color-text-muted);
  margin: 0;
}
</style>
