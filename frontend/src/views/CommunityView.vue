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

      <!-- Feed de Actividades - Estilo Red Social -->
      <div v-else-if="activities.length > 0" class="community-view__feed">
        <article
          v-for="activity in activities"
          :key="activity._id"
          class="activity-card"
        >
          <!-- Header: Avatar, Usuario, Fecha -->
          <div class="activity-card__header">
            <div 
              class="activity-card__avatar"
              @click.stop="handleActivityClick(activity)"
            >
              {{ activity.user?.name?.charAt(0).toUpperCase() || '?' }}
            </div>
            <div class="activity-card__header-info">
              <h3 
                class="activity-card__username"
                @click.stop="handleActivityClick(activity)"
              >
                {{ activity.user?.name || 'Usuario' }}
              </h3>
              <time class="activity-card__time">
                {{ formatTimeAgo(activity.createdAt) }}
              </time>
            </div>
          </div>

          <!-- Contenido: Mensaje -->
          <div class="activity-card__body">
            <p class="activity-card__message">
              {{ getActivityMessage(activity) }}
            </p>

            <!-- Detalles de la especie si es un animal -->
            <div
              v-if="activity.type === 'new_animal' && activity.animal?.species"
              class="activity-card__tag"
            >
              <LeafIcon :size="14" />
              <span>{{ activity.animal.species.commonName }}</span>
            </div>

            <!-- Detalles del bioma si es un terrario -->
            <div
              v-if="activity.type === 'new_terrarium' && activity.terrarium"
              class="activity-card__tag"
            >
              <BoxIcon :size="14" />
              <span>{{ getBiomeName(activity.terrarium.biome) }}</span>
            </div>
          </div>

          <!-- Media: Imagen Full Width -->
          <div v-if="getActivityImage(activity)" class="activity-card__media">
            <img
              :src="getActivityImage(activity)"
              :alt="getActivityTitle(activity)"
              class="activity-card__image"
              @error="handleImageError"
            />
          </div>

          <!-- Footer: Acciones (Like) -->
          <div class="activity-card__actions">
            <button
              @click.stop="toggleLike(activity)"
              :class="[
                'activity-card__action-btn',
                { 'activity-card__action-btn--liked': isLiked(activity) }
              ]"
              aria-label="Me gusta"
            >
              <HeartIcon 
                :size="24" 
                :fill="isLiked(activity) ? 'currentColor' : 'none'" 
                :stroke-width="isLiked(activity) ? 0 : 2"
              />
            </button>
            <span 
              v-if="activity.likes?.length > 0" 
              class="activity-card__likes-count"
            >
              {{ activity.likes.length }} me gusta
            </span>
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
  if (!authStore.user?.id) return false
  const userLiked = activity.likes?.includes(authStore.user.id)
  // Debug: descomentar para ver los likes
  // console.log('Activity:', activity._id, 'Likes:', activity.likes, 'User ID:', authStore.user.id, 'IsLiked:', userLiked)
  return userLiked
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
  padding-bottom: 2rem;
}

/* Header */
.community-view__header {
  max-width: 600px;
  margin: 0 auto 2rem;
  text-align: center;
  padding: 0 1rem;
}

.community-view__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.community-view__subtitle {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
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
  max-width: 600px;
  margin: 0 auto;
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

/* Feed - Columna Central Estilo Red Social */
.community-view__feed {
  max-width: 600px;
  margin: 0 auto 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Activity Card - Estilo Instagram/Facebook */
.activity-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.activity-card:hover {
  box-shadow: var(--shadow-md);
}

/* Header: Avatar + Usuario + Fecha */
.activity-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
}

.activity-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.activity-card__avatar:hover {
  transform: scale(1.05);
}

.activity-card__header-info {
  flex: 1;
  min-width: 0;
}

.activity-card__username {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin: 0 0 0.125rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: color 0.2s ease;
}

.activity-card__username:hover {
  color: var(--color-primary);
}

.activity-card__time {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  display: block;
}

/* Body: Contenido de texto */
.activity-card__body {
  padding: 0 1rem 1rem;
}

.activity-card__message {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--color-text-main);
  margin: 0 0 0.75rem 0;
}

/* Tag de especie/bioma */
.activity-card__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  background: var(--color-accent);
  color: var(--color-primary);
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Media: Imagen Full Width */
.activity-card__media {
  width: 100%;
  max-height: 600px;
  overflow: hidden;
  background: var(--color-background);
}

.activity-card__image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  aspect-ratio: 4 / 3;
}

/* Actions: Footer con botones */
.activity-card__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--color-border-light);
}

.activity-card__action-btn {
  background: transparent;
  border: none;
  color: var(--color-text-main);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, color 0.2s ease;
}

.activity-card__action-btn:hover {
  transform: scale(1.1);
}

.activity-card__action-btn--liked {
  color: var(--color-primary);
  animation: likePopIn 0.3s ease-in-out;
}

@keyframes likePopIn {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.activity-card__likes-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-main);
}

/* Cargar más */
.community-view__load-more {
  display: flex;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto 2rem;
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
  max-width: 600px;
  margin: 0 auto;
}

.community-view__empty-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.community-view__empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin: 0;
}

.community-view__empty-text {
  color: var(--color-text-muted);
  max-width: 400px;
}

/* Spinner en botón */
.spin {
  animation: spin 1s linear infinite;
}
</style>
