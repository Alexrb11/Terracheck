<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="handleClose"
    >
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <!-- Modal -->
      <div
        class="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <!-- Header -->
        <div class="sticky top-0 bg-white rounded-t-3xl border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <h2 id="modal-title" class="text-2xl font-bold text-slate-800">
            Añadir Animal
          </h2>
          <button
            @click="handleClose"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-stone-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <XIcon :size="24" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Error -->
          <div
            v-if="localError"
            class="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3"
          >
            <AlertCircleIcon :size="20" class="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-red-700 text-sm">{{ localError }}</p>
            </div>
          </div>

          <!-- Warning de compatibilidad -->
          <div
            v-if="compatibilityWarning"
            class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3"
          >
            <AlertTriangleIcon :size="20" class="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-amber-800 text-sm font-medium">Aviso de compatibilidad</p>
              <p class="text-amber-700 text-sm mt-1">{{ compatibilityWarning }}</p>
            </div>
          </div>

          <!-- Loading especies -->
          <div v-if="speciesStore.loading" class="flex items-center justify-center py-8">
            <LoaderIcon :size="32" class="text-emerald-600 animate-spin" />
          </div>

          <!-- Formulario -->
          <form v-else @submit.prevent="handleSubmit" class="space-y-5">
            <!-- Nombre -->
            <div>
              <label for="animal-name" class="block text-sm font-medium text-slate-700 mb-2">
                Nombre del animal *
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <PawPrintIcon :size="20" class="text-slate-400" />
                </div>
                <input
                  id="animal-name"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-emerald-600 focus:outline-none text-lg"
                  placeholder="Ej: Leo, Coco, Verde..."
                />
              </div>
            </div>

            <!-- Especie -->
            <div>
              <label for="animal-species" class="block text-sm font-medium text-slate-700 mb-2">
                Especie *
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FishIcon :size="20" class="text-slate-400" />
                </div>
                <select
                  id="animal-species"
                  v-model="form.species"
                  required
                  class="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-emerald-600 focus:outline-none text-lg appearance-none bg-white"
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
                <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDownIcon :size="20" class="text-slate-400" />
                </div>
              </div>
              <!-- Info de especie seleccionada -->
              <div v-if="selectedSpecies" class="mt-2 p-3 bg-emerald-50 rounded-xl text-sm">
                <p class="text-emerald-800 font-medium">{{ selectedSpecies.scientificName }}</p>
                <p class="text-emerald-600 text-xs mt-1">
                  Temp: {{ selectedSpecies.parameters.tempMin }}-{{ selectedSpecies.parameters.tempMax }}°C |
                  Humedad: {{ selectedSpecies.parameters.humidityMin }}-{{ selectedSpecies.parameters.humidityMax }}%
                </p>
              </div>
            </div>

            <!-- Sexo -->
            <div>
              <label for="animal-sex" class="block text-sm font-medium text-slate-700 mb-2">
                Sexo *
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  @click="form.sex = 'male'"
                  :class="[
                    'py-3 px-4 rounded-2xl font-medium transition-all text-center',
                    form.sex === 'male'
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
                      : 'bg-stone-100 text-slate-600 border-2 border-transparent hover:bg-stone-200'
                  ]"
                >
                  Macho
                </button>
                <button
                  type="button"
                  @click="form.sex = 'female'"
                  :class="[
                    'py-3 px-4 rounded-2xl font-medium transition-all text-center',
                    form.sex === 'female'
                      ? 'bg-pink-100 text-pink-700 border-2 border-pink-400'
                      : 'bg-stone-100 text-slate-600 border-2 border-transparent hover:bg-stone-200'
                  ]"
                >
                  Hembra
                </button>
                <button
                  type="button"
                  @click="form.sex = 'unknown'"
                  :class="[
                    'py-3 px-4 rounded-2xl font-medium transition-all text-center',
                    form.sex === 'unknown'
                      ? 'bg-gray-200 text-gray-700 border-2 border-gray-400'
                      : 'bg-stone-100 text-slate-600 border-2 border-transparent hover:bg-stone-200'
                  ]"
                >
                  ?
                </button>
              </div>
            </div>

            <!-- Fecha de nacimiento (opcional) -->
            <div>
              <label for="animal-birthdate" class="block text-sm font-medium text-slate-700 mb-2">
                Fecha de nacimiento (aproximada)
              </label>
              <input
                id="animal-birthdate"
                v-model="form.birthDate"
                type="date"
                :max="today"
                class="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-emerald-600 focus:outline-none text-lg"
              />
            </div>

            <!-- Peso (opcional) -->
            <div>
              <label for="animal-weight" class="block text-sm font-medium text-slate-700 mb-2">
                Peso (gramos)
              </label>
              <input
                id="animal-weight"
                v-model.number="form.weight"
                type="number"
                min="0"
                step="0.1"
                class="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-emerald-600 focus:outline-none text-lg"
                placeholder="Ej: 45"
              />
            </div>

            <!-- Botones -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="handleClose"
                class="flex-1 py-3 px-6 rounded-2xl border-2 border-stone-300 text-slate-700 font-semibold hover:bg-stone-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="terrariumStore.loading || !isFormValid"
                class="flex-1 py-3 px-6 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LoaderIcon v-if="terrariumStore.loading" :size="20" class="animate-spin" />
                <span>{{ terrariumStore.loading ? 'Guardando...' : 'Añadir Animal' }}</span>
              </button>
            </div>
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
