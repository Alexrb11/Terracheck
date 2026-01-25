<template>
  <BaseModal
    :is-open="isOpen"
    title="Seleccionar Animal"
    @close="$emit('close')"
  >
    <template #default>
      <!-- Loading -->
      <div v-if="animalStore.loading" class="select-animal-modal__loading">
        <LoaderIcon :size="32" class="select-animal-modal__loader-icon" />
      </div>

      <!-- Error -->
      <div
        v-else-if="animalStore.error"
        class="alert alert-danger"
      >
        <AlertCircleIcon :size="20" />
        <p>{{ animalStore.error }}</p>
      </div>

      <!-- Lista de animales disponibles -->
      <div v-else-if="availableAnimals.length > 0" class="select-animal-modal__list">
        <div
          v-for="animal in availableAnimals"
          :key="animal._id"
          class="animal-select-card"
          @click="handleSelectAnimal(animal._id)"
        >
          <!-- Avatar -->
          <div class="animal-select-card__avatar">
            <img
              v-if="animal.imageUrl || animal.species?.imageUrl"
              :src="getImageUrl(animal.imageUrl || animal.species?.imageUrl)"
              :alt="animal.name"
              class="animal-select-card__image"
            />
            <span v-else class="animal-select-card__initial">
              {{ animal.name.charAt(0).toUpperCase() }}
            </span>
          </div>

          <!-- Información -->
          <div class="animal-select-card__info">
            <h3 class="animal-select-card__name">{{ animal.name }}</h3>
            <p class="animal-select-card__species">
              {{ animal.species?.commonName || 'Especie desconocida' }}
            </p>
          </div>

          <!-- Badge de ubicación -->
          <div class="animal-select-card__location">
            <span
              v-if="animal.terrarium"
              class="location-badge location-badge--warning"
            >
              📍 Mover desde {{ animal.terrarium.name }}
            </span>
            <span
              v-else
              class="location-badge location-badge--success"
            >
              ✨ Sin asignar
            </span>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="select-animal-modal__empty">
        <PawPrintIcon :size="48" class="select-animal-modal__empty-icon" />
        <p class="select-animal-modal__empty-text">
          No tienes más animales para añadir
        </p>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, toRef } from 'vue'
import { useAnimalStore } from '@/stores/animal'
import BaseModal from '@/components/BaseModal.vue'
import { getImageUrl } from '@/utils/image'
import {
  LoaderIcon,
  AlertCircleIcon,
  PawPrintIcon
} from 'lucide-vue-next'
import { useScrollLock } from '@/composables/useScrollLock'

const props = defineProps<{
  isOpen: boolean
  terrariumId: string
  currentAnimals?: (string | { _id: string })[] // Array de IDs o objetos con _id de animales ya en el terrario
}>()

const emit = defineEmits<{
  close: []
  added: []
}>()

const animalStore = useAnimalStore()

// Bloquear scroll cuando el modal está abierto
useScrollLock(toRef(props, 'isOpen'))

// Computed: Filtrar animales que NO están ya en este terrario
const availableAnimals = computed(() => {
  if (!props.currentAnimals) {
    return animalStore.myAnimals
  }
  
  // Si currentAnimals es un array de objetos, extraer los IDs y usar Set para mejor rendimiento
  const currentIds = new Set(
    props.currentAnimals.map((item: any) => 
      typeof item === 'string' ? item : item._id
    )
  )
  
  return animalStore.myAnimals.filter(
    (animal) => !currentIds.has(animal._id)
  )
})

const handleSelectAnimal = async (animalId: string) => {
  try {
    await animalStore.updateAnimal(animalId, {
      terrarium: props.terrariumId
    })
    emit('added')
    emit('close')
  } catch (error) {
    console.error('Error al asignar animal:', error)
  }
}

// Cargar animales al abrir el modal
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && animalStore.myAnimals.length === 0) {
    animalStore.fetchMyAnimals()
  }
})

onMounted(() => {
  if (props.isOpen && animalStore.myAnimals.length === 0) {
    animalStore.fetchMyAnimals()
  }
})
</script>

<style scoped>
/* ============================================
   LOADING
   ============================================ */
.select-animal-modal__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.select-animal-modal__loader-icon {
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

/* ============================================
   LISTA DE ANIMALES
   ============================================ */
.select-animal-modal__list {
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.25rem 0.5rem;
}

/* Scrollbar personalizado */
.select-animal-modal__list::-webkit-scrollbar {
  width: 8px;
}

.select-animal-modal__list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.select-animal-modal__list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.select-animal-modal__list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* ============================================
   TARJETA DE ANIMAL
   ============================================ */
.animal-select-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-surface);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.animal-select-card:hover {
  background: rgba(0, 0, 0, 0.02);
  border-color: var(--color-primary);
  transform: translateX(4px);
}

/* Avatar */
.animal-select-card__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.animal-select-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.animal-select-card__initial {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

/* Información */
.animal-select-card__info {
  flex: 1;
  min-width: 0;
}

.animal-select-card__name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.animal-select-card__species {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Badge de ubicación */
.animal-select-card__location {
  flex-shrink: 0;
}

.location-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.location-badge--warning {
  background: rgba(245, 158, 11, 0.2);
  color: #78350f;
}

.location-badge--success {
  background: rgba(34, 197, 94, 0.2);
  color: #14532d;
}

/* Ajustes para modo oscuro */
[data-theme='dark'] .location-badge--warning {
  background: rgba(245, 158, 11, 0.25);
  color: #fbbf24;
}

[data-theme='dark'] .location-badge--success {
  background: rgba(34, 197, 94, 0.25);
  color: #4ade80;
}

[data-theme='dark'] .animal-select-card {
  border-color: var(--color-border-light);
}

[data-theme='dark'] .animal-select-card:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Scrollbar en modo oscuro */
[data-theme='dark'] .select-animal-modal__list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

[data-theme='dark'] .select-animal-modal__list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

[data-theme='dark'] .select-animal-modal__list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ============================================
   ESTADO VACÍO
   ============================================ */
.select-animal-modal__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.select-animal-modal__empty-icon {
  color: var(--color-text-muted);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.select-animal-modal__empty-text {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin: 0;
}

/* ============================================
   RESPONSIVE: AJUSTE PARA MÓVILES
   ============================================ */
@media (max-width: 640px) {
  .select-animal-modal__list {
    padding: 0.25rem 0.75rem;
  }

  .animal-select-card {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .animal-select-card:hover {
    transform: none;
  }

  .animal-select-card__info {
    min-width: calc(100% - 80px); 
  }

  .animal-select-card__location {
    width: 100%;
    margin-left: 72px;
    margin-top: -0.25rem;
    order: 3;
  }
  
  .location-badge {
    white-space: normal; 
    text-align: left;
  }
}
</style>
