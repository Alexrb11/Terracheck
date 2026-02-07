<template>
  <div class="species-view">
    <main class="container species-view__main">
      <!-- Header -->
      <header class="view-header">
        <h1 class="view-header__title">Catálogo de Especies</h1>
        <p class="view-header__subtitle">
          Descubre los requisitos para tus reptiles
        </p>
      </header>

      <!-- Loading -->
      <div v-if="speciesStore.loading" class="species-view__loading">
        <LoaderIcon :size="48" class="species-view__loader-icon" />
      </div>

      <!-- Error -->
      <div
        v-else-if="speciesStore.error"
        class="alert alert-danger"
      >
        <AlertCircleIcon :size="48" class="species-view__alert-icon" />
        <p class="species-view__error-text">{{ speciesStore.error }}</p>
        <button
          @click="speciesStore.fetchSpecies()"
          class="btn btn-danger"
        >
          Reintentar
        </button>
      </div>

      <!-- Grid de Especies -->
      <div
        v-else-if="speciesStore.species.length > 0"
        class="grid-gallery"
      >
        <article
          v-for="species in speciesStore.species"
          :key="species._id"
          class="species-card"
        >
          <div class="species-card__image">
            <img
              v-if="species.imageUrl"
              :src="getImageUrl(species.imageUrl)"
              :alt="species.commonName"
              loading="lazy"
            />
            <div
              v-else
              class="species-card__placeholder"
            >
              <FishIcon :size="64" />
            </div>
            
            <!-- Badge Bioma -->
            <span class="species-badge species-badge--biome">
              {{ getBiomeLabel(species.biome) }}
            </span>
          </div>

          <div class="species-card__content">
            <div class="species-info">
              <h2 class="species-info__name">{{ species.commonName }}</h2>
              <span class="scientific-name">{{ species.scientificName }}</span>
            </div>

            <!-- Descripción -->
            <p class="species-card__description">
              {{ species.description || 'Sin descripción disponible.' }}
            </p>

            <!-- Tags -->
            <div class="species-tags">
              <span
                :class="[
                  'tag tag--difficulty',
                  `tag--difficulty-${getDifficultyLevel(species).toLowerCase()}`
                ]"
              >
                <StarIcon :size="12" />
                {{ getDifficultyLevel(species) }}
              </span>

              <span
                v-if="species.requirements.arboreal"
                class="tag tag--arboreal"
              >
                <TreePineIcon :size="12" />
                Arborícola
              </span>

              <span
                v-if="species.parameters.uvIndex > 0"
                class="tag tag--uv"
              >
                <SunIcon :size="12" />
                UV {{ species.parameters.uvIndex }}
              </span>
            </div>

            <!-- Parámetros -->
            <div class="species-parameters">
              <div class="species-parameters__item">
                <ThermometerIcon :size="16" />
                <span>
                  {{ species.parameters.tempMin }}-{{ species.parameters.tempMax }}°C
                </span>
              </div>
              <div class="species-parameters__item">
                <DropletIcon :size="16" />
                <span>
                  {{ species.parameters.humidityMin }}-{{ species.parameters.humidityMax }}%
                </span>
              </div>
              <div class="species-parameters__item">
                <BoxIcon :size="16" />
                <span>
                  Min {{ species.requirements.minLiters }}L
                </span>
              </div>
              <div class="species-parameters__item">
                <RulerIcon :size="16" />
                <span>
                  Altura {{ species.requirements.minHeight }}cm
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Estado vacío -->
      <div
        v-else
        class="species-view__empty"
      >
        <div class="species-view__empty-icon-wrapper">
          <FishIcon :size="48" class="species-view__empty-icon" />
        </div>
        <h3 class="species-view__empty-title">
          No hay especies disponibles
        </h3>
        <p class="species-view__empty-text">El catálogo de especies está vacío</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSpeciesStore, type Species } from '@/stores/species'
import { getImageUrl } from '@/utils/image'
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
.species-view {
  min-height: 100vh;
  padding-bottom: 80px; /* Espacio para la navegación móvil */
}

@media (min-width: 768px) {
  .species-view {
    padding-bottom: 0;
  }
}

.species-view__main {
  padding-top: 1.5rem;
  padding-bottom: 2rem;
}

@media (min-width: 768px) {
  .species-view__main {
    padding-top: 2rem;
  }
}

/* View Header */
.view-header {
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .view-header {
    margin-bottom: 2rem;
  }
}

.view-header__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
}

@media (min-width: 768px) {
  .view-header__title {
    font-size: 1.875rem;
  }
}

.view-header__subtitle {
  font-size: 1.125rem;
  color: var(--color-text-muted);
}

/* Loading State */
.species-view__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.species-view__loader-icon {
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
.species-view__alert-icon {
  color: var(--color-accent);
  margin: 0 auto 1rem;
  display: block;
}

.species-view__error-text {
  color: #991b1b;
  margin-bottom: 1rem;
}

/* Species Card */
.species-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow var(--transition-base);
}

.species-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

/* Species Card Image */
.species-card__image {
  position: relative;
  height: 200px;
  overflow: hidden;
  background-color: var(--color-background);
}

.species-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.species-card:hover .species-card__image img {
  transform: scale(1.05);
}

.species-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

/* Species Badge */
.species-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.375rem 0.75rem;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.species-badge--biome {
  /* El color se puede personalizar según el bioma si es necesario */
}

/* Species Card Content */
.species-card__content {
  padding: 1.25rem;
}

/* Species Info */
.species-info {
  margin-bottom: 0.75rem;
}

.species-info__name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 0.25rem;
}

.scientific-name {
  display: block;
  color: var(--color-text-muted);
  font-style: italic;
  font-size: 0.875rem;
}

/* Species Card Description */
.species-card__description {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Species Tags */
.species-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
}

.tag--difficulty {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.tag--difficulty-intermedio {
  background-color: rgba(251, 191, 36, 0.2);
  color: #d97706;
}

.tag--difficulty-avanzado {
  background-color: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.tag--arboreal {
  background-color: rgba(168, 85, 247, 0.2);
  color: #9333ea;
}

.tag--uv {
  background-color: rgba(249, 115, 22, 0.2);
  color: #ea580c;
}

/* Species Parameters */
.species-parameters {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.species-parameters__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.species-parameters__item svg {
  color: var(--color-accent);
  flex-shrink: 0;
}

.species-parameters__item:nth-child(2) svg {
  color: #3b82f6;
}

.species-parameters__item:nth-child(3) svg,
.species-parameters__item:nth-child(4) svg {
  color: var(--color-text-muted);
}

/* Empty State */
.species-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
}

.species-view__empty-icon-wrapper {
  width: 96px;
  height: 96px;
  border-radius: 9999px;
  background-color: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.species-view__empty-icon {
  color: var(--color-primary);
}

.species-view__empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
}

.species-view__empty-text {
  color: var(--color-text-muted);
}
</style>
