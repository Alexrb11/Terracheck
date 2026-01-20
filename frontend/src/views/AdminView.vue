<template>
  <div class="min-h-screen pb-20 md:pb-0">
    <Navigation />

    <main class="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <!-- Header -->
      <div class="mb-6 md:mb-8">
        <div class="flex items-center gap-3 mb-2">
          <ShieldIcon :size="32" class="text-purple-600" />
          <h1 class="text-2xl md:text-3xl font-bold text-slate-800">
            Panel de Administración
          </h1>
        </div>
        <p class="text-slate-600 text-lg">
          Gestiona usuarios, roles y visualiza estadísticas del sistema
        </p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6">
        <button
          @click="activeTab = 'stats'"
          class="px-4 py-2 rounded-xl font-medium transition-colors"
          :class="activeTab === 'stats' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-stone-100'"
        >
          Estadísticas
        </button>
        <button
          @click="activeTab = 'users'"
          class="px-4 py-2 rounded-xl font-medium transition-colors"
          :class="activeTab === 'users' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-stone-100'"
        >
          Usuarios
        </button>
        <button
          @click="activeTab = 'roles'"
          class="px-4 py-2 rounded-xl font-medium transition-colors"
          :class="activeTab === 'roles' ? 'bg-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-stone-100'"
        >
          Roles y Permisos
        </button>
      </div>

      <!-- Stats Tab -->
      <div v-if="activeTab === 'stats'">
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UsersIcon :size="20" class="text-blue-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-800">{{ stats?.users?.total ?? '-' }}</p>
                <p class="text-xs text-slate-500">Usuarios</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <BoxIcon :size="20" class="text-emerald-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-800">{{ stats?.terrariums ?? '-' }}</p>
                <p class="text-xs text-slate-500">Terrarios</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <PawPrintIcon :size="20" class="text-amber-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-800">{{ stats?.animals ?? '-' }}</p>
                <p class="text-xs text-slate-500">Animales</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <KeyIcon :size="20" class="text-purple-600" />
              </div>
              <div>
                <p class="text-2xl font-bold text-slate-800">{{ stats?.roles ?? '-' }}</p>
                <p class="text-xs text-slate-500">Roles</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-white rounded-3xl shadow-sm p-6">
            <h3 class="text-lg font-bold text-slate-800 mb-4">Usuarios Activos</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-slate-600">Total registrados</span>
                <span class="font-semibold">{{ stats?.users?.total ?? 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Activos</span>
                <span class="font-semibold text-green-600">{{ stats?.users?.active ?? 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Administradores</span>
                <span class="font-semibold text-purple-600">{{ stats?.users?.admins ?? 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Nuevos (últimos 30 días)</span>
                <span class="font-semibold text-blue-600">{{ stats?.users?.newLast30Days ?? 0 }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-3xl shadow-sm p-6">
            <h3 class="text-lg font-bold text-slate-800 mb-4">Contenido</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-slate-600">Terrarios</span>
                <span class="font-semibold">{{ stats?.terrariums ?? 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Animales</span>
                <span class="font-semibold">{{ stats?.animals ?? 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Especies en catálogo</span>
                <span class="font-semibold">{{ stats?.species ?? 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div class="p-5 border-b border-stone-200">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <h2 class="text-xl font-bold text-slate-800">Usuarios</h2>
            <!-- Search -->
            <div class="relative">
              <SearchIcon :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar usuarios..."
                class="pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:border-purple-500 focus:outline-none"
                @input="debouncedSearch"
              />
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <LoaderIcon :size="32" class="text-purple-600 animate-spin" />
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-stone-50 text-left">
              <tr>
                <th class="px-5 py-3 text-xs font-semibold text-slate-600 uppercase">Usuario</th>
                <th class="px-5 py-3 text-xs font-semibold text-slate-600 uppercase">Rol</th>
                <th class="px-5 py-3 text-xs font-semibold text-slate-600 uppercase">Estado</th>
                <th class="px-5 py-3 text-xs font-semibold text-slate-600 uppercase">Terrarios</th>
                <th class="px-5 py-3 text-xs font-semibold text-slate-600 uppercase">Registro</th>
                <th class="px-5 py-3 text-xs font-semibold text-slate-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              <tr v-for="user in users" :key="user._id" class="hover:bg-stone-50">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span class="text-purple-700 font-semibold">{{ user.name.charAt(0) }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-slate-800">{{ user.name }}</p>
                      <p class="text-sm text-slate-500">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <select
                    :value="user.role?._id"
                    @change="handleRoleChange(user._id, ($event.target as HTMLSelectElement).value)"
                    :disabled="user._id === authStore.user?.id"
                    class="px-3 py-1 rounded-lg text-sm font-medium border-0 focus:ring-2 focus:ring-purple-500"
                    :class="getRoleColorClass(user.role?.slug)"
                  >
                    <option v-for="role in availableRoles" :key="role._id" :value="role._id">
                      {{ role.name }}
                    </option>
                  </select>
                </td>
                <td class="px-5 py-4">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    ]"
                  >
                    {{ user.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-5 py-4 text-slate-600">
                  {{ user.stats?.terrariums ?? 0 }}
                </td>
                <td class="px-5 py-4 text-sm text-slate-500">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2">
                    <button
                      @click="toggleUserStatus(user._id, user.isActive)"
                      :disabled="user._id === authStore.user?.id"
                      class="p-2 rounded-lg transition-colors disabled:opacity-50"
                      :class="user.isActive ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-green-50 text-green-600'"
                      :title="user.isActive ? 'Desactivar' : 'Activar'"
                    >
                      <UserXIcon v-if="user.isActive" :size="18" />
                      <UserCheckIcon v-else :size="18" />
                    </button>
                    <button
                      @click="deleteUserConfirm(user)"
                      :disabled="user._id === authStore.user?.id"
                      class="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      <TrashIcon :size="18" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="p-5 border-t border-stone-200 flex items-center justify-between">
          <p class="text-sm text-slate-500">
            Mostrando {{ (pagination.page - 1) * pagination.limit + 1 }} - 
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} de {{ pagination.total }}
          </p>
          <div class="flex items-center gap-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-50 transition-colors"
            >
              Anterior
            </button>
            <span class="px-3 py-1 text-sm">{{ pagination.page }} / {{ pagination.pages }}</span>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.pages"
              class="px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-50 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <!-- Roles Tab -->
      <div v-if="activeTab === 'roles'" class="space-y-6">
        <!-- Roles List -->
        <div class="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div class="p-5 border-b border-stone-200 flex items-center justify-between">
            <h2 class="text-xl font-bold text-slate-800">Roles del Sistema</h2>
            <button
              @click="openCreateRoleModal"
              class="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon :size="18" />
              Nuevo Rol
            </button>
          </div>

          <div v-if="rolesStore.loading" class="flex items-center justify-center py-12">
            <LoaderIcon :size="32" class="text-purple-600 animate-spin" />
          </div>

          <div v-else class="divide-y divide-stone-100">
            <div
              v-for="role in rolesStore.roles"
              :key="role._id"
              class="p-5 hover:bg-stone-50 transition-colors"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-bold text-slate-800">{{ role.name }}</h3>
                    <span
                      v-if="role.isSystem"
                      class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      Sistema
                    </span>
                    <span class="px-2 py-0.5 bg-stone-100 text-slate-600 text-xs rounded-full">
                      {{ role.userCount ?? 0 }} usuarios
                    </span>
                  </div>
                  <p class="text-sm text-slate-500 mb-3">{{ role.description || 'Sin descripción' }}</p>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="permission in role.permissions"
                      :key="permission._id"
                      class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full"
                    >
                      {{ permission.name }}
                    </span>
                    <span
                      v-if="!role.permissions?.length"
                      class="text-xs text-slate-400 italic"
                    >
                      Sin permisos especiales
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="openEditRoleModal(role)"
                    class="p-2 rounded-lg hover:bg-stone-100 text-slate-600 transition-colors"
                    title="Editar"
                  >
                    <EditIcon :size="18" />
                  </button>
                  <button
                    v-if="!role.isSystem"
                    @click="handleDeleteRole(role)"
                    class="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <TrashIcon :size="18" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Permissions Reference -->
        <div class="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div class="p-5 border-b border-stone-200">
            <h2 class="text-xl font-bold text-slate-800">Permisos Disponibles</h2>
            <p class="text-sm text-slate-500 mt-1">Referencia de todos los permisos que pueden asignarse a roles</p>
          </div>

          <div class="p-5">
            <div v-for="(perms, category) in rolesStore.groupedPermissions" :key="category" class="mb-6 last:mb-0">
              <h4 class="text-sm font-semibold text-slate-600 uppercase mb-2">{{ getCategoryLabel(category) }}</h4>
              <div class="grid md:grid-cols-2 gap-2">
                <div
                  v-for="permission in perms"
                  :key="permission._id"
                  class="p-3 bg-stone-50 rounded-xl"
                >
                  <p class="font-medium text-slate-800 text-sm">{{ permission.name }}</p>
                  <p class="text-xs text-slate-500">{{ permission.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Role Modal -->
    <Teleport to="body">
      <div
        v-if="showRoleModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeRoleModal"
      >
        <div class="absolute inset-0 bg-black/50"></div>
        <div class="relative bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-stone-200">
            <h2 class="text-xl font-bold text-slate-800">
              {{ editingRole ? 'Editar Rol' : 'Nuevo Rol' }}
            </h2>
          </div>

          <form @submit.prevent="handleSaveRole" class="p-6 space-y-5">
            <!-- Name -->
            <div>
              <label for="role-name" class="block text-sm font-medium text-slate-700 mb-2">
                Nombre del Rol
              </label>
              <input
                id="role-name"
                v-model="roleForm.name"
                type="text"
                required
                :disabled="editingRole?.isSystem"
                class="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-purple-600 focus:outline-none disabled:bg-stone-100"
                placeholder="Ej: Moderador"
              />
            </div>

            <!-- Description -->
            <div>
              <label for="role-description" class="block text-sm font-medium text-slate-700 mb-2">
                Descripción
              </label>
              <textarea
                id="role-description"
                v-model="roleForm.description"
                rows="2"
                class="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-purple-600 focus:outline-none resize-none"
                placeholder="Describe el propósito de este rol..."
              ></textarea>
            </div>

            <!-- Permissions -->
            <div>
              <p class="block text-sm font-medium text-slate-700 mb-2">
                Permisos
              </p>
              <div class="max-h-60 overflow-y-auto border border-stone-200 rounded-xl p-3 space-y-2">
                <label
                  v-for="permission in rolesStore.permissions"
                  :key="permission._id"
                  class="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :value="permission._id"
                    v-model="roleForm.permissions"
                    class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <p class="text-sm font-medium text-slate-800">{{ permission.name }}</p>
                    <p class="text-xs text-slate-500">{{ permission.description }}</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeRoleModal"
                class="flex-1 py-3 px-4 border-2 border-stone-200 text-slate-600 font-medium rounded-xl hover:bg-stone-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="rolesStore.loading || !roleForm.name"
                class="flex-1 py-3 px-4 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {{ editingRole ? 'Guardar Cambios' : 'Crear Rol' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRolesStore, type Role } from '@/stores/roles'
import Navigation from '@/components/Navigation.vue'
import {
  ShieldIcon,
  UsersIcon,
  BoxIcon,
  PawPrintIcon,
  KeyIcon,
  SearchIcon,
  LoaderIcon,
  TrashIcon,
  UserXIcon,
  UserCheckIcon,
  PlusIcon,
  EditIcon
} from 'lucide-vue-next'

interface UserStats {
  terrariums: number
  animals: number
}

interface UserRole {
  _id: string
  name: string
  slug: string
}

interface AdminUser {
  _id: string
  name: string
  email: string
  role: UserRole | null
  isActive: boolean
  createdAt: string
  stats?: UserStats
}

interface SystemStats {
  users: {
    total: number
    active: number
    admins: number
    newLast30Days: number
  }
  terrariums: number
  animals: number
  species: number
  roles: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const authStore = useAuthStore()
const rolesStore = useRolesStore()

const activeTab = ref<'stats' | 'users' | 'roles'>('stats')
const loading = ref(true)
const users = ref<AdminUser[]>([])
const availableRoles = ref<UserRole[]>([])
const stats = ref<SystemStats | null>(null)
const searchQuery = ref('')
const pagination = ref<Pagination>({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

// Role Modal
const showRoleModal = ref(false)
const editingRole = ref<Role | null>(null)
const roleForm = ref({
  name: '',
  description: '',
  permissions: [] as string[]
})

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

const fetchStats = async () => {
  try {
    const response = await fetch('/api/admin/stats', {
      headers: getAuthHeaders()
    })
    const data = await response.json()
    if (data.success) {
      stats.value = data.data
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const fetchUsers = async (page = 1, search = '') => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
      ...(search ? { search } : {})
    })
    
    const response = await fetch(`/api/admin/users?${params}`, {
      headers: getAuthHeaders()
    })
    const data = await response.json()
    
    if (data.success) {
      users.value = data.data
      pagination.value = data.pagination
    }
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

const fetchAvailableRoles = async () => {
  try {
    const response = await fetch('/api/admin/roles', {
      headers: getAuthHeaders()
    })
    const data = await response.json()
    if (data.success) {
      availableRoles.value = data.data.map((r: Role) => ({
        _id: r._id,
        name: r.name,
        slug: r.slug
      }))
    }
  } catch (error) {
    console.error('Error fetching roles:', error)
  }
}

const handleRoleChange = async (userId: string, newRoleId: string) => {
  try {
    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role: newRoleId })
    })
    
    const data = await response.json()
    
    if (data.success) {
      // Actualizar usuario en la lista
      const user = users.value.find(u => u._id === userId)
      if (user && data.data.role) {
        user.role = data.data.role
      }
      fetchStats()
    } else {
      alert(data.message || 'Error al cambiar rol')
    }
  } catch (error) {
    console.error('Error changing role:', error)
  }
}

const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
  try {
    const response = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isActive: !currentStatus })
    })
    
    const data = await response.json()
    
    if (data.success) {
      const user = users.value.find(u => u._id === userId)
      if (user) {
        user.isActive = !currentStatus
      }
      fetchStats()
    } else {
      alert(data.message || 'Error al cambiar estado')
    }
  } catch (error) {
    console.error('Error toggling status:', error)
  }
}

const deleteUserConfirm = async (user: AdminUser) => {
  const cascade = confirm(
    `¿Eliminar a ${user.name} y TODOS sus datos (terrarios, animales)?
    
Presiona OK para eliminar todo, Cancelar para abortar.`
  )
  
  if (!cascade) return
  
  try {
    const response = await fetch(`/api/admin/users/${user._id}?cascade=true`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    const data = await response.json()
    
    if (data.success) {
      users.value = users.value.filter(u => u._id !== user._id)
      fetchStats()
    } else {
      alert(data.message || 'Error al eliminar usuario')
    }
  } catch (error) {
    console.error('Error deleting user:', error)
  }
}

const changePage = (page: number) => {
  fetchUsers(page, searchQuery.value)
}

let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchUsers(1, searchQuery.value)
  }, 300)
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const getRoleColorClass = (slug?: string): string => {
  if (slug === 'super_admin') return 'bg-purple-100 text-purple-700'
  if (slug === 'moderator') return 'bg-blue-100 text-blue-700'
  return 'bg-stone-100 text-slate-700'
}

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    users: 'Usuarios',
    roles: 'Roles',
    terrariums: 'Terrarios',
    animals: 'Animales',
    species: 'Especies',
    system: 'Sistema',
    general: 'General'
  }
  return labels[category] || category
}

// Role Modal Functions
const openCreateRoleModal = () => {
  editingRole.value = null
  roleForm.value = {
    name: '',
    description: '',
    permissions: []
  }
  showRoleModal.value = true
}

const openEditRoleModal = (role: Role) => {
  editingRole.value = role
  roleForm.value = {
    name: role.name,
    description: role.description,
    permissions: role.permissions.map(p => p._id)
  }
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  editingRole.value = null
}

const handleSaveRole = async () => {
  if (editingRole.value) {
    await rolesStore.updateRole(editingRole.value._id, {
      name: roleForm.value.name,
      description: roleForm.value.description,
      permissions: roleForm.value.permissions
    })
  } else {
    await rolesStore.createRole({
      name: roleForm.value.name,
      description: roleForm.value.description,
      permissions: roleForm.value.permissions
    })
  }
  
  closeRoleModal()
  fetchAvailableRoles()
  fetchStats()
}

const handleDeleteRole = async (role: Role) => {
  if (!confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) return
  
  const success = await rolesStore.deleteRole(role._id)
  if (!success && rolesStore.error) {
    alert(rolesStore.error)
  } else {
    fetchAvailableRoles()
    fetchStats()
  }
}

onMounted(async () => {
  fetchStats()
  fetchUsers()
  fetchAvailableRoles()
  await rolesStore.fetchRoles()
  await rolesStore.fetchPermissions()
})
</script>
