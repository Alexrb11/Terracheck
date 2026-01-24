<template>
  <div class="view-detail">
    <Navigation />

    <main class="container view-detail__main">
      <!-- Loading -->
      <div v-if="loading" class="view-detail__loading">
        <LoaderIcon :size="48" class="view-detail__loader-icon" />
      </div>

      <!-- Error -->
      <div
        v-else-if="store.error && !animal"
        class="alert alert-danger"
      >
        <AlertCircleIcon :size="48" class="view-detail__alert-icon" />
        <p class="view-detail__error-text">{{ store.error }}</p>
        <button
          @click="loadAnimal"
          class="btn btn-danger"
        >
          Reintentar
        </button>
      </div>

      <!-- Contenido -->
      <div v-else-if="animal" class="view-detail__content">
        <!-- Botón volver -->
        <button
          @click="$router.push('/my-animals')"
          class="btn-text view-detail__back-btn"
        >
          <ArrowLeftIcon :size="20" />
          <span>Volver</span>
        </button>

        <!-- Header del Animal -->
        <header class="detail-header">
          <div class="detail-header__title-section">
            <h1 class="detail-header__title">{{ animal.name }}</h1>
            <PawPrintIcon :size="40" class="detail-header__icon" />
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

        <!-- Layout Principal: Perfil + Información -->
        <div class="detail-layout">
          <!-- Columna Izquierda: Perfil -->
          <aside class="card profile-card">
            <!-- Avatar o Foto -->
            <div class="profile-card__avatar">
              <img
                v-if="animal.imageUrl || animal.species?.imageUrl"
                :src="animal.imageUrl || animal.species?.imageUrl"
                :alt="animal.name"
                class="profile-card__image"
              />
              <span v-else class="profile-card__initial">
                {{ animal.name.charAt(0).toUpperCase() }}
              </span>
            </div>

            <!-- Datos Clave -->
            <div class="profile-card__info">
              <h2 class="profile-card__name">{{ animal.name }}</h2>
              
              <!-- Sexo -->
              <div class="profile-card__sex">
                <span
                  class="sex-badge"
                  :class="`sex-badge--${animal.sex || 'unknown'}`"
                >
                  {{ getSexLabel(animal.sex) }}
                </span>
              </div>

              <!-- Especie -->
              <div class="profile-card__species">
                <p class="species-common">{{ animal.species?.commonName || 'Especie desconocida' }}</p>
                <p v-if="animal.species?.scientificName" class="species-scientific">
                  {{ animal.species.scientificName }}
                </p>
              </div>

              <!-- Estado -->
              <div class="profile-card__status">
                <span class="status-badge status-badge--active">
                  Activo
                </span>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="profile-card__actions">
              <button class="btn btn-primary" @click="handleEdit">
                <EditIcon :size="18" />
                <span>Editar</span>
              </button>
              <button class="btn btn-secondary" @click="handleMove">
                <MoveIcon :size="18" />
                <span>Mover de Terrario</span>
              </button>
            </div>
          </aside>

          <!-- Columna Derecha: Información y Stats -->
          <section class="detail-info">
            <!-- Tarjeta Hogar -->
            <div class="card home-card">
              <div class="home-card__header">
                <HomeIcon :size="24" class="home-card__icon" />
                <h3 class="home-card__title">Hogar</h3>
              </div>
              <div class="home-card__content">
                <p v-if="animal.terrarium" class="home-card__terrarium">
                  {{ animal.terrarium.name }}
                </p>
                <p v-else class="home-card__no-terrarium">
                  Sin terrario asignado
                </p>
                <button
                  v-if="animal.terrarium"
                  @click="goToTerrarium"
                  class="btn btn-secondary btn-sm"
                >
                  Ver Terrario
                </button>
              </div>
            </div>

            <!-- Tarjeta Estadísticas -->
            <div class="card stats-card">
              <h3 class="stats-card__title">Estadísticas</h3>
              <div class="info-grid">
                <!-- Peso -->
                <div class="stat-row">
                  <ScaleIcon :size="20" class="stat-row__icon" />
                  <div class="stat-row__content">
                    <span class="stat-row__label">Peso</span>
                    <span class="stat-row__value">
                      {{ animal.weight ? `${animal.weight} g` : 'No registrado' }}
                    </span>
                  </div>
                </div>

                <!-- Fecha de Nacimiento / Edad -->
                <div class="stat-row">
                  <CalendarIcon :size="20" class="stat-row__icon" />
                  <div class="stat-row__content">
                    <span class="stat-row__label">Fecha de Nacimiento</span>
                    <span class="stat-row__value">
                      {{ animal.birthDate ? formatDate(animal.birthDate) : 'Desconocida' }}
                    </span>
                  </div>
                </div>

                <!-- Edad -->
                <div v-if="animal.birthDate" class="stat-row">
                  <ClockIcon :size="20" class="stat-row__icon" />
                  <div class="stat-row__content">
                    <span class="stat-row__label">Edad</span>
                    <span class="stat-row__value">
                      {{ calculateAge(animal.birthDate) }}
                    </span>
                  </div>
                </div>

                <!-- Fecha de Adquisición -->
                <div class="stat-row">
                  <CalendarIcon :size="20" class="stat-row__icon" />
                  <div class="stat-row__content">
                    <span class="stat-row__label">Fecha de Adquisición</span>
                    <span class="stat-row__value">
                      {{ animal.createdAt ? formatDate(animal.createdAt) : 'Desconocida' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tarjeta Información de Especie -->
            <div v-if="animal.species?.parameters" class="card species-info-card">
              <h3 class="species-info-card__title">Parámetros Ideales de la Especie</h3>
              <div class="info-grid">
                <!-- Temperatura -->
                <div class="stat-row">
                  <ThermometerIcon :size="20" class="stat-row__icon" />
                  <div class="stat-row__content">
                    <span class="stat-row__label">Temperatura</span>
                    <span class="stat-row__value">
                      {{ animal.species.parameters.tempMin }}°C - {{ animal.species.parameters.tempMax }}°C
                    </span>
                  </div>
                </div>

                <!-- Humedad -->
                <div class="stat-row">
                  <DropletIcon :size="20" class="stat-row__icon" />
                  <div class="stat-row__content">
                    <span class="stat-row__label">Humedad</span>
                    <span class="stat-row__value">
                      {{ animal.species.parameters.humidityMin }}% - {{ animal.species.parameters.humidityMax }}%
                    </span>
                  </div>
                </div>

                <!-- Comparación con Terrario Actual -->
                <div v-if="animal.terrarium?.sensors" class="stat-row stat-row--comparison">
                  <div class="stat-row__content">
                    <span class="stat-row__label">Estado Actual del Terrario</span>
                    <div class="comparison-values">
                      <div class="comparison-item">
                        <span class="comparison-label">Temp:</span>
                        <span
                          class="comparison-value"
                          :class="getTemperatureClass(animal.terrarium.sensors.temperature)"
                        >
                          {{ animal.terrarium.sensors.temperature ?? '--' }}°C
                        </span>
                      </div>
                      <div class="comparison-item">
                        <span class="comparison-label">Humedad:</span>
                        <span
                          class="comparison-value"
                          :class="getHumidityClass(animal.terrarium.sensors.humidity)"
                        >
                          {{ animal.terrarium.sensors.humidity ?? '--' }}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notas -->
            <div v-if="animal.notes" class="card notes-card">
              <h3 class="notes-card__title">Notas</h3>
              <p class="notes-card__text">{{ animal.notes }}</p>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- Modal de Confirmación -->
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
import { useAnimalStore } from '@/stores/animal'
import Navigation from '@/components/Navigation.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import {
  ArrowLeftIcon,
  LoaderIcon,
  AlertCircleIcon,
  PawPrintIcon,
  EditIcon,
  TrashIcon,
  MoveIcon,
  HomeIcon,
  ScaleIcon,
  CalendarIcon,
  ClockIcon,
  ThermometerIcon,
  DropletIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useAnimalStore()
const loading = ref(true)

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

const animalId = computed(() => route.params.id as string)
const animal = computed(() => store.currentAnimal)

const loadAnimal = async () => {
  loading.value = true
  await store.fetchAnimalById(animalId.value)
  loading.value = false
}

const getSexLabel = (sex?: string): string => {
  const labels: Record<string, string> = {
    male: 'Macho',
    female: 'Hembra',
    unknown: 'Desconocido'
  }
  return labels[sex || 'unknown'] || 'Desconocido'
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const calculateAge = (birthDate: string): string => {
  const birth = new Date(birthDate)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - birth.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) {
    return `${diffDays} día${diffDays !== 1 ? 's' : ''}`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} mes${months !== 1 ? 'es' : ''}`
  } else {
    const years = Math.floor(diffDays / 365)
    const remainingMonths = Math.floor((diffDays % 365) / 30)
    if (remainingMonths === 0) {
      return `${years} año${years !== 1 ? 's' : ''}`
    }
    return `${years} año${years !== 1 ? 's' : ''} y ${remainingMonths} mes${remainingMonths !== 1 ? 'es' : ''}`
  }
}

const getTemperatureClass = (temp: number | null): string => {
  if (!temp || !animal.value?.species?.parameters) return ''
  const { tempMin, tempMax } = animal.value.species.parameters
  if (temp >= tempMin && temp <= tempMax) return 'comparison-value--good'
  return 'comparison-value--warning'
}

const getHumidityClass = (humidity: number | null): string => {
  if (!humidity || !animal.value?.species?.parameters) return ''
  const { humidityMin, humidityMax } = animal.value.species.parameters
  if (humidity >= humidityMin && humidity <= humidityMax) return 'comparison-value--good'
  return 'comparison-value--warning'
}

const goToTerrarium = () => {
  if (animal.value?.terrarium?._id) {
    router.push(`/terrarium/${animal.value.terrarium._id}`)
  }
}

const handleEdit = () => {
  // TODO: Implementar edición
  alert('Funcionalidad de edición próximamente')
}

const handleMove = () => {
  // TODO: Implementar mover de terrario
  alert('Funcionalidad de mover terrario próximamente')
}

const handleDelete = () => {
  if (!animal.value) return
  
  openConfirm(
    'Eliminar Animal',
    `¿Estás seguro de que deseas eliminar a ${animal.value.name}?\n\nEsta acción no se puede deshacer.`,
    async () => {
      const success = await store.deleteAnimal(animal.value!._id)
      if (success) {
        router.push('/my-animals')
      }
    },
    {
      confirmText: 'Eliminar',
      isDanger: true
    }
  )
}

onMounted(async () => {
  await loadAnimal()
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
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  margin-bottom: 1rem;
}

.btn-text:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

/* Header */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.detail-header__title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-header__title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.detail-header__icon {
  color: var(--color-primary);
}

.detail-header__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Layout de 2 Columnas */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .detail-layout {
    grid-template-columns: 1fr 1.5fr;
  }
}

/* ============================================
   TARJETA DE PERFIL
   ============================================ */
.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  height: fit-content;
}

.profile-card__avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
}

.profile-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-card__initial {
  font-size: 4rem;
  font-weight: 700;
  color: var(--color-primary);
}

.profile-card__info {
  text-align: center;
  width: 100%;
}

.profile-card__name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 1rem 0;
}

.profile-card__sex {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

/* Badge de Sexo */
.sex-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
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
  color: var(--color-text-muted);
}

.profile-card__species {
  margin-bottom: 1rem;
}

.species-common {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin: 0 0 0.25rem 0;
}

.species-scientific {
  font-size: 0.875rem;
  font-style: italic;
  color: var(--color-text-muted);
  margin: 0;
}

.profile-card__status {
  margin-bottom: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge--active {
  background-color: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}

.profile-card__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

/* ============================================
   TARJETAS DE INFORMACIÓN
   ============================================ */
.detail-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.home-card,
.stats-card,
.species-info-card,
.notes-card {
  padding: 1.5rem;
}

.home-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.home-card__icon {
  color: var(--color-primary);
}

.home-card__title,
.stats-card__title,
.species-info-card__title,
.notes-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.home-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.home-card__terrarium {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin: 0;
}

.home-card__no-terrarium {
  color: var(--color-text-muted);
  margin: 0;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Grid de Información */
.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 1rem;
}

.stat-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.stat-row__icon {
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.stat-row__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-row__label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.stat-row__value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.stat-row--comparison {
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.comparison-values {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.comparison-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comparison-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  min-width: 80px;
}

.comparison-value {
  font-size: 1rem;
  font-weight: 600;
}

.comparison-value--good {
  color: #16a34a;
}

.comparison-value--warning {
  color: var(--color-accent);
}

/* Notas */
.notes-card__text {
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

/* Loading y Error */
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

.view-detail__alert-icon {
  color: var(--color-accent);
  margin: 0 auto 1rem;
  display: block;
}

.view-detail__error-text {
  color: #991b1b;
  margin-bottom: 1rem;
}
</style>
