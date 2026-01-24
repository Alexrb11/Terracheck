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

            <!-- Sensores -->
            <div class="detail-card__sensors">
              <div class="sensor-item">
                <ThermometerIcon :size="24" class="sensor-item__icon" />
                <div>
                  <span class="sensor-label">Temperatura</span>
                  <span class="sensor-value">
                    {{ terrarium.sensors?.temperature ?? '--' }}°C
                  </span>
                </div>
              </div>
              <div class="sensor-item">
                <DropletIcon :size="24" class="sensor-item__icon" />
                <div>
                  <span class="sensor-label">Humedad</span>
                  <span class="sensor-value">
                    {{ terrarium.sensors?.humidity ?? '--' }}%
                  </span>
                </div>
              </div>
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
              >
                <div class="animal-avatar">
                  {{ animal.name.charAt(0) }}
                </div>
                <div class="animal-card__info">
                  <p class="animal-card__name">{{ animal.name }}</p>
                  <p class="animal-card__species">
                    {{ animal.species?.commonName || 'Especie desconocida' }}
                  </p>
                  <p v-if="animal.species?.scientificName" class="animal-card__scientific">
                    {{ animal.species.scientificName }}
                  </p>
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
                    title="Eliminar animal"
                  >
                    <TrashIcon :size="18" />
                  </button>
                </div>
              </div>

              <!-- Botón Añadir Animal -->
              <button
                @click="showAddAnimalModal = true"
                class="btn-add-animal"
              >
                <PlusIcon :size="32" />
                <span>Añadir Animal</span>
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
                  @click="showAddAnimalModal = true"
                  class="btn btn-primary"
                >
                  <PlusIcon :size="20" />
                  <span>Añadir tu primer animal</span>
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

    <!-- Modal Añadir Animal -->
    <AddAnimalModal
      :is-open="showAddAnimalModal"
      :terrarium-id="terrariumId"
      @close="showAddAnimalModal = false"
      @success="handleAnimalAdded"
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
import AddAnimalModal from '@/components/AddAnimalModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
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
  MapPinIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useTerrariumStore()
const loading = ref(true)
const showAddAnimalModal = ref(false)

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

const handleAnimalAdded = () => {
  // El modal ya recarga los datos, no necesitamos hacer nada extra
}

const handleDeleteAnimal = (animalId: string, animalName: string) => {
  openConfirm(
    'Eliminar Animal',
    `¿Estás seguro de que deseas eliminar a ${animalName}?`,
    async () => {
      await store.removeAnimalFromTerrarium(animalId)
    },
    {
      confirmText: 'Eliminar',
      isDanger: true
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

/* Sensores */
.detail-card__sensors {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.detail-card--glass .detail-card__sensors {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.sensor-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-lg);
}

.detail-card--glass .sensor-item {
  background: rgba(255, 255, 255, 0.05);
}

.sensor-item__icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.detail-card--glass .sensor-item__icon {
  color: rgba(255, 255, 255, 0.8);
}

.sensor-label {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}

.detail-card--glass .sensor-label {
  color: rgba(255, 255, 255, 0.6);
}

.sensor-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.detail-card--glass .sensor-value {
  color: white;
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.animal-card {
  background: var(--color-surface);
  padding: 1rem;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.animal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.animal-card__info {
  flex: 1;
}

.animal-card__name {
  font-weight: 600;
  font-size: 1.125rem;
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

.animal-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
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

.animal-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
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
