<template>
  <div class="friends-view">
    <main class="container friends-view__main">
      <header class="friends-view__header">
        <h1 class="friends-view__title">
          <UsersIcon :size="28" />
          Amigos
        </h1>
      </header>

      <!-- Tabs -->
      <div class="friends-view__tabs">
        <button
          type="button"
          class="friends-view__tab"
          :class="{ 'friends-view__tab--active': activeTab === 'friends' }"
          @click="activeTab = 'friends'"
        >
          <UserCheckIcon :size="20" />
          Mis Amigos
          <span v-if="friendsStore.friends.length" class="friends-view__badge">
            {{ friendsStore.friends.length }}
          </span>
        </button>
        <button
          type="button"
          class="friends-view__tab"
          :class="{ 'friends-view__tab--active': activeTab === 'requests' }"
          @click="activeTab = 'requests'"
        >
          <UserPlusIcon :size="20" />
          Solicitudes
          <span v-if="friendsStore.incomingRequests.length" class="friends-view__badge friends-view__badge--accent">
            {{ friendsStore.incomingRequests.length }}
          </span>
        </button>
        <button
          type="button"
          class="friends-view__tab"
          :class="{ 'friends-view__tab--active': activeTab === 'search' }"
          @click="activeTab = 'search'"
        >
          <Search :size="20" />
          Buscar
        </button>
      </div>

      <!-- Loading -->
      <div v-if="friendsStore.loading && activeTab !== 'search'" class="friends-view__loading">
        <LoaderIcon :size="40" class="friends-view__loader" />
      </div>

      <!-- Tab: Mis Amigos -->
      <section v-else-if="activeTab === 'friends'" class="friends-view__panel">
        <div v-if="friendsStore.friends.length === 0" class="friends-view__empty">
          <UsersIcon :size="48" class="friends-view__empty-icon" />
          <p class="friends-view__empty-text">Aún no tienes amigos añadidos</p>
          <p class="friends-view__empty-hint">Usa la pestaña «Buscar» para encontrar usuarios</p>
        </div>
        <ul v-else class="friends-view__list">
          <li
            v-for="f in friendsStore.friends"
            :key="f.userId"
            class="friends-view__card"
          >
            <div class="friends-view__card-info">
              <div
                class="friends-view__avatar"
                :style="{ backgroundColor: avatarColor(f.name) }"
              >
                {{ (f.name || '?').charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="friends-view__card-name">{{ f.name }}</p>
                <p v-if="f.username" class="friends-view__card-username">@{{ f.username }}</p>
              </div>
            </div>
            <div class="friends-view__card-actions">
              <router-link
                :to="{ name: 'user-profile', params: { username: f.username || f.userId } }"
                class="btn btn-outline friends-view__btn-sm"
              >
                Ver perfil
              </router-link>
              <button
                type="button"
                class="btn friends-view__btn-remove"
                :disabled="removingId === f.userId"
                @click="handleRemoveFriend(f.userId)"
              >
                {{ removingId === f.userId ? '…' : 'Eliminar' }}
              </button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Tab: Solicitudes -->
      <section v-else-if="activeTab === 'requests'" class="friends-view__panel">
        <div v-if="friendsStore.incomingRequests.length === 0 && friendsStore.outgoingRequests.length === 0" class="friends-view__empty">
          <UserPlusIcon :size="48" class="friends-view__empty-icon" />
          <p class="friends-view__empty-text">No hay solicitudes pendientes</p>
        </div>
        <template v-else>
          <div v-if="friendsStore.incomingRequests.length > 0" class="friends-view__subsection">
            <h3 class="friends-view__subsection-title">Recibidas</h3>
            <ul class="friends-view__list">
              <li
                v-for="r in friendsStore.incomingRequests"
                :key="r.requestId"
                class="friends-view__card"
              >
                <div class="friends-view__card-info">
                  <div
                    class="friends-view__avatar"
                    :style="{ backgroundColor: avatarColor(r.name) }"
                  >
                    {{ (r.name || '?').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="friends-view__card-name">{{ r.name }}</p>
                    <p v-if="r.username" class="friends-view__card-username">@{{ r.username }}</p>
                  </div>
                </div>
                <div class="friends-view__card-actions">
                  <router-link
                    :to="{ name: 'user-profile', params: { username: r.username || r.userId } }"
                    class="btn btn-outline friends-view__btn-sm"
                  >
                    Ver perfil
                  </router-link>
                  <button
                    type="button"
                    class="btn btn-primary friends-view__btn-sm"
                    :disabled="processingId === r.requestId"
                    @click="handleAccept(r.requestId)"
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    class="btn friends-view__btn-remove"
                    :disabled="processingId === r.requestId"
                    @click="handleReject(r.requestId)"
                  >
                    Rechazar
                  </button>
                </div>
              </li>
            </ul>
          </div>
          <div v-if="friendsStore.outgoingRequests.length > 0" class="friends-view__subsection">
            <h3 class="friends-view__subsection-title">Enviadas</h3>
            <ul class="friends-view__list">
              <li
                v-for="r in friendsStore.outgoingRequests"
                :key="r.requestId"
                class="friends-view__card"
              >
                <div class="friends-view__card-info">
                  <div
                    class="friends-view__avatar"
                    :style="{ backgroundColor: avatarColor(r.name) }"
                  >
                    {{ (r.name || '?').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="friends-view__card-name">{{ r.name }}</p>
                    <p v-if="r.username" class="friends-view__card-username">@{{ r.username }}</p>
                  </div>
                </div>
                <div class="friends-view__card-actions">
                  <router-link
                    :to="{ name: 'user-profile', params: { username: r.username || r.userId } }"
                    class="btn btn-outline friends-view__btn-sm"
                  >
                    Ver perfil
                  </router-link>
                  <button
                    type="button"
                    class="btn friends-view__btn-remove"
                    :disabled="processingId === r.requestId"
                    @click="handleReject(r.requestId)"
                  >
                    Cancelar
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </template>
      </section>

      <!-- Tab: Buscar -->
      <section v-else class="friends-view__panel">
        <div class="friends-view__search">
          <input
            v-model="searchQuery"
            type="text"
            class="input-field friends-view__input"
            placeholder="Buscar por nombre de usuario (mín. 2 letras)"
            @input="debouncedSearch"
          />
        </div>
        <div v-if="searchLoading" class="friends-view__loading friends-view__loading--small">
          <LoaderIcon :size="32" class="friends-view__loader" />
        </div>
        <div v-else-if="searchQuery.length >= 2 && searchResults.length === 0" class="friends-view__empty">
          <Search :size="48" class="friends-view__empty-icon" />
          <p class="friends-view__empty-text">No se encontraron usuarios</p>
        </div>
        <ul v-else-if="searchResults.length > 0" class="friends-view__list">
          <li
            v-for="u in searchResults"
            :key="u.id"
            class="friends-view__card"
          >
            <div class="friends-view__card-info">
              <div
                class="friends-view__avatar"
                :style="{ backgroundColor: avatarColor(u.name) }"
              >
                {{ (u.name || '?').charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="friends-view__card-name">{{ u.name }}</p>
                <p v-if="u.username" class="friends-view__card-username">@{{ u.username }}</p>
              </div>
            </div>
            <div class="friends-view__card-actions">
              <router-link
                v-if="u.username"
                :to="{ name: 'user-profile', params: { username: u.username } }"
                class="btn btn-outline friends-view__btn-sm"
              >
                Ver perfil
              </router-link>
              <button
                type="button"
                class="btn btn-primary friends-view__btn-sm"
                :disabled="sendingToId === u.id"
                @click="handleSendRequest(u.id)"
              >
                {{ sendingToId === u.id ? '…' : 'Enviar solicitud' }}
              </button>
            </div>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFriendsStore, type FriendItem } from '@/stores/friends'
import {
  UsersIcon,
  UserCheckIcon,
  UserPlusIcon,
  Search,
  LoaderIcon
} from 'lucide-vue-next'

const friendsStore = useFriendsStore()

const route = useRoute()
const router = useRouter()

const activeTab = computed<'friends' | 'requests' | 'search'>({
  get() {
    const tab = route.query.tab
    if (tab === 'friends' || tab === 'requests' || tab === 'search') {
      return tab
    }
    return 'friends'
  },
  set(newValue) {
    router.push({
      query: {
        ...route.query,
        tab: newValue
      }
    })
  }
})
const searchQuery = ref('')
const searchResults = ref<{ id: string; name: string; username: string | null }[]>([])
const searchLoading = ref(false)
const sendingToId = ref<string | null>(null)
const processingId = ref<string | null>(null)
const removingId = ref<string | null>(null)

const avatarColors = [
  '#10b981', '#3b82f6', '#8b5cf6', '#ec4899',
  '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'
]
function avatarColor (name: string) {
  if (!name) return avatarColors[0]
  return avatarColors[name.charCodeAt(0) % avatarColors.length]
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null
function debouncedSearch () {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  searchLoading.value = true
  searchTimeout = setTimeout(async () => {
    searchResults.value = await friendsStore.searchUsers(searchQuery.value)
    searchLoading.value = false
    searchTimeout = null
  }, 350)
}

async function handleSendRequest (userId: string) {
  sendingToId.value = userId
  const r = await friendsStore.sendRequest(userId)
  sendingToId.value = null
  if (r.ok) {
    searchResults.value = searchResults.value.filter((u) => u.id !== userId)
  } else if (r.message) {
    alert(r.message)
  }
}

async function handleAccept (requestId: string) {
  processingId.value = requestId
  await friendsStore.acceptRequest(requestId)
  processingId.value = null
}

async function handleReject (requestId: string) {
  processingId.value = requestId
  await friendsStore.rejectRequest(requestId)
  processingId.value = null
}

async function handleRemoveFriend (userId: string) {
  removingId.value = userId
  await friendsStore.removeFriend(userId)
  removingId.value = null
}

onMounted(() => {
  friendsStore.fetchStatus()
})
</script>

<style scoped>
.friends-view {
  min-height: 100vh;
  background-color: var(--color-background);
  padding-bottom: 3rem;
}

.friends-view__main {
  padding-top: 2rem;
}

.friends-view__header {
  margin-bottom: 1.5rem;
}

.friends-view__title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.friends-view__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: 0.5rem;
}

.friends-view__tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.friends-view__tab:hover {
  color: var(--color-text-main);
  background: var(--color-surface);
}

.friends-view__tab--active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.friends-view__badge {
  background: var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-full);
}

.friends-view__badge--accent {
  background: var(--color-primary);
  color: white;
}

.friends-view__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.friends-view__loading--small {
  padding: 2rem;
}

.friends-view__loader {
  color: var(--color-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.friends-view__panel {
  min-height: 200px;
}

.friends-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.friends-view__empty-icon {
  color: var(--color-text-muted);
  opacity: 0.6;
  margin-bottom: 1rem;
}

.friends-view__empty-text {
  font-size: 1.1rem;
  color: var(--color-text-main);
  margin: 0 0 0.25rem 0;
}

.friends-view__empty-hint {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin: 0;
}

.friends-view__subsection {
  margin-bottom: 2rem;
}

.friends-view__subsection-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin: 0 0 0.75rem 0;
}

.friends-view__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.friends-view__card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.friends-view__card-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.friends-view__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: white;
  flex-shrink: 0;
}

.friends-view__card-name {
  font-weight: 600;
  color: var(--color-text-main);
  margin: 0 0 0.15rem 0;
}

.friends-view__card-username {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin: 0;
}

.friends-view__card-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.friends-view__btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.friends-view__btn-remove {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.friends-view__btn-remove:hover:not(:disabled) {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.friends-view__search {
  margin-bottom: 1rem;
}

.friends-view__input {
  max-width: 400px;
}
</style>
