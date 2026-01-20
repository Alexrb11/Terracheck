<template>
  <Teleport to="body">
    <div 
      v-if="isOpen"
      class="modal-overlay" 
      @click.self="handleClose"
    >
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header class="modal-header">
          <h2 id="modal-title" class="modal-title">Nuevo Habitante</h2>
          <button 
            class="btn-icon" 
            @click="handleClose" 
            title="Cerrar"
            aria-label="Cerrar"
          >
            <XIcon :size="24" />
          </button>
        </header>

        <div class="modal-body">
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
          <form v-else @submit.prevent="handleSubmit" class="modal-form">
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

            <!-- Footer con botones -->
            <footer class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary" 
                @click="handleClose"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                class="btn btn-primary" 
                :disabled="terrariumStore.loading || !isFormValid"
              >
                <LoaderIcon v-if="terrariumStore.loading" :size="20" class="modal-footer__loader" />
                <span>{{ terrariumStore.loading ? 'Guardando...' : 'Añadir Animal' }}</span>
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useTerrariumStore } from '@/stores/terrarium'
import { useSpeciesStore } from '@/stores/species'
import {
  XIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  LoaderIcon,
  PawPrintIcon,
  FishIcon,
  ChevronDownIcon
} from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  terrariumId: string
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const terrariumStore = useTerrariumStore()
const speciesStore = useSpeciesStore()

const form = ref({
  name: '',
  species: '',
  sex: 'unknown' as 'male' | 'female' | 'unknown',
  birthDate: '',
  weight: null as number | null
})

const localError = ref<string | null>(null)
const compatibilityWarning = ref<string | null>(null)

const today = new Date().toISOString().split('T')[0]

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
    weight: null
  }
  localError.value = null
  compatibilityWarning.value = null
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  localError.value = null
  compatibilityWarning.value = null

  const animalData = {
    name: form.value.name,
    species: form.value.species,
    sex: form.value.sex,
    ...(form.value.birthDate ? { birthDate: form.value.birthDate } : {}),
    ...(form.value.weight ? { weight: form.value.weight } : {})
  }

  const result = await terrariumStore.addAnimalToTerrarium(props.terrariumId, animalData)

  if (result.success) {
    if (result.message) {
      // Hay un warning de compatibilidad pero el animal se añadió
      compatibilityWarning.value = result.message
      // Cerrar después de mostrar brevemente el warning
      setTimeout(() => {
        emit('success')
        handleClose()
      }, 2000)
    } else {
      emit('success')
      handleClose()
    }
  } else {
    localError.value = result.message || 'Error al añadir el animal'
  }
}

// Cargar especies al abrir el modal
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    speciesStore.fetchSpecies()
  }
})

onMounted(() => {
  if (props.isOpen) {
    speciesStore.fetchSpecies()
  }
})
</script>

<style scoped>
/* ============================================
   OVERLAY Y MODAL BASE
   ============================================ */
.modal-overlay {
  position: fixed;
  top: var(--header-height); /* Offset del Header */
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(100vh - var(--header-height));
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: modal-fade-in 0.2s ease-out;
}

/* En móvil, la barra está abajo, así que usamos pantalla completa */
@media (max-width: 767px) {
  .modal-overlay {
    top: 0;
    height: 100vh;
  }
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  box-shadow: var(--shadow-float);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modal-slide-up 0.3s ease-out;
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================
   HEADER
   ============================================ */
.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: 0.25rem;
  border-radius: 50%;
  transition: background var(--transition-fast), color var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.btn-icon:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-text-main);
}

/* ============================================
   BODY
   ============================================ */
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

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

.modal-form {
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
.modal-footer {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.02);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.modal-footer .btn {
  flex: 1;
  max-width: 200px;
}

.modal-footer__loader {
  animation: spin 1s linear infinite;
}
</style>
