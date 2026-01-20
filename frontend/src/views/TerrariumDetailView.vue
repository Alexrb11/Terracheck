<template>
  <div class="min-h-screen pb-20 md:pb-0">
    <Navigation />

    <main class="max-w-4xl mx-auto px-4 py-6">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <LoaderIcon :size="48" class="text-emerald-600 animate-spin" />
      </div>

      <div v-else-if="terrarium" class="space-y-6">
        <!-- Botón volver -->
        <button
          @click="$router.push('/')"
          class="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors mb-4"
        >
          <ArrowLeftIcon :size="20" />
          <span class="font-medium">Volver</span>
        </button>

        <!-- Header del Terrario -->
        <div class="bg-white rounded-3xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-3xl font-bold text-slate-800">{{ terrarium.name }}</h1>
            <component
              :is="terrarium.type === 'glass' ? SquareIcon : Grid3x3Icon"
              :size="40"
              class="text-emerald-600"
            />
          </div>

          <!-- Alerta de compatibilidad -->
          <div
            v-if="terrarium.hasCompatibilityIssue"
            class="flex items-center gap-2 mb-4 p-3 bg-red-50 rounded-2xl border border-red-200"
          >
            <AlertTriangleIcon :size="24" class="text-red-600 flex-shrink-0" />
            <span class="text-sm font-medium text-red-700">
              Problema de compatibilidad detectado
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl">
              <ThermometerIcon :size="24" class="text-amber-500" />
              <div>
                <p class="text-xs text-slate-500">Temperatura</p>
                <p class="text-xl font-semibold text-slate-800">
                  {{ terrarium.sensors?.temperature ?? '--' }}°C
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl">
              <DropletIcon :size="24" class="text-blue-500" />
              <div>
                <p class="text-xs text-slate-500">Humedad</p>
                <p class="text-xl font-semibold text-slate-800">
                  {{ terrarium.sensors?.humidity ?? '--' }}%
                </p>
              </div>
            </div>
          </div>

          <!-- Dimensiones -->
          <div class="mt-4 flex items-center gap-2 text-slate-600">
            <RulerIcon :size="18" />
            <span>
              {{ terrarium.dimensions.width }} x {{ terrarium.dimensions.depth }} x {{ terrarium.dimensions.height }} cm
            </span>
            <span v-if="terrarium.liters" class="text-slate-400">
              ({{ terrarium.liters }}L)
            </span>
          </div>

          <!-- Notas -->
          <p v-if="terrarium.notes" class="mt-4 text-slate-600 italic">
            {{ terrarium.notes }}
          </p>
        </div>

        <!-- Animales -->
        <div class="bg-white rounded-3xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-slate-800">
              Animales ({{ terrarium.animals?.length || 0 }})
            </h2>
            <button
              @click="showAddAnimalModal = true"
              class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 transition-colors shadow-md"
            >
              <PlusIcon :size="20" />
              <span>Añadir Animal</span>
            </button>
          </div>
          
          <div v-if="terrarium.animals && terrarium.animals.length > 0" class="space-y-3">
            <div
              v-for="animal in terrarium.animals"
              :key="animal._id"
              class="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl group"
            >
              <div
                class="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center"
              >
                <span class="text-emerald-700 font-semibold text-lg">
                  {{ animal.name.charAt(0) }}
                </span>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-slate-800 text-lg">{{ animal.name }}</p>
                <p class="text-slate-600">{{ animal.species?.commonName || 'Especie desconocida' }}</p>
                <p v-if="animal.species?.scientificName" class="text-slate-400 text-sm italic">
                  {{ animal.species.scientificName }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <span
                  class="inline-block px-3 py-1 text-xs font-medium rounded-full"
                  :class="{
                    'bg-blue-100 text-blue-700': animal.sex === 'male',
                    'bg-pink-100 text-pink-700': animal.sex === 'female',
                    'bg-gray-100 text-gray-700': animal.sex === 'unknown'
                  }"
                >
                  {{ animal.sex === 'male' ? 'Macho' : animal.sex === 'female' ? 'Hembra' : 'Desconocido' }}
                </span>
                <!-- Botón eliminar -->
                <button
                  @click="handleDeleteAnimal(animal._id, animal.name)"
                  class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar animal"
                >
                  <TrashIcon :size="18" />
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8">
            <div class="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
              <PawPrintIcon :size="32" class="text-emerald-600" />
            </div>
            <p class="text-slate-500 mb-4">No hay animales asignados a este terrario</p>
            <button
              @click="showAddAnimalModal = true"
              class="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg"
            >
              Añadir tu primer animal
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <p class="text-slate-600 text-lg">Terrario no encontrado</p>
        <button
          @click="$router.push('/')"
          class="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-colors"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTerrariumStore } from '@/stores/terrarium'
import Navigation from '@/components/Navigation.vue'
import AddAnimalModal from '@/components/AddAnimalModal.vue'
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
  TrashIcon
} from 'lucide-vue-next'

const route = useRoute()
const store = useTerrariumStore()
const loading = ref(true)
const showAddAnimalModal = ref(false)

const terrariumId = computed(() => route.params.id as string)

const terrarium = computed(() =>
  store.getTerrariumById(terrariumId.value)
)

const handleAnimalAdded = () => {
  // El modal ya recarga los datos, no necesitamos hacer nada extra
}

const handleDeleteAnimal = async (animalId: string, animalName: string) => {
  if (!confirm(`¿Estás seguro de que deseas eliminar a ${animalName}?`)) {
    return
  }

  await store.removeAnimalFromTerrarium(animalId)
}

onMounted(async () => {
  // Si no tenemos terrarios cargados, cargarlos
  if (store.terrariums.length === 0) {
    await store.fetchTerrariums()
  }
  loading.value = false
})
</script>
