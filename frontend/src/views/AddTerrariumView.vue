<template>
  <div class="add-terrarium-view">
    <Navigation />

    <main class="container container--narrow">
      <!-- Botón volver -->
      <button
        @click="$router.push('/')"
        class="btn-back"
      >
        <ArrowLeftIcon :size="20" />
        <span>Volver</span>
      </button>

      <div class="card add-terrarium-view__form-card">
        <h1 class="add-terrarium-view__title">Agregar Terrario</h1>

        <!-- Error -->
        <div
          v-if="store.error"
          class="alert alert-danger add-terrarium-view__error"
        >
          <AlertCircleIcon :size="20" />
          <p>{{ store.error }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="add-terrarium-view__form">
          <!-- Nombre -->
          <div class="form-section">
            <label for="name" class="form-label">
              Nombre del Terrario
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="input-field"
              :class="{ 'input-field--error': errors.name }"
              placeholder="Ej: Terrario Desierto"
            />
            <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
          </div>

          <!-- Tipo -->
          <div class="form-section">
            <label for="type" class="form-label">
              Tipo
            </label>
            <select
              id="type"
              v-model="form.type"
              required
              class="input-field"
            >
              <option value="glass">Cristal</option>
              <option value="mesh">Malla</option>
              <option value="hybrid">Híbrido</option>
            </select>
          </div>

          <!-- Bioma -->
          <div class="form-section">
            <label class="form-label">Bioma</label>
            <div class="biome-grid">
              <!-- Tropical -->
              <label
                class="biome-card biome-card--tropical"
                :class="{ 'biome-card--active': form.biome === 'tropical' }"
              >
                <input
                  type="radio"
                  v-model="form.biome"
                  value="tropical"
                  class="biome-card__input"
                />
                <div class="biome-card__radio">
                  <div
                    v-if="form.biome === 'tropical'"
                    class="biome-card__radio-dot"
                  ></div>
                </div>
                <div class="biome-card__content">
                  <span class="biome-icon">🌴</span>
                  <p class="biome-card__name">Tropical</p>
                  <p class="biome-card__subtitle">Selva</p>
                </div>
              </label>

              <!-- Desierto -->
              <label
                class="biome-card biome-card--desert"
                :class="{ 'biome-card--active': form.biome === 'desert' }"
              >
                <input
                  type="radio"
                  v-model="form.biome"
                  value="desert"
                  class="biome-card__input"
                />
                <div class="biome-card__radio">
                  <div
                    v-if="form.biome === 'desert'"
                    class="biome-card__radio-dot"
                  ></div>
                </div>
                <div class="biome-card__content">
                  <span class="biome-icon">🏜️</span>
                  <p class="biome-card__name">Desierto</p>
                  <p class="biome-card__subtitle">Árido</p>
                </div>
              </label>

              <!-- Templado -->
              <label
                class="biome-card biome-card--temperate"
                :class="{ 'biome-card--active': form.biome === 'temperate' }"
              >
                <input
                  type="radio"
                  v-model="form.biome"
                  value="temperate"
                  class="biome-card__input"
                />
                <div class="biome-card__radio">
                  <div
                    v-if="form.biome === 'temperate'"
                    class="biome-card__radio-dot"
                  ></div>
                </div>
                <div class="biome-card__content">
                  <span class="biome-icon">🌲</span>
                  <p class="biome-card__name">Templado</p>
                  <p class="biome-card__subtitle">Bosque</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Dimensiones -->
          <div class="form-section">
            <label class="form-label">Dimensiones (cm)</label>
            <div class="dimensions-grid">
              <div>
                <label for="width" class="dimensions-grid__label">
                  Ancho
                </label>
                <input
                  id="width"
                  v-model.number="form.dimensions.width"
                  type="number"
                  required
                  min="10"
                  class="input-field"
                  :class="{ 'input-field--error': errors.dimensions?.width }"
                />
                <span v-if="errors.dimensions?.width" class="form-error">{{ errors.dimensions.width }}</span>
              </div>
              <div>
                <label for="depth" class="dimensions-grid__label">
                  Fondo
                </label>
                <input
                  id="depth"
                  v-model.number="form.dimensions.depth"
                  type="number"
                  required
                  min="10"
                  class="input-field"
                  :class="{ 'input-field--error': errors.dimensions?.depth }"
                />
                <span v-if="errors.dimensions?.depth" class="form-error">{{ errors.dimensions.depth }}</span>
              </div>
              <div>
                <label for="height" class="dimensions-grid__label">
                  Alto
                </label>
                <input
                  id="height"
                  v-model.number="form.dimensions.height"
                  type="number"
                  required
                  min="10"
                  class="input-field"
                  :class="{ 'input-field--error': errors.dimensions?.height }"
                />
                <span v-if="errors.dimensions?.height" class="form-error">{{ errors.dimensions.height }}</span>
              </div>
            </div>
            <p class="add-terrarium-view__capacity">
              Capacidad aproximada: {{ calculatedLiters }}L
            </p>
          </div>

          <!-- Notas -->
          <div class="form-section">
            <label for="notes" class="form-label">
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              class="input-field"
              placeholder="Observaciones sobre el terrario..."
            ></textarea>
          </div>

          <!-- Botones de Acción -->
          <div class="add-terrarium-view__actions">
            <button
              type="button"
              @click="$router.push('/')"
              class="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="store.loading"
              class="btn btn-primary"
            >
              <LoaderIcon v-if="store.loading" :size="20" class="add-terrarium-view__loader" />
              <span>{{ store.loading ? 'Creando...' : 'Crear Terrario' }}</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTerrariumStore } from '@/stores/terrarium'
import Navigation from '@/components/Navigation.vue'
import { ArrowLeftIcon, AlertCircleIcon, LoaderIcon } from 'lucide-vue-next'

const router = useRouter()
const store = useTerrariumStore()

const form = ref({
  name: '',
  type: 'glass' as 'glass' | 'mesh' | 'hybrid',
  biome: 'tropical' as 'tropical' | 'desert' | 'temperate',
  dimensions: {
    width: 60,
    depth: 45,
    height: 45
  },
  notes: ''
})

const errors = ref<{
  name?: string
  dimensions?: {
    width?: string
    depth?: string
    height?: string
  }
}>({})

const calculatedLiters = computed(() => {
  const { width, depth, height } = form.value.dimensions
  return Math.round((width * depth * height) / 1000)
})

const validateForm = (): boolean => {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre del terrario es obligatorio'
  }

  const dimensionErrors: { width?: string; depth?: string; height?: string } = {}
  
  if (!form.value.dimensions.width || form.value.dimensions.width < 10) {
    dimensionErrors.width = 'El ancho debe ser al menos 10 cm'
  }
  
  if (!form.value.dimensions.depth || form.value.dimensions.depth < 10) {
    dimensionErrors.depth = 'El fondo debe ser al menos 10 cm'
  }
  
  if (!form.value.dimensions.height || form.value.dimensions.height < 10) {
    dimensionErrors.height = 'La altura debe ser al menos 10 cm'
  }

  if (Object.keys(dimensionErrors).length > 0) {
    errors.value.dimensions = dimensionErrors
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  errors.value = {}

  if (!validateForm()) {
    return
  }

  const newTerrarium = await store.addTerrarium({
    name: form.value.name,
    type: form.value.type,
    biome: form.value.biome,
    dimensions: form.value.dimensions,
    notes: form.value.notes || undefined
  })

  if (newTerrarium) {
    router.push(`/terrarium/${newTerrarium._id}`)
  }
}
</script>

<style scoped>
.add-terrarium-view {
  min-height: 100vh;
  padding-bottom: 80px; /* Espacio para la navegación móvil */
}

@media (min-width: 768px) {
  .add-terrarium-view {
    padding-bottom: 0;
  }
}

.container--narrow {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container--narrow {
    padding: 0 2rem;
  }
}

/* Botón Volver */
.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 1.5rem;
  transition: color var(--transition-fast);
}

.btn-back:hover {
  color: var(--color-primary);
}

/* Form Card */
.add-terrarium-view__form-card {
  padding: 1.5rem;
}

@media (min-width: 768px) {
  .add-terrarium-view__form-card {
    padding: 2rem;
  }
}

.add-terrarium-view__title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 1.5rem;
}

.add-terrarium-view__error {
  margin-bottom: 1.5rem;
  flex-direction: row;
  text-align: left;
  gap: 0.75rem;
}

.add-terrarium-view__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Form Section */
.form-section {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-main);
  font-size: 1.125rem;
}

/* Dimensions Grid */
.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.dimensions-grid__label {
  display: block;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}

.add-terrarium-view__capacity {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

/* Biome Grid */
.biome-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

@media (min-width: 768px) {
  .biome-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Biome Card */
.biome-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  background: var(--color-surface);
  text-align: center;
}

.biome-card:hover {
  border-color: var(--color-primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.biome-card__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.biome-card__radio {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-text-muted);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.biome-card__radio-dot {
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  background-color: white;
}

.biome-card__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.biome-icon {
  font-size: 2rem;
  line-height: 1;
}

.biome-card__name {
  font-weight: 600;
  color: var(--color-text-main);
  margin: 0;
}

.biome-card__subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* Biome Card Active States */
.biome-card--active {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.biome-card--active .biome-card__radio {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
}

.biome-card--active .biome-card__name {
  color: var(--color-primary);
}

/* Biome Card Variants (colores específicos en hover) */
.biome-card--tropical:hover {
  border-color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
}

.biome-card--desert:hover {
  border-color: #f59e0b;
  background-color: rgba(245, 158, 11, 0.1);
}

.biome-card--temperate:hover {
  border-color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.1);
}

/* Actions */
.add-terrarium-view__actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.add-terrarium-view__actions .btn {
  flex: 1;
}

.add-terrarium-view__loader {
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

/* Errores de formulario */
.form-error {
  color: var(--color-accent);
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.input-field--error {
  border-color: var(--color-accent);
}
</style>
