<template>
  <div class="profile-view">
    <main class="container profile-view__main">
      <!-- Loading -->
      <div v-if="loading" class="profile-view__loading">
        <LoaderIcon :size="48" class="profile-view__loader-icon" />
      </div>

      <template v-else>
        <!-- Tarjeta de Perfil -->
        <div class="profile-card">
          <div class="profile-card__header">
            <!-- Avatar -->
            <div
              class="profile-card__avatar"
              :style="{ backgroundColor: avatarColor }"
            >
              <span class="profile-card__initial">{{ userInitial }}</span>
            </div>

            <!-- Info -->
            <div class="profile-card__info">
              <h1 class="profile-card__name">{{ authStore.user?.name }}</h1>
              <p v-if="authStore.user?.username" class="profile-card__username">
                @{{ authStore.user.username }}
              </p>
              <div class="profile-card__meta">
                <span
                  class="profile-card__badge"
                  :class="authStore.isAdmin ? 'profile-card__badge--admin' : 'profile-card__badge--user'"
                >
                  <ShieldIcon v-if="authStore.isAdmin" :size="14" />
                  <UserIcon v-else :size="14" />
                  {{ authStore.user?.role?.name || 'Usuario' }}
                </span>
                <span class="profile-card__date">
                  <CalendarIcon :size="14" />
                  Miembro desde {{ memberSince }}
                </span>
              </div>
            </div>

            <!-- Acciones -->
            <div class="profile-card__actions">
              <router-link to="/settings" class="btn btn-outline">
                <SettingsIcon :size="18" />
                <span>Editar Perfil</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Pestañas -->
        <div class="profile-view__tabs">
          <button
            type="button"
            class="profile-view__tab"
            :class="{ 'profile-view__tab--active': activeTab === 'info' }"
            @click="activeTab = 'info'"
          >
            <UserIcon :size="18" />
            <span>Información</span>
          </button>
          <button
            type="button"
            class="profile-view__tab"
            :class="{ 'profile-view__tab--active': activeTab === 'terrariums' }"
            @click="activeTab = 'terrariums'"
          >
            <BoxIcon :size="18" />
            <span>Terrarios</span>
          </button>
          <button
            type="button"
            class="profile-view__tab"
            :class="{ 'profile-view__tab--active': activeTab === 'animals' }"
            @click="activeTab = 'animals'"
          >
            <PawPrintIcon :size="18" />
            <span>Animales</span>
          </button>
        </div>

        <!-- Contenido: Información -->
        <div v-show="activeTab === 'info'" class="profile-view__panel">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-card__icon stat-card__icon--terrarium">
                <BoxIcon :size="28" />
              </div>
              <div class="stat-card__content">
                <p class="stat-card__value">{{ totalTerrariums }}</p>
                <p class="stat-card__label">Terrarios</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card__icon stat-card__icon--animal">
                <PawPrintIcon :size="28" />
              </div>
              <div class="stat-card__content">
                <p class="stat-card__value">{{ totalAnimals }}</p>
                <p class="stat-card__label">Animales</p>
              </div>
            </div>
            <div class="stat-card">
              <div
                class="stat-card__icon"
                :class="`stat-card__icon--${favoriteBiome.key}`"
              >
                <component :is="favoriteBiome.icon" :size="28" />
              </div>
              <div class="stat-card__content">
                <p class="stat-card__value">{{ favoriteBiome.name }}</p>
                <p class="stat-card__label">Bioma Favorito</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido: Terrarios -->
        <div v-show="activeTab === 'terrariums'" class="profile-view__panel">
          <div class="profile-view__panel-header">
            <h3 class="profile-view__panel-title">Mis Terrarios</h3>
            <router-link to="/add" class="btn btn-primary btn-sm">
              <PlusIcon :size="18" />
              <span>Nuevo Terrario</span>
            </router-link>
          </div>
          <div v-if="terrariumStore.terrariums.length > 0" class="grid-gallery">
            <TerrariumCard
              v-for="t in terrariumStore.terrariums"
              :key="t._id"
              :terrarium="t"
            />
          </div>
          <div v-else class="profile-view__empty">
            <BoxIcon :size="48" class="profile-view__empty-icon" />
            <p class="profile-view__empty-text">No tienes terrarios aún</p>
            <router-link to="/add" class="btn btn-primary">Agregar Terrario</router-link>
          </div>
        </div>

        <!-- Contenido: Animales -->
        <div v-show="activeTab === 'animals'" class="profile-view__panel">
          <div class="profile-view__panel-header">
            <h3 class="profile-view__panel-title">Mis Animales</h3>
            <router-link to="/animals" class="btn btn-primary btn-sm">
              <PawPrintIcon :size="18" />
              <span>Ver todos</span>
            </router-link>
          </div>
          <div v-if="animalStore.myAnimals.length > 0" class="grid-gallery profile-view__animals-grid">
            <article
              v-for="animal in animalStore.myAnimals"
              :key="animal._id"
              class="card profile-view__animal-card"
              @click="$router.push(`/my-animals/${animal._id}`)"
              tabindex="0"
              @keydown.enter.prevent="$router.push(`/my-animals/${animal._id}`)"
              @keydown.space.prevent="$router.push(`/my-animals/${animal._id}`)"
            >
              <div class="profile-view__animal-card__avatar">
                <img
                  v-if="animal.imageUrl || animal.species?.imageUrl"
                  :src="getImageUrl(animal.imageUrl || animal.species?.imageUrl)"
                  :alt="animal.name"
                  class="profile-view__animal-card__image"
                />
                <span v-else class="profile-view__animal-card__initial">
                  {{ animal.name?.charAt(0)?.toUpperCase() || '?' }}
                </span>
              </div>
              <div class="profile-view__animal-card__info">
                <h3 class="profile-view__animal-card__name">{{ animal.name }}</h3>
                <p class="profile-view__animal-card__species">
                  {{ animal.species?.commonName || 'Especie desconocida' }}
                </p>
                <p v-if="animal.terrarium?.name" class="profile-view__animal-card__location">
                  {{ animal.terrarium.name }}
                </p>
              </div>
            </article>
          </div>
          <div v-else class="profile-view__empty">
            <PawPrintIcon :size="48" class="profile-view__empty-icon" />
            <p class="profile-view__empty-text">No tienes animales aún</p>
            <router-link to="/animals" class="btn btn-primary">Ir a Animales</router-link>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTerrariumStore } from '@/stores/terrarium'
import { useAnimalStore } from '@/stores/animal'
import TerrariumCard from '@/components/TerrariumCard.vue'
import { getImageUrl } from '@/utils/image'
import {
  LoaderIcon,
  BoxIcon,
  PawPrintIcon,
  UserIcon,
  ShieldIcon,
  CalendarIcon,
  SettingsIcon,
  PalmtreeIcon,
  SunIcon,
  TreesIcon,
  HelpCircleIcon,
  PlusIcon
} from 'lucide-vue-next'

const authStore = useAuthStore()
const terrariumStore = useTerrariumStore()
const animalStore = useAnimalStore()

const loading = ref(true)
const activeTab = ref<'info' | 'terrariums' | 'animals'>('info')

// Colores para el avatar basados en el nombre
const avatarColors = [
  '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', 
  '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'
]

const avatarColor = computed(() => {
  if (!authStore.user?.name) return avatarColors[0]
  const charCode = authStore.user.name.charCodeAt(0)
  return avatarColors[charCode % avatarColors.length]
})

const userInitial = computed(() => {
  return authStore.user?.name?.charAt(0).toUpperCase() || '?'
})

const memberSince = computed(() => {
  if (!authStore.user?.createdAt) return 'Fecha desconocida'
  const date = new Date(authStore.user.createdAt)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long'
  })
})

const totalTerrariums = computed(() => terrariumStore.terrariums.length)
const totalAnimals = computed(() => animalStore.myAnimals.length)

// Bioma favorito (el más repetido en los terrarios)
const biomeConfig = {
  tropical: { name: 'Tropical', icon: PalmtreeIcon, key: 'tropical' },
  desert: { name: 'Desértico', icon: SunIcon, key: 'desert' },
  temperate: { name: 'Templado', icon: TreesIcon, key: 'temperate' },
  none: { name: 'Sin datos', icon: HelpCircleIcon, key: 'none' }
}

const favoriteBiome = computed(() => {
  if (terrariumStore.terrariums.length === 0) {
    return biomeConfig.none
  }

  const biomeCount: Record<string, number> = {}
  
  terrariumStore.terrariums.forEach(t => {
    if (t.biome) {
      biomeCount[t.biome] = (biomeCount[t.biome] || 0) + 1
    }
  })

  const entries = Object.entries(biomeCount)
  if (entries.length === 0) {
    return biomeConfig.none
  }

  const [topBiome] = entries.sort((a, b) => b[1] - a[1])[0]
  return biomeConfig[topBiome as keyof typeof biomeConfig] || biomeConfig.none
})

onMounted(async () => {
  loading.value = true
  
  await Promise.all([
    terrariumStore.fetchTerrariums(),
    animalStore.fetchMyAnimals()
  ])
  
  loading.value = false
})
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background-color: var(--color-background);
}

.profile-view__main {
  padding-top: 2rem;
  padding-bottom: 3rem;
}

/* Loading - Animación orgánica */
.profile-view__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 0;
  gap: 1.5rem;
}

.profile-view__loader-icon {
  color: var(--color-primary);
  animation: spin-bounce 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  filter: drop-shadow(0 8px 16px rgba(74, 103, 65, 0.3));
}

@keyframes spin-bounce {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

/* Tarjeta de Perfil - Forma orgánica y cálida */
.profile-card {
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-accent) 100%);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  box-shadow: var(--shadow-float);
  border: 2px solid var(--color-border-light);
  margin-bottom: 2rem;
  transition: all var(--transition-base);
}

.profile-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 48px rgba(74, 103, 65, 0.2);
  border-color: var(--color-primary);
}

.profile-card__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
}

.profile-card__avatar {
  width: 110px;
  height: 110px;
  border-radius: 35% 65% 60% 40% / 45% 55% 45% 55%; /* Forma orgánica expresiva */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-float);
  border: 4px solid white;
  transition: all var(--transition-base);
  animation: morph-avatar 5s ease-in-out infinite;
}

@keyframes morph-avatar {
  0%, 100% {
    border-radius: 35% 65% 60% 40% / 45% 55% 45% 55%;
  }
  50% {
    border-radius: 65% 35% 40% 60% / 55% 45% 55% 45%;
  }
}

.profile-card:hover .profile-card__avatar {
  transform: scale(1.08) rotate(3deg);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);
}

.profile-card__initial {
  font-size: 2.75rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-family: var(--font-family-serif);
}

.profile-card__info {
  flex: 1;
}

.profile-card__name {
  font-size: 2rem;
  font-weight: 400;
  color: var(--color-text-main);
  margin: 0 0 0.25rem 0;
  font-family: var(--font-family-serif);
  letter-spacing: -0.03em;
}

.profile-card__username {
  font-size: 1.125rem;
  color: var(--color-text-muted);
  margin: 0 0 1rem 0;
  font-style: italic;
}

.profile-card__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.profile-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  border: 2px solid;
}

.profile-card__badge:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.profile-card__badge--admin {
  background: linear-gradient(135deg, rgba(212, 163, 115, 0.2) 0%, rgba(212, 163, 115, 0.1) 100%);
  color: var(--color-secondary);
  border-color: var(--color-secondary);
}

.profile-card__badge--user {
  background: linear-gradient(135deg, var(--color-primary-light) 0%, rgba(233, 237, 198, 0.5) 100%);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.profile-card__date {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.profile-card__actions {
  width: 100%;
}

.profile-card__actions .btn {
  width: 100%;
  justify-content: center;
}

/* Grid de Estadísticas - Anti-Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
}

.stat-card {
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-accent) 100%);
  border-radius: var(--radius-xl);
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border: 2px solid var(--color-border-light);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-float);
  border-color: var(--color-primary);
}

/* Anti-Grid: Desplazamiento alterno en desktop */
@media (min-width: 640px) {
  .stats-grid > .stat-card:nth-child(2) {
    transform: translateY(15px);
  }
  
  .stats-grid > .stat-card:nth-child(2):hover {
    transform: translateY(11px) scale(1.02);
  }
}

.stat-card__icon {
  width: 64px;
  height: 64px;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; /* Forma orgánica */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.stat-card:hover .stat-card__icon {
  transform: rotate(10deg) scale(1.1);
}

.stat-card__icon--terrarium {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: white;
}

.stat-card__icon--animal {
  background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
  color: var(--color-primary);
}

.stat-card__icon--tropical {
  background: linear-gradient(135deg, var(--color-primary) 0%, #8ba888 100%);
  color: white;
}

.stat-card__icon--desert {
  background: linear-gradient(135deg, var(--color-secondary) 0%, #e9c896 100%);
  color: white;
}

.stat-card__icon--temperate {
  background: linear-gradient(135deg, #8ba888 0%, var(--color-accent) 100%);
  color: var(--color-primary);
}

.stat-card__icon--none {
  background: linear-gradient(135deg, var(--color-text-muted) 0%, var(--color-border) 100%);
  color: white;
}

.stat-card__content {
  flex: 1;
}

.stat-card__value {
  font-size: 2rem;
  font-weight: 400;
  color: var(--color-text-main);
  margin: 0;
  font-family: var(--font-family-serif);
  letter-spacing: -0.02em;
}

.stat-card__label {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  margin: 0;
  font-weight: 500;
}

/* Responsive */
@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .profile-card__header {
    flex-direction: row;
    text-align: left;
    gap: 2rem;
  }

  .profile-card__meta {
    justify-content: flex-start;
  }

  .profile-card__actions {
    width: auto;
    margin-left: auto;
  }

  .profile-card__actions .btn {
    width: auto;
  }
}

@media (min-width: 768px) {
  .profile-card {
    padding: 2.5rem;
  }

  .profile-card__avatar {
    width: 120px;
    height: 120px;
  }

  .profile-card__initial {
    font-size: 3rem;
  }

  .profile-card__name {
    font-size: 2rem;
  }
}

/* Dark Mode */
[data-theme='dark'] .profile-card__badge--admin {
  background: rgba(147, 51, 234, 0.25);
  color: #a855f7;
}

[data-theme='dark'] .stat-card__icon--terrarium {
  background: rgba(59, 130, 246, 0.2);
}

[data-theme='dark'] .stat-card__icon--animal {
  background: rgba(16, 185, 129, 0.2);
}

[data-theme='dark'] .stat-card__icon--tropical {
  background: rgba(16, 185, 129, 0.2);
}

[data-theme='dark'] .stat-card__icon--desert {
  background: rgba(245, 158, 11, 0.2);
}

[data-theme='dark'] .stat-card__icon--temperate {
  background: rgba(34, 197, 94, 0.2);
}

[data-theme='dark'] .stat-card__icon--none {
  background: rgba(148, 163, 184, 0.2);
}

/* Tabs - Formas orgánicas */
.profile-view__tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 2px solid var(--color-border-light);
  overflow-x: auto;
  box-shadow: var(--shadow-sm);
}

.profile-view__tab {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.5rem;
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.profile-view__tab:hover {
  color: var(--color-primary);
  background: var(--color-accent);
  transform: translateY(-2px);
  border-color: var(--color-border);
}

.profile-view__tab--active {
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent) 100%);
  color: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.profile-view__panel {
  min-height: 200px;
}

.profile-view__panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.profile-view__panel-title {
  font-size: 1.75rem;
  font-weight: 400;
  color: var(--color-text-main);
  margin: 0;
  font-family: var(--font-family-serif);
  letter-spacing: -0.02em;
}

.profile-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
  background: linear-gradient(135deg, var(--color-accent) 0%, transparent 100%);
  border-radius: var(--radius-xl);
  border: 2px solid var(--color-border-light);
  box-shadow: var(--shadow-md);
}

.profile-view__empty-icon {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 8px rgba(74, 103, 65, 0.2));
  animation: float-gentle 3s ease-in-out infinite;
}

@keyframes float-gentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.profile-view__empty-text {
  color: var(--color-text-muted);
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-style: italic;
}

.profile-view__animals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

/* Anti-Grid para animales en desktop */
@media (min-width: 768px) {
  .profile-view__animals-grid > .profile-view__animal-card:nth-child(even) {
    transform: translateY(20px);
  }
  
  .profile-view__animals-grid > .profile-view__animal-card:nth-child(even):hover {
    transform: translateY(16px) scale(1.02);
  }
}

.profile-view__animal-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-base);
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-accent) 100%);
  border-radius: var(--radius-xl);
  border: 2px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}

.profile-view__animal-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-float);
  border-color: var(--color-primary);
}

.profile-view__animal-card__avatar {
  width: 80px;
  height: 80px;
  border-radius: 35% 65% 60% 40% / 45% 55% 45% 55%; /* Forma orgánica */
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
  border: 3px solid white;
}

.profile-view__animal-card:hover .profile-view__animal-card__avatar {
  transform: rotate(5deg) scale(1.1);
  border-radius: 50%;
}

.profile-view__animal-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-view__animal-card__initial {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  font-family: var(--font-family-serif);
}

.profile-view__animal-card__info {
  width: 100%;
}

.profile-view__animal-card__name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin: 0 0 0.375rem 0;
}

.profile-view__animal-card__species,
.profile-view__animal-card__location {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}
</style>
