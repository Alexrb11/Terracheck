<template>
  <BaseModal
    :is-open="isOpen"
    :title="isEditMode ? 'Editar Animal' : 'Nuevo Habitante'"
    @close="handleClose"
  >
    <template #default>
          <!-- Error -->
          <div
            v-if="localError"
            class="alert alert-danger"
          >
            <AlertCircleIcon :size="20" />
            <p>{{ localError }}</p>
          </div>

          <!-- Warning de compatibilidad -->
          <div
            v-if="compatibilityWarning"
            class="alert alert-warning"
          >
            <AlertTriangleIcon :size="20" />
            <div>
              <p class="alert-warning__title">Aviso de compatibilidad</p>
              <p>{{ compatibilityWarning }}</p>
            </div>
          </div>

          <!-- Loading especies -->
          <div v-if="speciesStore.loading" class="modal-body__loading">
            <LoaderIcon :size="32" class="modal-body__loader-icon" />
          </div>

          <!-- Formulario -->
          <form v-else @submit.prevent="handleSubmit" class="animal-modal-form">
            <!-- Foto de Perfil -->
            <div class="form-group">
              <label for="animal-image" class="form-label">Foto de Perfil</label>
              <div class="image-upload-wrapper">
                <input
                  id="animal-image"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="image-input"
                  ref="fileInputRef"
                />
                <div
                  v-if="selectedImagePreview"
                  class="image-preview"
                >
                  <img
                    :src="selectedImagePreview"
                    alt="Vista previa"
                    class="image-preview__img"
                  />
                  <button
                    type="button"
                    @click="clearImage"
                    class="image-preview__remove"
                    title="Eliminar imagen"
                  >
                    ×
                  </button>
                </div>
                <label
                  v-else
                  for="animal-image"
                  class="image-upload-label"
                >
                  <ImageIcon :size="24" />
                  <span>Seleccionar imagen</span>
                </label>
              </div>
            </div>

            <!-- Nombre -->
            <div class="form-group">
              <label for="animal-name" class="form-label">Nombre del animal *</label>
              <div class="input-wrapper">
                <PawPrintIcon :size="20" class="input-icon" />
                <input 
                  id="animal-name"
                  v-model="form.name" 
                  type="text" 
                  class="input-field" 
                  placeholder="Ej: Leo, Coco, Verde..."
                  required 
                />
              </div>
            </div>

            <!-- Especie -->
            <div class="form-group">
              <label for="animal-species" class="form-label">Especie *</label>
              <div class="select-wrapper">
                <FishIcon :size="20" class="input-icon" />
                <select 
                  id="animal-species" 
                  v-model="form.species" 
                  class="input-field" 
                  required
                >
                  <option value="" disabled>Selecciona una especie</option>
                  <option 
                    v-for="species in speciesStore.species" 
                    :key="species._id" 
                    :value="species._id"
                  >
                    {{ species.commonName }} ({{ species.biome }})
                  </option>
                </select>
                <ChevronDownIcon :size="16" class="select-arrow" />
              </div>
              <!-- Info de especie seleccionada -->
              <div v-if="selectedSpecies" class="species-info">
                <p class="species-info__name">{{ selectedSpecies.scientificName }}</p>
                <p class="species-info__params">
                  Temp: {{ selectedSpecies.parameters.tempMin }}-{{ selectedSpecies.parameters.tempMax }}°C |
                  Humedad: {{ selectedSpecies.parameters.humidityMin }}-{{ selectedSpecies.parameters.humidityMax }}%
                </p>
              </div>
            </div>

            <!-- Sexo -->
            <div class="form-group">
              <label class="form-label" id="sex-label">Sexo *</label>
              <div class="sex-buttons" role="group" aria-labelledby="sex-label">
                <button
                  type="button"
                  @click="form.sex = 'male'"
                  class="sex-button"
                  :class="{ 'sex-button--active': form.sex === 'male' }"
                >
                  Macho
                </button>
                <button
                  type="button"
                  @click="form.sex = 'female'"
                  class="sex-button"
                  :class="{ 'sex-button--active': form.sex === 'female' }"
                >
                  Hembra
                </button>
                <button
                  type="button"
                  @click="form.sex = 'unknown'"
                  class="sex-button"
                  :class="{ 'sex-button--active': form.sex === 'unknown' }"
                >
                  ?
                </button>
              </div>
            </div>

            <!-- Fecha de nacimiento (opcional) -->
            <div class="form-group">
              <label for="animal-birthdate" class="form-label">Fecha de nacimiento (aproximada)</label>
              <input
                id="animal-birthdate"
                v-model="form.birthDate"
                type="date"
                :max="today"
                class="input-field"
              />
            </div>

            <!-- Peso (opcional) -->
            <div class="form-group">
              <label for="animal-weight" class="form-label">Peso (gramos)</label>
              <input
                id="animal-weight"
                v-model.number="form.weight"
                type="number"
                min="0"
                step="0.1"
                class="input-field"
                placeholder="Ej: 45"
              />
            </div>

            <!-- Notas (opcional) -->
            <div class="form-group">
              <label for="animal-notes" class="form-label">Notas</label>
              <textarea
                id="animal-notes"
                v-model="form.notes"
                class="input-field"
                rows="3"
                placeholder="Notas adicionales sobre el animal..."
              />
            </div>
          </form>
    </template>

    <template #footer>
      <button 
        type="button" 
        class="btn btn-secondary" 
        @click="handleClose"
      >
        Cancelar
      </button>
      <button 
        type="button" 
        class="btn btn-primary" 
        :disabled="isSubmitting || !isFormValid || speciesStore.loading"
        @click="handleSubmit"
      >
        <LoaderIcon v-if="isSubmitting" :size="20" class="modal-footer__loader" />
        <span>{{ isSubmitting ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Añadir Animal') }}</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, toRef } from 'vue'
import { useTerrariumStore } from '@/stores/terrarium'
import { useSpeciesStore } from '@/stores/species'
import { useAnimalStore, type AnimalWithTerrarium } from '@/stores/animal'
import BaseModal from '@/components/BaseModal.vue'
import { useScrollLock } from '@/composables/useScrollLock'
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  LoaderIcon,
  PawPrintIcon,
  FishIcon,
  ChevronDownIcon,
  ImageIcon
} from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  terrariumId?: string
  animalToEdit?: AnimalWithTerrarium | null
}>()

const emit = defineEmits<{
  close: []
  success: []
  saved: []
}>()

const terrariumStore = useTerrariumStore()
const speciesStore = useSpeciesStore()
const animalStore = useAnimalStore()

// Bloquear scroll cuando el modal está abierto
useScrollLock(toRef(props, 'isOpen'))

const form = ref({
  name: '',
  species: '',
  sex: 'unknown' as 'male' | 'female' | 'unknown',
  birthDate: '',
  weight: null as number | null,
  notes: ''
})

const localError = ref<string | null>(null)
const compatibilityWarning = ref<string | null>(null)
const isSubmitting = ref(false)
const selectedImageFile = ref<File | null>(null)
const selectedImagePreview = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const today = new Date().toISOString().split('T')[0]

const isEditMode = computed(() => {
  return !!props.animalToEdit
})

const isFormValid = computed(() => {
  return form.value.name.trim() !== '' && form.value.species !== ''
})

const selectedSpecies = computed(() => {
  if (!form.value.species) return null
  return speciesStore.getSpeciesById(form.value.species)
})

const resetForm = () => {
  form.value = {
    name: '',
    species: '',
    sex: 'unknown',
    birthDate: '',
    weight: null,
    notes: ''
  }
  localError.value = null
  compatibilityWarning.value = null
  selectedImageFile.value = null
  selectedImagePreview.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      localError.value = 'Por favor, selecciona un archivo de imagen válido'
      return
    }
    
    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      localError.value = 'La imagen no puede superar los 5MB'
      return
    }
    
    selectedImageFile.value = file
    
    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const clearImage = () => {
  selectedImageFile.value = null
  selectedImagePreview.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const fillFormFromAnimal = (animal: AnimalWithTerrarium) => {
  form.value = {
    name: animal.name || '',
    species: animal.species?._id || '',
    sex: animal.sex || 'unknown',
    birthDate: animal.birthDate ? new Date(animal.birthDate).toISOString().split('T')[0] : '',
    weight: animal.weight || null,
    notes: animal.notes || ''
  }
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  localError.value = null
  compatibilityWarning.value = null
  isSubmitting.value = true

  try {
    const animalData: any = {
      name: form.value.name,
      species: form.value.species,
      sex: form.value.sex,
      ...(form.value.birthDate ? { birthDate: form.value.birthDate } : {}),
      ...(form.value.weight !== null ? { weight: form.value.weight } : {}),
      ...(form.value.notes ? { notes: form.value.notes } : {})
    }

    let animalId: string | null = null

    // Si estamos en modo edición
    if (isEditMode.value && props.animalToEdit) {
      // Si hay un terrariumId en props, añadirlo a los datos
      if (props.terrariumId) {
        animalData.terrarium = props.terrariumId
      }

      const updatedAnimal = await animalStore.updateAnimal(props.animalToEdit._id, animalData)

      if (updatedAnimal) {
        animalId = updatedAnimal._id
        
        // Si hay una imagen seleccionada, subirla
        if (selectedImageFile.value && animalId) {
          const uploadSuccess = await animalStore.uploadProfileImage(animalId, selectedImageFile.value)
          if (!uploadSuccess) {
            localError.value = animalStore.error || 'Error al subir la imagen de perfil'
            isSubmitting.value = false
            return
          }
        }
        
        emit('saved')
        emit('success')
        handleClose()
      } else {
        localError.value = animalStore.error || 'Error al actualizar el animal'
      }
    } else {
      // Modo creación
      if (props.terrariumId) {
        // Crear animal y asignarlo a un terrario
        const result = await terrariumStore.addAnimalToTerrarium(props.terrariumId, animalData)

        if (result.success) {
          // Obtener el ID del animal recién creado
          await animalStore.fetchMyAnimals()
          const newAnimal = animalStore.myAnimals.find(a => 
            a.name === form.value.name && 
            a.species?._id === form.value.species &&
            a.terrarium?._id === props.terrariumId
          )
          if (newAnimal) {
            animalId = newAnimal._id
          }
          
          if (result.message) {
            // Hay un warning de compatibilidad pero el animal se añadió
            compatibilityWarning.value = result.message
          }
        } else {
          localError.value = result.message || 'Error al añadir el animal'
          isSubmitting.value = false
          return
        }
      } else {
        // Crear animal sin asignar a terrario (modo creación pura)
        try {
          const token = localStorage.getItem('token')
          const response = await fetch('/api/animals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(animalData)
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Error al crear el animal')
          }

          animalId = data.data._id
        } catch (err) {
          localError.value = err instanceof Error ? err.message : 'Error desconocido'
          isSubmitting.value = false
          return
        }
      }

      // Si hay una imagen seleccionada y tenemos el ID, subirla
      if (selectedImageFile.value && animalId) {
        const uploadSuccess = await animalStore.uploadProfileImage(animalId, selectedImageFile.value)
        if (!uploadSuccess) {
          localError.value = animalStore.error || 'Error al subir la imagen de perfil'
          isSubmitting.value = false
          return
        }
      }

      // Si hay un warning de compatibilidad, mostrar brevemente antes de cerrar
      if (compatibilityWarning.value) {
        setTimeout(() => {
          emit('saved')
          emit('success')
          handleClose()
        }, 2000)
      } else {
        emit('saved')
        emit('success')
        handleClose()
      }
    }
  } catch (err) {
    localError.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    isSubmitting.value = false
  }
}

// Cargar especies al abrir el modal y rellenar formulario si estamos en modo edición
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    speciesStore.fetchSpecies()
    if (props.animalToEdit) {
      fillFormFromAnimal(props.animalToEdit)
    } else {
      resetForm()
    }
  }
})

// También observar cambios en animalToEdit
watch(() => props.animalToEdit, (animal) => {
  if (props.isOpen && animal) {
    fillFormFromAnimal(animal)
  }
}, { deep: true })

onMounted(() => {
  if (props.isOpen) {
    speciesStore.fetchSpecies()
    if (props.animalToEdit) {
      fillFormFromAnimal(props.animalToEdit)
    }
  }
})
</script>

<style scoped>
/* ============================================
   LOADING
   ============================================ */
.modal-body__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.modal-body__loader-icon {
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
   FORMULARIO
   ============================================ */
.animal-modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ============================================
   ALERTAS
   ============================================ */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  margin-bottom: 1rem;
}

.alert-danger {
  background-color: rgba(239, 108, 0, 0.1);
  border: 1px solid rgba(239, 108, 0, 0.3);
  color: #d84315;
}

.alert-warning {
  background-color: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #b45309;
}

.alert-warning__title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.alert p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* ============================================
   SUBIDA DE IMAGEN
   ============================================ */
.image-upload-wrapper {
  position: relative;
}

.image-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  overflow: hidden;
}

.image-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  border: 2px dashed rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-lg);
  background: rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-muted);
}

.image-upload-label:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.image-upload-label span {
  font-size: 0.875rem;
  font-weight: 500;
}

.image-preview {
  position: relative;
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.image-preview__img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.image-preview__remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  line-height: 1;
  transition: background var(--transition-fast);
}

.image-preview__remove:hover {
  background: rgba(239, 68, 68, 0.9);
}

/* ============================================
   FORMULARIOS
   ============================================ */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-main);
}

/* Input con icono */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: var(--color-text-muted);
  pointer-events: none;
  z-index: 1;
}

.input-wrapper .input-field {
  padding-left: 3rem;
}

/* Select personalizado */
.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.select-wrapper .input-icon {
  position: absolute;
  left: 1rem;
  z-index: 1;
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-text-muted);
  z-index: 1;
}

.select-wrapper .input-field {
  padding-left: 3rem;
  padding-right: 3rem;
  appearance: none; /* Quita estilo por defecto del navegador */
  background-image: none; /* Quita la flecha nativa */
}

/* Textarea */
textarea.input-field {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

/* Info de especie seleccionada */
.species-info {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: var(--color-primary-light);
  border-radius: var(--radius-md);
}

.species-info__name {
  font-weight: 600;
  color: var(--color-primary);
  font-size: 0.875rem;
  margin: 0 0 0.25rem 0;
}

.species-info__params {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* Botones de sexo */
.sex-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.sex-button {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  border: 2px solid transparent;
  background: rgba(0, 0, 0, 0.02);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
}

.sex-button:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-text-main);
}

.sex-button--active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.sex-button:first-child.sex-button--active {
  background: rgba(59, 130, 246, 0.2);
  border-color: #2563eb;
  color: #1e3a8a;
}

.sex-button:nth-child(2).sex-button--active {
  background: rgba(236, 72, 153, 0.2);
  border-color: #db2777;
  color: #9f1239;
}

.sex-button:last-child.sex-button--active {
  background: rgba(0, 0, 0, 0.12);
  border-color: var(--color-text-main);
  color: var(--color-text-main);
}

/* ============================================
   FOOTER
   ============================================ */
.modal-footer__loader {
  animation: spin 1s linear infinite;
}

:deep(.modal-footer .btn) {
  flex: 1;
  max-width: 200px;
}
</style>
