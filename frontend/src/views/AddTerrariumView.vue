<template>
  <div class="min-h-screen pb-20 md:pb-0">
    <Navigation />

    <main class="max-w-2xl mx-auto px-4 py-6">
      <div class="bg-white rounded-3xl shadow-lg p-6 md:p-8">
        <h1 class="text-3xl font-bold text-slate-800 mb-6">Agregar Terrario</h1>

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
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="temperature"
                class="block text-lg font-semibold text-slate-800 mb-2"
              >
                Temperatura (°C)
              </label>
              <input
                id="temperature"
                v-model.number="form.temperature"
                type="number"
                required
                min="0"
                max="50"
                class="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-emerald-600 focus:outline-none text-lg"
              />
            </div>
            <div>
              <label
                for="humidity"
                class="block text-lg font-semibold text-slate-800 mb-2"
              >
                Humedad (%)
              </label>
              <input
                id="humidity"
                v-model.number="form.humidity"
                type="number"
                required
                min="0"
                max="100"
                class="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-emerald-600 focus:outline-none text-lg"
              />
            </div>
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
              class="flex-1 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-700 transition-colors shadow-lg"
            >
              Crear Terrario
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTerrariumStore } from '@/stores/terrarium'
import Navigation from '@/components/Navigation.vue'

const router = useRouter()
const store = useTerrariumStore()

const form = ref({
  name: '',
  type: 'glass' as 'glass' | 'mesh',
  temperature: 25,
  humidity: 50,
  width: 60,
  height: 40,
  depth: 30
})

const handleSubmit = () => {
  const newTerrarium = store.addTerrarium({
    ...form.value,
    animals: []
  })
  router.push(`/terrarium/${newTerrarium.id}`)
}
</script>
