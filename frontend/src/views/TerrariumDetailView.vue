<template>
  <div class="view-detail">
    <Navigation />

    <main class="container view-detail__main">
      <!-- Loading -->
      <div v-if="loading" class="view-detail__loading">
        <LoaderIcon :size="48" class="view-detail__loader-icon" />
      </div>

      <div v-else-if="terrarium" class="view-detail__content">
        <!-- Botón volver -->
        <button
          @click="$router.push('/')"
          class="btn-text view-detail__back-btn"
        >
          <ArrowLeftIcon :size="20" />
          <span>Volver</span>
        </button>

        <!-- Header del Terrario -->
        <header class="detail-header">
          <div class="detail-header__title-section">
            <h1 class="detail-header__title">{{ terrarium.name }}</h1>
            <component
              :is="terrarium.type === 'glass' ? SquareIcon : Grid3x3Icon"
              :size="40"
              class="detail-header__icon"
            />
          </div>
          <div class="detail-header__actions">
            <button class="btn btn-secondary" @click="handleEdit">
              <EditIcon :size="18" />
              <span>Editar</span>
            </button>
            <button class="btn btn-danger" @click="handleDelete">
              <TrashIcon :size="18" />
              <span>Eliminar</span>
            </button>
          </div>
        </header>

        <!-- Alerta de compatibilidad -->
        <div
          v-if="terrarium.hasCompatibilityIssue"
          class="alert alert-danger view-detail__alert"
        >
          <AlertTriangleIcon :size="24" />
          <span>Problema de compatibilidad detectado</span>
        </div>

        <!-- Layout Principal: Info + Animales -->
        <div class="detail-layout">
          <!-- Columna Izquierda: Información Técnica -->
          <aside class="detail-card" :class="{ 'detail-card--glass': terrarium.type === 'glass' }">
            <h2 class="detail-card__title">Información</h2>
            
            <div class="specs-grid">
              <!-- Dimensiones -->
              <div class="spec-item">
                <div class="spec-item__icon">
                  <RulerIcon :size="20" />
                </div>
                <span class="spec-label">Ancho</span>
                <span class="spec-value">{{ terrarium.dimensions.width }} cm</span>
              </div>

              <div class="spec-item">
                <div class="spec-item__icon">
                  <RulerIcon :size="20" />
                </div>
                <span class="spec-label">Fondo</span>
                <span class="spec-value">{{ terrarium.dimensions.depth }} cm</span>
              </div>

              <div class="spec-item">
                <div class="spec-item__icon">
                  <RulerIcon :size="20" />
                </div>
                <span class="spec-label">Alto</span>
                <span class="spec-value">{{ terrarium.dimensions.height }} cm</span>
              </div>

              <div class="spec-item">
                <div class="spec-item__icon">
                  <BoxIcon :size="20" />
                </div>
                <span class="spec-label">Volumen</span>
                <span class="spec-value">{{ terrarium.liters || '--' }} L</span>
              </div>

              <!-- Bioma -->
              <div class="spec-item spec-item--full">
                <div class="spec-item__icon">
                  <MapPinIcon :size="20" />
                </div>
                <span class="spec-label">Bioma</span>
                <span class="spec-value">{{ getBiomeLabel(terrarium.biome) }}</span>
              </div>

              <!-- Tipo -->
              <div class="spec-item spec-item--full">
                <div class="spec-item__icon">
                  <component
                    :is="terrarium.type === 'glass' ? SquareIcon : Grid3x3Icon"
                    :size="20"
                  />
                </div>
                <span class="spec-label">Tipo</span>
                <span class="spec-value">{{ getTypeLabel(terrarium.type) }}</span>
              </div>
            </div>

            <!-- Parámetros Ideales -->
            <div v-if="terrarium.parameters" class="detail-card__parameters">
              <h3 class="parameters-title">Parámetros Ideales</h3>
              
              <!-- Alerta de incompatibilidad -->
              <div
                v-if="!terrarium.parameters.compatibility.isCompatible"
                class="alert alert-danger parameters-alert"
              >
                <AlertTriangleIcon :size="20" />
                <div class="parameters-alert__content">
                  <div class="parameters-alert__header">
                    <strong>Incompatibilidad detectada</strong>
                    <button
                      v-if="terrarium.parameters.compatibility.incompatibleSpecies"
                      @click="isIncompatibilityExpanded = !isIncompatibilityExpanded"
                      class="accordion-toggle"
                      :aria-expanded="isIncompatibilityExpanded"
                    >
                      <component
                        :is="isIncompatibilityExpanded ? ChevronUpIcon : ChevronDownIcon"
                        :size="20"
                      />
                    </button>
                  </div>
                  
                  <!-- Contenido expandible (errores + especies) -->
                  <transition name="accordion">
                    <div
                      v-if="isIncompatibilityExpanded"
                      class="parameters-alert__expandable"
                    >
                      <!-- Lista de errores -->
                      <ul class="parameters-errors">
                        <li v-for="error in terrarium.parameters.compatibility.errors" :key="error">
                          {{ error }}
                        </li>
                      </ul>
                      
                      <!-- Mostrar datos incompatibles de cada especie -->
                      <div v-if="terrarium.parameters.compatibility.incompatibleSpecies" class="incompatible-species">
                        <h4 class="incompatible-species__title">Rangos por especie:</h4>
                        <div 
                          v-for="(species, index) in terrarium.parameters.compatibility.incompatibleSpecies" 
                          :key="index"
                          class="incompatible-species-item"
                        >
                          <div class="incompatible-species-header">
                            <strong>{{ species.animalName }}</strong>
                            <span class="incompatible-species-name">({{ species.speciesName }})</span>
                          </div>
                          <div class="incompatible-species-ranges">
                            <div class="incompatible-range">
                              <span class="incompatible-range-label">Temp:</span>
                              <span class="incompatible-range-value">
                                {{ species.temperature.min }}°C - {{ species.temperature.max }}°C
                              </span>
                            </div>
                            <div class="incompatible-range">
                              <span class="incompatible-range-label">Humedad:</span>
                              <span class="incompatible-range-value">
                                {{ species.humidity.min }}% - {{ species.humidity.max }}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- Rango de Temperatura Ideal -->
              <div class="parameter-item">
                <div class="parameter-header">
                  <ThermometerIcon :size="20" class="parameter-icon" />
                  <span class="parameter-label">Temperatura Ideal</span>
                </div>
                <div class="parameter-range">
                  {{ terrarium.parameters.temperature.min }}°C - {{ terrarium.parameters.temperature.max }}°C
                </div>
              </div>

              <!-- Rango de Humedad Ideal -->
              <div class="parameter-item">
                <div class="parameter-header">
                  <DropletIcon :size="20" class="parameter-icon" />
                  <span class="parameter-label">Humedad Ideal</span>
                </div>
                <div class="parameter-range">
                  {{ terrarium.parameters.humidity.min }}% - {{ terrarium.parameters.humidity.max }}%
                </div>
              </div>
            </div>

            <!-- Mensaje cuando no hay animales -->
            <div v-else-if="!terrarium.animals || terrarium.animals.length === 0" class="detail-card__no-parameters">
              <p class="no-parameters-text">
                Añade habitantes para ver los parámetros recomendados
              </p>
            </div>


            <!-- Notas -->
            <div v-if="terrarium.notes" class="detail-card__notes">
              <span class="notes-label">Notas</span>
              <p class="notes-text">{{ terrarium.notes }}</p>
            </div>
          </aside>

          <!-- Columna Derecha: Habitantes -->
          <section class="animals-section">
            <div class="animals-section__header">
              <h2 class="animals-section__title">
                Habitantes ({{ terrarium.animals?.length || 0 }})
              </h2>
            </div>
            
            <div v-if="terrarium.animals && terrarium.animals.length > 0" class="animals-grid">
              <div
                v-for="animal in terrarium.animals"
                :key="animal._id"
                class="animal-card"
                :class="{ 'animal-card--incompatible': isBiomeIncompatible(animal) }"
              >
                <div class="animal-avatar-large">
                  <img
                    v-if="animal.imageUrl || animal.species?.imageUrl"
                    :src="getImageUrl(animal.imageUrl || animal.species?.imageUrl)"
                    :alt="animal.name"
                  />
                  <span v-else>{{ animal.name.charAt(0) }}</span>
                </div>
                <div class="animal-card__info">
                  <p class="animal-card__name">{{ animal.name }}</p>
                  <p class="animal-card__species">
                    {{ animal.species?.commonName || 'Especie desconocida' }}
                  </p>
                  <p v-if="animal.species?.scientificName" class="animal-card__scientific">
                    {{ animal.species.scientificName }}
                  </p>
                  <!-- Bioma del animal -->
                  <div v-if="animal.species?.biome" class="animal-card__biome">
                    <MapPinIcon :size="14" />
                    <span>{{ getBiomeLabel(animal.species.biome) }}</span>
                  </div>
                  <!-- Advertencia de incompatibilidad -->
                  <div v-if="isBiomeIncompatible(animal)" class="animal-card__incompatibility-warning">
                    <AlertTriangleIcon :size="16" />
                    <span>Bioma incompatible</span>
                  </div>
                </div>
                <div class="animal-card__actions">
                  <span
                    class="sex-badge"
                    :class="`sex-badge--${animal.sex || 'unknown'}`"
                  >
                    {{ getSexLabel(animal.sex) }}
                  </span>
                  <button
                    @click="handleDeleteAnimal(animal._id, animal.name)"
                    class="animal-card__delete-btn"
                    title="Quitar del terrario"
                  >
                    <LogOutIcon :size="18" />
                  </button>
                </div>
              </div>

              <!-- Botón Añadir Habitante -->
              <button
                @click="showSelectAnimalModal = true"
                class="btn-add-animal"
              >
                <PlusIcon :size="32" />
                <span>Añadir Habitante</span>
              </button>
            </div>
            
            <!-- Estado Vacío -->
            <div v-else class="animals-section__empty">
              <div class="empty-state">
                <div class="empty-state__icon">
                  <PawPrintIcon :size="48" />
                </div>
                <p class="empty-state__text">No hay animales asignados a este terrario</p>
                <button
                  @click="showSelectAnimalModal = true"
                  class="btn btn-primary"
                >
                  <PlusIcon :size="20" />
                  <span>Añadir tu primer habitante</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Estado: Terrario no encontrado -->
      <div v-else class="view-detail__not-found">
        <p class="view-detail__not-found-text">Terrario no encontrado</p>
        <button
          @click="$router.push('/')"
          class="btn btn-primary"
        >
          Volver al inicio
        </button>
      </div>
    </main>

    <!-- Modal Seleccionar Animal -->
    <SelectAnimalModal
      :is-open="showSelectAnimalModal"
      :terrarium-id="terrariumId"
      :current-animals="currentAnimalIds"
      @close="showSelectAnimalModal = false"
      @added="handleAnimalAdded"
    />

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :is-open="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :confirm-text="confirmModal.confirmText"
      :cancel-text="confirmModal.cancelText"
      :is-danger="confirmModal.isDanger"
      @close="confirmModal.isOpen = false"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTerrariumStore } from '@/stores/terrarium'
import Navigation from '@/components/Navigation.vue'
import SelectAnimalModal from '@/components/SelectAnimalModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import { getImageUrl } from '@/utils/image'
import {
  ArrowLeftIcon,
  SquareIcon,
  Grid3x3Icon,
  ThermometerIcon,
  DropletIcon,
  RulerIcon,
  AlertTriangleIcon,
  LoaderIcon,
  PlusIcon,
  PawPrintIcon,
  TrashIcon,
  EditIcon,
  BoxIcon,
  MapPinIcon,
  LogOutIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useTerrariumStore()
const loading = ref(true)
const showSelectAnimalModal = ref(false)
const isIncompatibilityExpanded = ref(false)

// Confirmation Modal
const confirmModal = ref<{
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  isDanger: boolean
  onConfirm: (() => void) | null
}>({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  isDanger: false,
  onConfirm: null
})

const openConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  options?: {
    confirmText?: string
    cancelText?: string
    isDanger?: boolean
  }
) => {
  confirmModal.value = {
    isOpen: true,
    title,
    message,
    confirmText: options?.confirmText || 'Confirmar',
    cancelText: options?.cancelText || 'Cancelar',
    isDanger: options?.isDanger ?? false,
    onConfirm
  }
}

const handleConfirm = () => {
  if (confirmModal.value.onConfirm) {
    confirmModal.value.onConfirm()
  }
  confirmModal.value.isOpen = false
  confirmModal.value.onConfirm = null
}

const terrariumId = computed(() => route.params.id as string)

const terrarium = computed(() =>
  store.getTerrariumById(terrariumId.value)
)

// IDs de animales actuales en el terrario
const currentAnimalIds = computed(() => {
  return terrarium.value?.animals?.map(animal => animal._id) || []
})

const getBiomeLabel = (biome?: string): string => {
  const labels: Record<string, string> = {
    tropical: 'Tropical',
    desert: 'Desierto',
    temperate: 'Templado'
  }
  return labels[biome || 'tropical'] || 'Tropical'
}

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    glass: 'Cristal',
    mesh: 'Malla',
    hybrid: 'Híbrido'
  }
  return labels[type] || type
}

const getSexLabel = (sex?: string): string => {
  const labels: Record<string, string> = {
    male: 'Macho',
    female: 'Hembra',
    unknown: 'Desconocido'
  }
  return labels[sex || 'unknown'] || 'Desconocido'
}

// Helper para verificar incompatibilidad de biomas
const isBiomeIncompatible = (animal: any): boolean => {
  if (!terrarium.value || !animal.species?.biome) {
    return false
  }
  
  // Normalizar ambos valores para comparación (lowercase y trim)
  const terrariumBiome = String(terrarium.value.biome || '').toLowerCase().trim()
  const animalBiome = String(animal.species.biome || '').toLowerCase().trim()
  
  // Si alguno está vacío, no considerar incompatible
  if (!terrariumBiome || !animalBiome) {
    return false
  }
  
  // Retornar true solo si son diferentes
  return terrariumBiome !== animalBiome
}


const handleAnimalAdded = async () => {
  // Recargar el terrario específico para ver el nuevo habitante
  await store.fetchTerrariumById(route.params.id as string)
}

const handleDeleteAnimal = (animalId: string, animalName: string) => {
  openConfirm(
    'Quitar del terrario',
    `¿Estás seguro de que deseas quitar a ${animalName} de este terrario? El animal volverá a tu lista de disponibles.`,
    async () => {
      await store.removeAnimalFromTerrarium(animalId)
    },
    {
      confirmText: 'Quitar',
      isDanger: false
    }
  )
}

const handleEdit = () => {
  // Navegar a la vista de edición cuando esté implementada
  // Por ahora, redirigir al dashboard
  router.push('/')
}

const handleDelete = () => {
  if (!terrarium.value) return
  
  openConfirm(
    'Eliminar Terrario',
    `¿Estás seguro de que deseas eliminar el terrario "${terrarium.value.name}"?\n\nEsta acción no se puede deshacer.`,
    async () => {
      const success = await store.deleteTerrarium(terrarium.value!._id)
      if (success) {
        router.push('/')
      }
    },
    {
      confirmText: 'Eliminar',
      isDanger: true
    }
  )
}

onMounted(async () => {
  // Si no tenemos terrarios cargados, cargarlos
  if (store.terrariums.length === 0) {
    await store.fetchTerrariums()
  }
  loading.value = false
})
</script>

<style scoped>
/* ============================================
   CONTENEDOR PRINCIPAL
   ============================================ */
.view-detail {
  min-height: 100vh;
  padding-bottom: 80px; /* Espacio para la navegación móvil */
}

@media (min-width: 768px) {
  .view-detail {
    padding-bottom: 0;
  }
}

.view-detail__main {
  padding-top: 1.5rem;
  padding-bottom: 2rem;
}

.view-detail__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Botón Volver */
.btn-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: color var(--transition-fast);
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
}

.btn-text:hover {
  color: var(--color-primary);
}

.view-detail__back-btn {
  margin-bottom: 1rem;
}

/* Loading */
.view-detail__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.view-detail__loader-icon {
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

/* Not Found */
.view-detail__not-found {
  text-align: center;
  padding: 4rem 0;
}

.view-detail__not-found-text {
  font-size: 1.125rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

/* ============================================
   HEADER DEL TERRARIO
   ============================================ */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.detail-header__title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-header__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

@media (min-width: 768px) {
  .detail-header__title {
    font-size: 2.5rem;
  }
}

.detail-header__icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.detail-header__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Alerta */
.view-detail__alert {
  margin-bottom: 1.5rem;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

/* ============================================
   LAYOUT PRINCIPAL
   ============================================ */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .detail-layout {
    grid-template-columns: 1fr 1.5fr; /* Info izquierda, Animales derecha más ancho */
  }
}

/* ============================================
   TARJETA DE INFORMACIÓN
   ============================================ */
.detail-card {
  padding: 2rem;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  height: fit-content;
}

.detail-card--glass {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-card__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 1.5rem 0;
}

.detail-card--glass .detail-card__title {
  color: white;
}

/* Grid de Especificaciones */
.specs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.spec-item--full {
  grid-column: 1 / -1;
}

.spec-item__icon {
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.detail-card--glass .spec-item__icon {
  color: rgba(255, 255, 255, 0.8);
}

.spec-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.detail-card--glass .spec-label {
  color: rgba(255, 255, 255, 0.6);
}

.spec-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.detail-card--glass .spec-value {
  color: white;
}

/* Parámetros Ideales */
.detail-card__parameters {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.detail-card--glass .detail-card__parameters {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.parameters-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 1rem 0;
}

.detail-card--glass .parameters-title {
  color: white;
}

.parameters-alert {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 0.75rem;
  text-align: left;
}

.parameters-alert svg:first-child {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.parameters-alert__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}

.parameters-alert__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.parameters-alert__header strong {
  flex: 1;
  line-height: 1.4;
}

.parameters-alert__expandable {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(239, 68, 68, 0.2);
}

.accordion-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.accordion-toggle:hover {
  background: rgba(239, 68, 68, 0.1);
}

.accordion-toggle:focus {
  outline: 2px solid #ef4444;
  outline-offset: 2px;
}

/* Transiciones del acordeón */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.accordion-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.accordion-enter-to {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}

.accordion-leave-from {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}

.accordion-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.parameters-errors {
  margin: 0.5rem 0 0 0;
  padding-left: 1.25rem;
  list-style-type: disc;
}

.parameters-errors li {
  margin-top: 0.25rem;
}

/* Especies incompatibles */
.incompatible-species {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(239, 68, 68, 0.2);
}

.incompatible-species__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ef4444;
  margin: 0 0 0.75rem 0;
}

.incompatible-species-item {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.05);
  border-radius: var(--radius-md);
  border-left: 3px solid #ef4444;
}

.incompatible-species-item:last-child {
  margin-bottom: 0;
}

.incompatible-species-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.incompatible-species-header strong {
  color: var(--color-text-main);
  font-size: 0.875rem;
}

.incompatible-species-name {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.incompatible-species-ranges {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.incompatible-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.incompatible-range-label {
  font-weight: 600;
  color: var(--color-text-muted);
  min-width: 60px;
}

.incompatible-range-value {
  color: var(--color-text-main);
  font-weight: 500;
}

.detail-card--glass .incompatible-species-header strong {
  color: white;
}

.detail-card--glass .incompatible-species-name {
  color: rgba(255, 255, 255, 0.6);
}

.detail-card--glass .incompatible-range-label {
  color: rgba(255, 255, 255, 0.6);
}

.detail-card--glass .incompatible-range-value {
  color: white;
}

.parameter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-md);
  margin-bottom: 0.75rem;
}

.detail-card--glass .parameter-item {
  background: rgba(255, 255, 255, 0.05);
}

.parameter-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.parameter-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.detail-card--glass .parameter-icon {
  color: rgba(255, 255, 255, 0.8);
}

.parameter-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.detail-card--glass .parameter-label {
  color: rgba(255, 255, 255, 0.6);
}

.parameter-range {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.detail-card--glass .parameter-range {
  color: white;
}

/* Mensaje sin parámetros */
.detail-card__no-parameters {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  text-align: center;
}

.detail-card--glass .detail-card__no-parameters {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.no-parameters-text {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
}

.detail-card--glass .no-parameters-text {
  color: rgba(255, 255, 255, 0.6);
}

/* Notas */
.detail-card__notes {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-card--glass .detail-card__notes {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.notes-label {
  display: block;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.detail-card--glass .notes-label {
  color: rgba(255, 255, 255, 0.6);
}

.notes-text {
  font-size: 0.95rem;
  color: var(--color-text-main);
  font-style: italic;
  line-height: 1.6;
  margin: 0;
}

.detail-card--glass .notes-text {
  color: rgba(255, 255, 255, 0.9);
}

/* ============================================
   SECCIÓN DE ANIMALES
   ============================================ */
.animals-section {
  display: flex;
  flex-direction: column;
}

.animals-section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.animals-section__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

/* Grid de Animales */
.animals-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .animals-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.animal-card {
  background: var(--color-surface);
  padding: 1rem;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  border: 2px solid transparent;
}

.animal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.animal-card--incompatible {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.animal-card__info {
  flex: 1;
  width: 100%;
}

.animal-card__name {
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--color-text-main);
  margin: 0 0 0.25rem 0;
}

.animal-card__species {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0 0 0.25rem 0;
}

.animal-card__scientific {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
}

.animal-card__biome {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 0.5rem;
  margin-left: auto;
  margin-right: auto;
  padding: 0.375rem 0.625rem;
  background: rgba(0, 0, 0, 0.03);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.animal-card__biome svg {
  flex-shrink: 0;
  color: var(--color-primary);
}

.animal-card__incompatibility-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-md);
  color: #dc2626;
  font-size: 0.75rem;
  font-weight: 600;
}

.animal-card__incompatibility-warning svg {
  flex-shrink: 0;
}

.animal-card__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  width: 100%;
}

.animal-card__delete-btn {
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.animal-card__delete-btn:hover {
  background-color: rgba(239, 108, 0, 0.1);
  color: var(--color-accent);
}

.animal-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 2.5rem;
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.animal-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Badge de Sexo */
.sex-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.sex-badge--male {
  background-color: rgba(59, 130, 246, 0.15);
  color: #1e40af;
}

.sex-badge--female {
  background-color: rgba(236, 72, 153, 0.15);
  color: #be185d;
}

.sex-badge--unknown {
  background-color: rgba(0, 0, 0, 0.08);
  color: var(--color-text-main);
}

/* Botón Añadir Animal */
.btn-add-animal {
  border: 2px dashed rgba(0, 0, 0, 0.1);
  background: transparent;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 100px;
  padding: 1rem;
}

.btn-add-animal:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.btn-add-animal svg {
  color: var(--color-primary);
}

/* Estado Vacío */
.animals-section__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.empty-state {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-state__icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.empty-state__text {
  font-size: 1rem;
  color: var(--color-text-muted);
  margin: 0;
}
</style>
