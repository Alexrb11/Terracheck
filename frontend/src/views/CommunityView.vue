<template>
  <div class="community-view">
    <main class="container community-view__main">
      <header class="community-view__header">
        <h1 class="community-view__title">
          <UsersIcon :size="28" />
          Comunidad
        </h1>
        <p class="community-view__subtitle">
          Descubre lo que está sucediendo en la comunidad de Terracheck
        </p>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="community-view__loading">
        <LoaderIcon :size="48" class="community-view__loader-icon" />
        <p>Cargando actividades...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="alert alert-danger">
        <AlertCircleIcon :size="48" />
        <p>{{ error }}</p>
        <button @click="loadActivities" class="btn btn-danger">
          Reintentar
        </button>
      </div>

      <!-- Feed de Actividades - Diseño Anti-Grid -->
      <div v-else-if="activities.length > 0" class="community-view__feed">
        <article
          v-for="(activity, index) in activities"
          :key="activity._id"
          :class="[
            'activity-card',
            `activity-card--offset-${(index % 4) + 1}`,
            'fade-in-up'
          ]"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="handleActivityClick(activity)"
        >
          <!-- Imagen del animal/terrario si existe -->
          <div v-if="getActivityImage(activity)" class="activity-card__image-wrapper">
            <img
              :src="getActivityImage(activity)"
              :alt="getActivityTitle(activity)"
              class="activity-card__image"
              @error="handleImageError"
            />
            <div class="activity-card__image-overlay"></div>
          </div>

          <!-- Contenido -->
          <div class="activity-card__content">
            <!-- Avatar y usuario -->
            <div class="activity-card__user">
              <div class="activity-card__avatar">
                {{ activity.user?.name?.charAt(0).toUpperCase() || '?' }}
              </div>
              <div class="activity-card__user-info">
                <h3 class="activity-card__username">
                  {{ activity.user?.name || 'Usuario' }}
                </h3>
                <time class="activity-card__time">
                  {{ formatTimeAgo(activity.createdAt) }}
                </time>
              </div>
            </div>

            <!-- Mensaje de actividad -->
            <p class="activity-card__message">
              {{ getActivityMessage(activity) }}
            </p>

            <!-- Detalles de la especie si es un animal -->
            <div
              v-if="activity.type === 'new_animal' && activity.animal?.species"
              class="activity-card__species"
            >
              <LeafIcon :size="16" />
              <span class="activity-card__species-name">
                {{ activity.animal.species.commonName }}
              </span>
            </div>

            <!-- Detalles del bioma si es un terrario -->
            <div
              v-if="activity.type === 'new_terrarium' && activity.terrarium"
              class="activity-card__biome"
            >
              <BoxIcon :size="16" />
              <span class="activity-card__biome-name">
                {{ getBiomeName(activity.terrarium.biome) }}
              </span>
            </div>

            <!-- Footer con likes -->
            <div class="activity-card__footer">
              <button
                @click.stop="toggleLike(activity)"
                :class="[
                  'activity-card__like-btn',
                  { 'activity-card__like-btn--active': isLiked(activity) }
                ]"
              >
                <HeartIcon :size="20" :fill="isLiked(activity) ? 'currentColor' : 'none'" />
                <span v-if="activity.likes?.length > 0">
                  {{ activity.likes.length }}
                </span>
              </button>
            </div>
          </div>
        </article>

        <!-- Botón de cargar más -->
        <div v-if="hasMore" class="community-view__load-more">
          <button
            @click="loadMore"
            :disabled="loadingMore"
            class="btn btn-secondary"
          >
            <LoaderIcon v-if="loadingMore" :size="20" class="spin" />
            <span v-else>Cargar más</span>
          </button>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="community-view__empty">
        <div class="community-view__empty-icon-wrapper">
          <UsersIcon :size="48" />
        </div>
        <h3 class="community-view__empty-title">No hay actividades aún</h3>
        <p class="community-view__empty-text">
          Sé el primero en compartir algo con la comunidad
        </p>
        <button @click="$router.push('/add')" class="btn btn-primary">
          Crear Terrario
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  UsersIcon,
  LoaderIcon,
  AlertCircleIcon,
  HeartIcon,
  LeafIcon,
  BoxIcon
} from 'lucide-vue-next'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Helper para headers con autenticación
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

interface Activity {
  _id: string
  user: {
    _id: string
    name: string
    username: string
  }
  type: 'new_animal' | 'new_terrarium' | 'update_photo'
  animal?: {
    _id: string
    name: string
    imageUrl: string
    species?: {
      commonName: string
      scientificName: string
    }
  }
  terrarium?: {
    _id: string
    name: string
    imageUrl: string
    biome: string
  }
  content: string
  likes: string[]
  createdAt: string
}

const router = useRouter()
const authStore = useAuthStore()

const activities = ref<Activity[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const currentPage = ref(1)
const hasMore = ref(true)

// Cargar actividades
const loadActivities = async (page = 1) => {
  try {
    if (page === 1) {
      loading.value = true
    } else {
      loadingMore.value = true
    }
    error.value = ''

    const url = new URL(`${API_URL}/api/activities`)
    url.searchParams.append('page', page.toString())
    url.searchParams.append('limit', '20')

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders()
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al cargar actividades')
    }

    if (page === 1) {
      activities.value = data.data
    } else {
      activities.value.push(...data.data)
    }

    const { pagination } = data
    hasMore.value = pagination.page < pagination.pages
    currentPage.value = page
  } catch (err: any) {
    error.value = err.message || 'Error al cargar actividades'
    console.error('Error al cargar actividades:', err)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// Cargar más actividades
const loadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    loadActivities(currentPage.value + 1)
  }
}

// Dar/quitar like
const toggleLike = async (activity: Activity) => {
  try {
    const response = await fetch(`${API_URL}/api/activities/${activity._id}/like`, {
      method: 'POST',
      headers: getAuthHeaders()
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error al dar like')
    }

    // Actualizar likes en el array local
    const index = activities.value.findIndex(a => a._id === activity._id)
    if (index !== -1) {
      activities.value[index].likes = data.data.likes
    }
  } catch (err: any) {
    console.error('Error al dar like:', err)
  }
}

// Verificar si el usuario dio like
const isLiked = (activity: Activity) => {
  return activity.likes?.includes(authStore.user?._id || '')
}

// Obtener imagen de la actividad
const getActivityImage = (activity: Activity) => {
  if (activity.animal?.imageUrl) {
    return activity.animal.imageUrl.startsWith('http')
      ? activity.animal.imageUrl
      : `${API_URL}${activity.animal.imageUrl}`
  }
  if (activity.terrarium?.imageUrl) {
    return activity.terrarium.imageUrl.startsWith('http')
      ? activity.terrarium.imageUrl
      : `${API_URL}${activity.terrarium.imageUrl}`
  }
  return null
}

// Obtener título de la actividad
const getActivityTitle = (activity: Activity) => {
  if (activity.animal) return activity.animal.name
  if (activity.terrarium) return activity.terrarium.name
  return 'Actividad'
}

// Obtener mensaje de la actividad
const getActivityMessage = (activity: Activity) => {
  switch (activity.type) {
    case 'new_animal':
      return `¡${activity.user.name} ha dado la bienvenida a un nuevo habitante: ${activity.animal?.name}!`
    case 'new_terrarium':
      return `${activity.user.name} ha creado un nuevo terrario: ${activity.terrarium?.name}`
    case 'update_photo':
      return `${activity.user.name} ha actualizado la foto de ${activity.animal?.name}`
    default:
      return activity.content || 'Nueva actividad'
  }
}

// Obtener nombre del bioma
const getBiomeName = (biome: string) => {
  const biomes: Record<string, string> = {
    tropical: 'Tropical',
    desert: 'Desértico',
    temperate: 'Templado'
  }
  return biomes[biome] || biome
}

// Formatear tiempo
const formatTimeAgo = (date: string) => {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins}m`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  
  return then.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

// Manejar error de imagen
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

// Manejar click en actividad
const handleActivityClick = (activity: Activity) => {
  // Ir al perfil del usuario
  router.push(`/user/${activity.user.username}`)
}

onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
.community-view {
  min-height: 100vh;
  padding-bottom: 80px;
}

@media (min-width: 768px) {
  .community-view {
    padding-bottom: 0;
  }
}

.community-view__main {
  padding-top: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.community-view__header {
  margin-bottom: 2rem;
  text-align: center;
}

.community-view__title {
  font-family: var(--font-family-serif);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  color: var(--color-text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.community-view__subtitle {
  color: var(--color-text-muted);
  font-size: 1rem;
}

/* Loading */
.community-view__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 1rem;
  color: var(--color-text-muted);
}

.community-view__loader-icon {
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

/* Feed - Diseño Anti-Grid */
.community-view__feed {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .community-view__feed {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 2.5rem;
  }
}

/* Activity Card - Estética de Cuaderno */
.activity-card {
  background: var(--color-bg-paper);
  border-radius: var(--radius-blob);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  transform: rotate(-1deg);
}

/* Offsets para Anti-Grid (desfases ligeros) */
.activity-card--offset-1 {
  transform: rotate(-1.5deg) translateY(-8px);
}

.activity-card--offset-2 {
  transform: rotate(1deg) translateY(4px);
}

.activity-card--offset-3 {
  transform: rotate(-0.5deg) translateY(-4px);
}

.activity-card--offset-4 {
  transform: rotate(1.5deg) translateY(8px);
}

/* Micro-interacción: enderezar al hover */
.activity-card:hover {
  transform: rotate(0deg) translateY(-8px);
  box-shadow: var(--shadow-float);
  border-radius: var(--radius-xl);
}

/* Imagen con clip-path orgánico */
.activity-card__image-wrapper {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
}

.activity-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  clip-path: polygon(
    0 0,
    100% 0,
    100% 85%,
    95% 90%,
    90% 92%,
    80% 95%,
    70% 96%,
    60% 97%,
    50% 98%,
    40% 97%,
    30% 95%,
    20% 92%,
    10% 88%,
    5% 85%,
    0 80%
  );
  transition: transform var(--transition-base);
}

.activity-card:hover .activity-card__image {
  transform: scale(1.05);
}

.activity-card__image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    to top,
    var(--color-bg-paper),
    transparent
  );
  pointer-events: none;
}

/* Contenido */
.activity-card__content {
  padding: 1.5rem;
}

/* Usuario */
.activity-card__user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.activity-card__avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-blob);
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-serif);
  font-size: 1.25rem;
  font-weight: bold;
  flex-shrink: 0;
}

.activity-card__user-info {
  flex: 1;
  min-width: 0;
}

.activity-card__username {
  font-family: var(--font-family-serif);
  font-size: 1.125rem;
  color: var(--color-text-main);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-card__time {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

/* Mensaje */
.activity-card__message {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text-main);
  margin-bottom: 1rem;
}

/* Detalles de especie/bioma */
.activity-card__species,
.activity-card__biome {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-accent);
  color: var(--color-primary);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

/* Footer con likes */
.activity-card__footer {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border-light);
}

/* Botón de like orgánico con palpitación */
.activity-card__like-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 2px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-family);
  font-size: 0.875rem;
}

.activity-card__like-btn:hover {
  background: var(--color-accent);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: scale(1.05);
}

.activity-card__like-btn--active {
  background: var(--color-secondary);
  border-color: var(--color-secondary);
  color: white;
  animation: heartbeat 0.6s ease-in-out;
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  10%, 30% {
    transform: scale(1.1);
  }
  20%, 40%, 60%, 80% {
    transform: scale(0.9);
  }
  50%, 70% {
    transform: scale(1.05);
  }
}

/* Cargar más */
.community-view__load-more {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

/* Empty state */
.community-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 1rem;
  text-align: center;
}

.community-view__empty-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-blob);
  background: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.community-view__empty-title {
  font-family: var(--font-family-serif);
  font-size: 1.5rem;
  color: var(--color-text-main);
  margin: 0;
}

.community-view__empty-text {
  color: var(--color-text-muted);
  max-width: 400px;
}

/* Animación de entrada - Scrollytelling */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px) rotate(-1deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(-1deg);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

/* Spinner en botón */
.spin {
  animation: spin 1s linear infinite;
}
</style>
