<template>
  <div class="user-profile-view">
    <Navigation />

    <main class="container user-profile-view__main">
      <button @click="$router.back()" class="btn-text mb-md">
        <ArrowLeftIcon :size="20" />
        <span>Volver</span>
      </button>

      <!-- Loading -->
      <div v-if="loading" class="user-profile-view__loading">
        <LoaderIcon :size="48" class="user-profile-view__loader-icon" />
      </div>

      <!-- Perfil privado (403): candado pantalla completa -->
      <div
        v-else-if="profileData && 'privateProfile' in profileData && profileData.privateProfile"
        class="user-profile-view__private"
      >
        <LockIcon :size="64" class="user-profile-view__private-icon" />
        <h2 class="user-profile-view__private-title">Este perfil es privado</h2>
        <p class="user-profile-view__private-text">
          Este usuario ha decidido no mostrar su perfil de forma pública.
        </p>
      </div>

      <!-- No encontrado -->
      <div v-else-if="!profileData" class="user-profile-view__not-found">
        <UserIcon :size="64" class="user-profile-view__not-found-icon" />
        <h2 class="user-profile-view__not-found-title">Usuario no encontrado</h2>
        <p class="user-profile-view__not-found-text">
          No existe un usuario con el nombre <strong>@{{ username }}</strong>
        </p>
        <router-link to="/" class="btn btn-primary">Volver al inicio</router-link>
      </div>

      <template v-else>
        <!-- Tarjeta de Perfil (profileData tiene user, stats, canViewTerrariums, canViewAnimals) -->
        <div class="profile-card">
          <div class="profile-card__header">
            <!-- Avatar -->
            <div
              class="profile-card__avatar"
              :style="{ backgroundColor: avatarColor }"
            >
              <span class="profile-card__initial">
                {{ userInitial }}
              </span>
            </div>

            <!-- Info -->
            <div class="profile-card__info">
              <h1 class="profile-card__name">{{ profileData.user.name }}</h1>
              <p v-if="profileData.user.username" class="profile-card__username">
                @{{ profileData.user.username }}
              </p>
              <div class="profile-card__meta">
                <span
                  class="profile-card__badge"
                  :class="isAdmin ? 'profile-card__badge--admin' : 'profile-card__badge--user'"
                >
                  <ShieldIcon v-if="isAdmin" :size="14" />
                  <UserIcon v-else :size="14" />
                  {{ profileData.user.role?.name || 'Usuario' }}
                </span>
                <span class="profile-card__date">
                  <CalendarIcon :size="14" />
                  Miembro desde {{ memberSince }}
                </span>
              </div>
            </div>

            <!-- Acciones: mi perfil, volver o botones de amistad -->
            <div class="profile-card__actions">
              <template v-if="isOwnProfile">
                <router-link to="/profile" class="btn btn-outline">
                  <UserIcon :size="18" />
                  <span>Ver mi perfil</span>
                </router-link>
              </template>
              <template v-else-if="profileData.friendshipStatus === 'none'">
                <button
                  type="button"
                  class="btn btn-primary"
                  :disabled="friendActionLoading"
                  @click="handleAddFriend"
                >
                  <UserPlusIcon :size="18" />
                  <span>{{ friendActionLoading ? '…' : 'Añadir Amigo' }}</span>
                </button>
              </template>
              <template v-else-if="profileData.friendshipStatus === 'pending_sent'">
                <span class="profile-card__btn-muted">
                  <UserPlusIcon :size="18" />
                  <span>Solicitud Enviada</span>
                </span>
              </template>
              <template v-else-if="profileData.friendshipStatus === 'pending_received'">
                <button
                  type="button"
                  class="btn btn-primary"
                  :disabled="friendActionLoading"
                  @click="handleAcceptRequest"
                >
                  <UserCheckIcon :size="18" />
                  <span>{{ friendActionLoading ? '…' : 'Aceptar Solicitud' }}</span>
                </button>
              </template>
              <template v-else-if="profileData.friendshipStatus === 'friends'">
                <span class="profile-card__btn-friends">
                  <UserCheckIcon :size="18" />
                  <span>Amigos</span>
                </span>
              </template>
            </div>
          </div>
        </div>

        <!-- Grid de Estadísticas y placeholders por privacidad -->
        <div class="stats-grid">
          <!-- Terrarios: visible o placeholder -->
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--terrarium">
              <BoxIcon :size="28" />
            </div>
            <div class="stat-card__content">
              <template v-if="profileData.canViewTerrariums">
                <p class="stat-card__value">{{ profileData.stats.terrariums }}</p>
                <p class="stat-card__label">Terrarios</p>
              </template>
              <template v-else>
                <p class="stat-card__placeholder">
                  <EyeOffIcon :size="20" class="stat-card__placeholder-icon" />
                  El usuario ha ocultado sus terrarios
                </p>
              </template>
            </div>
          </div>

          <!-- Animales: visible o placeholder -->
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--animal">
              <PawPrintIcon :size="28" />
            </div>
            <div class="stat-card__content">
              <template v-if="profileData.canViewAnimals">
                <p class="stat-card__value">{{ profileData.stats.animals }}</p>
                <p class="stat-card__label">Animales</p>
              </template>
              <template v-else>
                <p class="stat-card__placeholder">
                  <EyeOffIcon :size="20" class="stat-card__placeholder-icon" />
                  El usuario ha ocultado sus animales
                </p>
              </template>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFriendsStore } from '@/stores/friends'
import Navigation from '@/components/Navigation.vue'
import {
  LoaderIcon,
  BoxIcon,
  PawPrintIcon,
  UserIcon,
  ShieldIcon,
  CalendarIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  UserCheckIcon,
  LockIcon,
  EyeOffIcon
} from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()
const friendsStore = useFriendsStore()

const username = computed(() => (route.params.username as string) ?? '')
const loading = ref(true)
const friendActionLoading = ref(false)
type ProfileDataFull = {
  user: { id: string; name: string; username?: string | null; role?: { name: string; slug: string } | null; createdAt: string }
  stats: { terrariums: number; animals: number }
  canViewTerrariums: boolean
  canViewAnimals: boolean
  friendshipStatus?: 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'self'
  pendingRequestId?: string
}
const profileData = ref<ProfileDataFull | { privateProfile: true } | null>(null)

const isOwnProfile = computed(() => {
  return authStore.user?.username?.toLowerCase() === username.value?.toLowerCase()
})

const isAdmin = computed(() => {
  const p = profileData.value
  return p && 'user' in p ? (p.user?.role?.slug === 'super_admin' || p.user?.role?.slug === 'admin') : false
})

const avatarColors = [
  '#10b981', '#3b82f6', '#8b5cf6', '#ec4899',
  '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'
]

const avatarColor = computed(() => {
  const p = profileData.value
  const name = p && 'user' in p ? p.user?.name : undefined
  if (!name) return avatarColors[0]
  return avatarColors[name.charCodeAt(0) % avatarColors.length]
})

const userInitial = computed(() => {
  const p = profileData.value
  return p && 'user' in p ? (p.user?.name?.charAt(0).toUpperCase() || '?') : '?'
})

const memberSince = computed(() => {
  const p = profileData.value
  const createdAt = p && 'user' in p ? p.user?.createdAt : undefined
  if (!createdAt) return 'Fecha desconocida'
  return new Date(createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long'
  })
})

async function loadProfile () {
  if (!username.value) {
    profileData.value = null
    loading.value = false
    return
  }
  loading.value = true
  profileData.value = null
  const data = await authStore.fetchUserByUsername(username.value)
  profileData.value = data
  loading.value = false
}

async function handleAddFriend () {
  const p = profileData.value
  if (!p || !('user' in p) || !p.user?.id) return
  friendActionLoading.value = true
  const r = await friendsStore.sendRequest(p.user.id)
  friendActionLoading.value = false
  if (r.ok) await loadProfile()
  else if (r.message) alert(r.message)
}

async function handleAcceptRequest () {
  const p = profileData.value
  const id = p && 'pendingRequestId' in p ? p.pendingRequestId : undefined
  if (!id) return
  friendActionLoading.value = true
  await friendsStore.acceptRequest(id)
  friendActionLoading.value = false
  await loadProfile()
}

watch(() => route.params.username, loadProfile, { immediate: false })
onMounted(loadProfile)
</script>

<style scoped>
.user-profile-view {
  min-height: 100vh;
  background-color: var(--color-background);
}

.user-profile-view__main {
  padding-top: 2rem;
  padding-bottom: 3rem;
}

.btn-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  transition: color var(--transition-fast);
}

.btn-text:hover {
  color: var(--color-primary);
}

.user-profile-view__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 0;
}

.user-profile-view__loader-icon {
  color: var(--color-primary);
  animation: spin 1s linear infinite;
}

.user-profile-view__not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.user-profile-view__not-found-icon {
  color: var(--color-text-muted);
  margin-bottom: 1rem;
  opacity: 0.6;
}

.user-profile-view__not-found-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 0.5rem 0;
}

.user-profile-view__not-found-text {
  font-size: 1rem;
  color: var(--color-text-muted);
  margin: 0 0 1.5rem 0;
}

.user-profile-view__private {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
}

.user-profile-view__private-icon {
  color: var(--color-text-muted);
  opacity: 0.7;
  margin-bottom: 1rem;
}

.user-profile-view__private-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 0.5rem 0;
}

.user-profile-view__private-text {
  font-size: 1rem;
  color: var(--color-text-muted);
  margin: 0;
}

.profile-card__btn-muted {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  font-weight: 600;
  background: var(--color-border-light);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.profile-card__btn-friends {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  font-weight: 600;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.profile-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  margin-bottom: 2rem;
}

.profile-card__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
}

.profile-card__avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.profile-card__initial {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.profile-card__info {
  flex: 1;
}

.profile-card__name {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 0.25rem 0;
}

.profile-card__username {
  font-size: 1rem;
  color: var(--color-text-muted);
  margin: 0 0 1rem 0;
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
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
}

.profile-card__badge--admin {
  background: rgba(147, 51, 234, 0.15);
  color: #9333ea;
}

.profile-card__badge--user {
  background: var(--color-primary-light);
  color: var(--color-primary);
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

.stat-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-card__icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card__icon--terrarium {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.stat-card__icon--animal {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.stat-card__content {
  flex: 1;
}

.stat-card__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.stat-card__label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
}

.stat-card__placeholder {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin: 0;
}

.stat-card__placeholder-icon {
  flex-shrink: 0;
  opacity: 0.8;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
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
</style>
