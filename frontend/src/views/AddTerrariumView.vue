<template>
  <div class="min-h-screen pb-20 md:pb-0">
    <Navigation />

    <main class="max-w-2xl mx-auto px-4 py-6">
      <!-- Botón volver -->
      <button
        @click="$router.push('/')"
        class="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors mb-6"
      >
        <ArrowLeftIcon :size="20" />
        <span class="font-medium">Volver</span>
      </button>

      <div class="bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <h1 class="text-3xl font-bold text-slate-800 mb-6">Agregar Terrario</h1>

        <!-- Error -->
        <div
          v-if="store.error"
          class="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3"
        >
          <AlertCircleIcon :size="20" class="text-red-600 flex-shrink-0" />
          <p class="text-red-700 text-sm">{{ store.error }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label
              for="name"
              class="block text-lg font-semibold text-slate-800 mb-2"
            >
              Nombre del Terrario
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-emerald-600 focus:outline-none text-lg"
              placeholder="Ej: Terrario Desierto"
            />
          </div>

          <div>
            <label
              for="type"
              class="block text-lg font-semibold text-slate-800 mb-2"
            >
              Tipo
            </label>
            <select
              id="type"
              v-model="form.type"
              required
              class="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-emerald-600 focus:outline-none text-lg"
            >
              <option value="glass">Cristal</option>
              <option value="mesh">Malla</option>
              <option value="hybrid">Híbrido</option>
            </select>
          </div>

          <!-- Bioma -->
          <div>
            <label class="block text-lg font-semibold text-slate-800 mb-3">
              Bioma
            </label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <!-- Tropical -->
              <label
                class="relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all"
                :class="form.biome === 'tropical' ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50'"
              >
                <input
                  type="radio"
                  v-model="form.biome"
                  value="tropical"
                  class="sr-only"
                />
                <div
                  class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                  :class="form.biome === 'tropical' ? 'border-emerald-600 bg-emerald-600' : 'border-stone-300'"
                >
                  <div
                    v-if="form.biome === 'tropical'"
                    class="w-3 h-3 rounded-full bg-white"
                  ></div>
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-slate-800">Tropical</p>
                  <p class="text-sm text-slate-600">Selva</p>
                </div>
                <div class="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center">
                  <span class="text-emerald-700 text-lg">🌴</span>
                </div>
              </label>

              <!-- Desierto -->
              <label
                class="relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all"
                :class="form.biome === 'desert' ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-amber-300 hover:bg-amber-50/50'"
              >
                <input
                  type="radio"
                  v-model="form.biome"
                  value="desert"
                  class="sr-only"
                />
                <div
                  class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                  :class="form.biome === 'desert' ? 'border-amber-600 bg-amber-600' : 'border-stone-300'"
                >
                  <div
                    v-if="form.biome === 'desert'"
                    class="w-3 h-3 rounded-full bg-white"
                  ></div>
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-slate-800">Desierto</p>
                  <p class="text-sm text-slate-600">Árido</p>
                </div>
                <div class="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
                  <span class="text-amber-700 text-lg">🏜️</span>
                </div>
              </label>

              <!-- Templado -->
              <label
                class="relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all"
                :class="form.biome === 'temperate' ? 'border-blue-500 bg-blue-50' : 'border-stone-200 hover:border-blue-300 hover:bg-blue-50/50'"
              >
                <input
                  type="radio"
                  v-model="form.biome"
                  value="temperate"
                  class="sr-only"
                />
                <div
                  class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                  :class="form.biome === 'temperate' ? 'border-blue-600 bg-blue-600' : 'border-stone-300'"
                >
                  <div
                    v-if="form.biome === 'temperate'"
                    class="w-3 h-3 rounded-full bg-white"
                  ></div>
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-slate-800">Templado</p>
                  <p class="text-sm text-slate-600">Bosque</p>
                </div>
                <div class="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                  <span class="text-blue-700 text-lg">🌲</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Dimensiones -->
          <div>
            <label class="block text-lg font-semibold text-slate-800 mb-2">
              Dimensiones (cm)
            </label>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label for="width" class="block text-sm text-slate-600 mb-1">
                  Ancho
                </label>
                <input
                  id="width"
                  v-model.number="form.dimensions.width"
                  type="number"
                  required
                  min="10"
                  class="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-emerald-600 focus:outline-none text-lg"
                />
              </div>
              <div>
                <label for="depth" class="block text-sm text-slate-600 mb-1">
                  Fondo
                </label>
                <input
                  id="depth"
                  v-model.number="form.dimensions.depth"
                  type="number"
                  required
                  min="10"
                  class="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-emerald-600 focus:outline-none text-lg"
                />
              </div>
              <div>
                <label for="height" class="block text-sm text-slate-600 mb-1">
                  Alto
                </label>
                <input
                  id="height"
                  v-model.number="form.dimensions.height"
                  type="number"
                  required
                  min="10"
                  class="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-emerald-600 focus:outline-none text-lg"
                />
              </div>
            </div>
            <p class="mt-2 text-sm text-slate-500">
              Capacidad aproximada: {{ calculatedLiters }}L
            </p>
          </div>

          <!-- Notas -->
          <div>
            <label
              for="notes"
              class="block text-lg font-semibold text-slate-800 mb-2"
            >
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="3"
              class="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-emerald-600 focus:outline-none text-lg resize-none"
              placeholder="Observaciones sobre el terrario..."
            ></textarea>
          </div>

          <div class="flex gap-4">
            <button
              type="button"
              @click="$router.push('/')"
              class="flex-1 px-6 py-3 rounded-2xl border-2 border-stone-300 text-slate-700 font-semibold text-lg hover:bg-stone-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="store.loading || !isFormValid"
              class="flex-1 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LoaderIcon v-if="store.loading" :size="20" class="animate-spin" />
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

const calculatedLiters = computed(() => {
  const { width, depth, height } = form.value.dimensions
  return Math.round((width * depth * height) / 1000)
})

const isFormValid = computed(() => {
  return (
    form.value.name.trim() !== '' &&
    form.value.dimensions.width >= 10 &&
    form.value.dimensions.depth >= 10 &&
    form.value.dimensions.height >= 10
  )
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

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
