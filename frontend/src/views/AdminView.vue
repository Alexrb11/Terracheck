<template>
  <div class="admin-view">
    <Navigation />

    <main class="container admin-view__main">
      <!-- Header -->
      <header class="view-header">
        <div class="view-header__top">
          <ShieldIcon :size="32" class="view-header__icon" />
          <h1 class="view-header__title">
            Panel de Administración
          </h1>
        </div>
        <p class="view-header__subtitle">
          Gestiona usuarios, roles y visualiza estadísticas del sistema
        </p>
      </header>

      <!-- Tabs -->
      <div class="admin-tabs">
        <button
          @click="activeTab = 'stats'"
          class="tab-btn"
          :class="{ active: activeTab === 'stats' }"
        >
          Estadísticas
        </button>
        <button
          @click="activeTab = 'users'"
          class="tab-btn"
          :class="{ active: activeTab === 'users' }"
        >
          Usuarios
        </button>
        <button
          @click="activeTab = 'roles'"
          class="tab-btn"
          :class="{ active: activeTab === 'roles' }"
        >
          Roles y Permisos
        </button>
      </div>

      <!-- Stats Tab -->
      <div v-if="activeTab === 'stats'">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="card stat-card">
            <div class="stat-icon-wrapper stat-icon-wrapper--blue">
              <UsersIcon :size="20" />
            </div>
            <div>
              <p class="stat-value">{{ stats?.users?.total ?? '-' }}</p>
              <p class="stat-label">Usuarios</p>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon-wrapper stat-icon-wrapper--green">
              <BoxIcon :size="20" />
            </div>
            <div>
              <p class="stat-value">{{ stats?.terrariums ?? '-' }}</p>
              <p class="stat-label">Terrarios</p>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon-wrapper stat-icon-wrapper--amber">
              <PawPrintIcon :size="20" />
            </div>
            <div>
              <p class="stat-value">{{ stats?.animals ?? '-' }}</p>
              <p class="stat-label">Animales</p>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon-wrapper stat-icon-wrapper--purple">
              <KeyIcon :size="20" />
            </div>
            <div>
              <p class="stat-value">{{ stats?.roles ?? '-' }}</p>
              <p class="stat-label">Roles</p>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="admin-view__quick-stats">
          <div class="card">
            <h3 class="card__title">Usuarios Activos</h3>
            <div class="card__stats-list">
              <div class="card__stats-item">
                <span>Total registrados</span>
                <span class="card__stats-value">{{ stats?.users?.total ?? 0 }}</span>
              </div>
              <div class="card__stats-item">
                <span>Activos</span>
                <span class="card__stats-value card__stats-value--green">{{ stats?.users?.active ?? 0 }}</span>
              </div>
              <div class="card__stats-item">
                <span>Administradores</span>
                <span class="card__stats-value card__stats-value--purple">{{ stats?.users?.admins ?? 0 }}</span>
              </div>
              <div class="card__stats-item">
                <span>Nuevos (últimos 30 días)</span>
                <span class="card__stats-value card__stats-value--blue">{{ stats?.users?.newLast30Days ?? 0 }}</span>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 class="card__title">Contenido</h3>
            <div class="card__stats-list">
              <div class="card__stats-item">
                <span>Terrarios</span>
                <span class="card__stats-value">{{ stats?.terrariums ?? 0 }}</span>
              </div>
              <div class="card__stats-item">
                <span>Animales</span>
                <span class="card__stats-value">{{ stats?.animals ?? 0 }}</span>
              </div>
              <div class="card__stats-item">
                <span>Especies en catálogo</span>
                <span class="card__stats-value">{{ stats?.species ?? 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="card table-card">
        <div class="table-card__header">
          <h2 class="table-card__title">Usuarios</h2>
          <!-- Search -->
          <div class="table-card__search">
            <SearchIcon :size="18" class="table-card__search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar usuarios..."
              class="input-field table-card__search-input"
              @input="debouncedSearch"
            />
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="admin-view__loading">
          <LoaderIcon :size="32" class="admin-view__loader-icon" />
        </div>

        <!-- Table -->
        <div v-else class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Terrarios</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user._id" class="admin-table__row">
                <td>
                  <div class="admin-table__user">
                    <div class="admin-table__avatar">
                      <span>{{ user.name.charAt(0) }}</span>
                    </div>
                    <div>
                      <p class="admin-table__user-name">{{ user.name }}</p>
                      <p class="admin-table__user-email">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <select
                    :value="user.role?._id"
                    @change="handleRoleChange(user._id, ($event.target as HTMLSelectElement).value)"
                    :disabled="user._id === authStore.user?.id"
                    class="admin-table__role-select"
                    :class="getRoleSelectClass(user.role?.slug)"
                  >
                    <option v-for="role in availableRoles" :key="role._id" :value="role._id">
                      {{ role.name }}
                    </option>
                  </select>
                </td>
                <td>
                  <span
                    class="status-badge"
                    :class="user.isActive ? 'status-badge--active' : 'status-badge--inactive'"
                  >
                    {{ user.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="admin-table__text-muted">
                  {{ user.stats?.terrariums ?? 0 }}
                </td>
                <td class="admin-table__text-muted admin-table__date">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td>
                  <div class="admin-table__actions">
                    <button
                      @click="toggleUserStatus(user._id, user.isActive)"
                      :disabled="user._id === authStore.user?.id"
                      class="admin-table__action-btn"
                      :class="user.isActive ? 'admin-table__action-btn--warning' : 'admin-table__action-btn--success'"
                      :title="user.isActive ? 'Desactivar' : 'Activar'"
                    >
                      <UserXIcon v-if="user.isActive" :size="18" />
                      <UserCheckIcon v-else :size="18" />
                    </button>
                    <button
                      @click="deleteUserConfirm(user)"
                      :disabled="user._id === authStore.user?.id"
                      class="admin-table__action-btn admin-table__action-btn--danger"
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
        <div v-if="pagination.pages > 1" class="table-card__pagination">
          <p class="table-card__pagination-info">
            Mostrando {{ (pagination.page - 1) * pagination.limit + 1 }} - 
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} de {{ pagination.total }}
          </p>
          <div class="table-card__pagination-controls">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="btn btn-secondary btn-sm"
            >
              Anterior
            </button>
            <span class="table-card__pagination-page">{{ pagination.page }} / {{ pagination.pages }}</span>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.pages"
              class="btn btn-secondary btn-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <!-- Roles Tab -->
      <div v-if="activeTab === 'roles'" class="admin-view__roles">
        <!-- Roles List -->
        <div class="card table-card">
          <div class="table-card__header">
            <h2 class="table-card__title">Roles del Sistema</h2>
            <button
              @click="openCreateRoleModal"
              class="btn btn-primary"
            >
              <PlusIcon :size="18" />
              Nuevo Rol
            </button>
          </div>

          <div v-if="rolesStore.loading" class="admin-view__loading">
            <LoaderIcon :size="32" class="admin-view__loader-icon" />
          </div>

          <div v-else class="admin-view__roles-list">
            <div
              v-for="role in rolesStore.roles"
              :key="role._id"
              class="admin-view__role-item"
            >
              <div class="admin-view__role-content">
                <div class="admin-view__role-header">
                  <h3 class="admin-view__role-name">{{ role.name }}</h3>
                  <span
                    v-if="role.isSystem"
                    class="badge badge-primary"
                  >
                    Sistema
                  </span>
                  <span class="badge badge-secondary">
                    {{ role.userCount ?? 0 }} usuarios
                  </span>
                </div>
                <p class="admin-view__role-description">{{ role.description || 'Sin descripción' }}</p>
                <div class="admin-view__role-permissions">
                  <span
                    v-for="permission in role.permissions"
                    :key="permission._id"
                    class="admin-view__permission-tag"
                  >
                    {{ permission.name }}
                  </span>
                  <span
                    v-if="!role.permissions?.length"
                    class="admin-view__permission-empty"
                  >
                    Sin permisos especiales
                  </span>
                </div>
              </div>
              <div class="admin-view__role-actions">
                <button
                  @click="openEditRoleModal(role)"
                  class="admin-table__action-btn"
                  title="Editar"
                >
                  <EditIcon :size="18" />
                </button>
                <button
                  v-if="!role.isSystem"
                  @click="handleDeleteRole(role)"
                  class="admin-table__action-btn admin-table__action-btn--danger"
                  title="Eliminar"
                >
                  <TrashIcon :size="18" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Permissions Reference -->
        <div class="card">
          <div class="table-card__header">
            <div>
              <h2 class="table-card__title">Permisos Disponibles</h2>
              <p class="table-card__subtitle">Referencia de todos los permisos que pueden asignarse a roles</p>
            </div>
          </div>

          <div class="admin-view__permissions">
            <div v-for="(perms, category) in rolesStore.groupedPermissions" :key="category" class="admin-view__permission-category">
              <h4 class="admin-view__permission-category-title">{{ getCategoryLabel(category) }}</h4>
              <div class="admin-view__permissions-grid">
                <div
                  v-for="permission in perms"
                  :key="permission._id"
                  class="admin-view__permission-card"
                >
                  <p class="admin-view__permission-card-name">{{ permission.name }}</p>
                  <p class="admin-view__permission-card-desc">{{ permission.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :is-open="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :confirm-text="confirmModal.confirmText"
      :cancel-text="confirmModal.cancelText"
      :is-danger="confirmModal.isDanger"
      @close="confirmModal.isOpen = false"
      @confirm="handleConfirm"
    />

    <!-- Role Modal -->
    <Teleport to="body">
      <div
        v-if="showRoleModal"
        class="modal-overlay"
        @click.self="closeRoleModal"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-header__title">
              {{ editingRole ? 'Editar Rol' : 'Nuevo Rol' }}
            </h2>
          </div>

          <form @submit.prevent="handleSaveRole" class="modal-body">
            <!-- Name -->
            <div class="form-section">
              <label for="role-name" class="form-label">
                Nombre del Rol
              </label>
              <input
                id="role-name"
                v-model="roleForm.name"
                type="text"
                required
                :disabled="editingRole?.isSystem"
                class="input-field"
                :class="{ 'input-field--disabled': editingRole?.isSystem }"
                placeholder="Ej: Moderador"
              />
            </div>

            <!-- Description -->
            <div class="form-section">
              <label for="role-description" class="form-label">
                Descripción
              </label>
              <textarea
                id="role-description"
                v-model="roleForm.description"
                rows="2"
                class="input-field"
                placeholder="Describe el propósito de este rol..."
              ></textarea>
            </div>

            <!-- Permissions -->
            <div class="form-section">
              <p class="form-label">Permisos</p>
              <div class="modal-body__permissions">
                <label
                  v-for="permission in rolesStore.permissions"
                  :key="permission._id"
                  class="modal-body__permission-item"
                >
                  <input
                    type="checkbox"
                    :value="permission._id"
                    v-model="roleForm.permissions"
                    class="modal-body__checkbox"
                  />
                  <div>
                    <p class="modal-body__permission-name">{{ permission.name }}</p>
                    <p class="modal-body__permission-desc">{{ permission.description }}</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Actions -->
            <div class="modal-body__actions">
              <button
                type="button"
                @click="closeRoleModal"
                class="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="rolesStore.loading || !roleForm.name"
                class="btn btn-primary"
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
import ConfirmationModal from '@/components/ConfirmationModal.vue'
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

// Confirmation Modal
const confirmModal = ref<{
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  isDanger: boolean
  onConfirm: (() => void) | null
}>({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  isDanger: false,
  onConfirm: null
})

const openConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  options?: {
    confirmText?: string
    cancelText?: string
    isDanger?: boolean
  }
) => {
  confirmModal.value = {
    isOpen: true,
    title,
    message,
    confirmText: options?.confirmText || 'Confirmar',
    cancelText: options?.cancelText || 'Cancelar',
    isDanger: options?.isDanger ?? false,
    onConfirm
  }
}

const handleConfirm = () => {
  if (confirmModal.value.onConfirm) {
    confirmModal.value.onConfirm()
  }
  confirmModal.value.isOpen = false
  confirmModal.value.onConfirm = null
}

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

const deleteUserConfirm = (user: AdminUser) => {
  openConfirm(
    'Eliminar Usuario',
    `¿Estás seguro de que deseas eliminar a ${user.name} y TODOS sus datos (terrarios, animales)?\n\nEsta acción no se puede deshacer.`,
    async () => {
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
    },
    {
      confirmText: 'Eliminar',
      isDanger: true
    }
  )
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

const getRoleSelectClass = (slug?: string): string => {
  if (slug === 'super_admin') return 'admin-table__role-select--purple'
  if (slug === 'moderator') return 'admin-table__role-select--blue'
  return 'admin-table__role-select--default'
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

const handleDeleteRole = (role: Role) => {
  openConfirm(
    'Eliminar Rol',
    `¿Estás seguro de que deseas eliminar el rol "${role.name}"?`,
    async () => {
      const success = await rolesStore.deleteRole(role._id)
      if (!success && rolesStore.error) {
        alert(rolesStore.error)
      } else {
        fetchAvailableRoles()
        fetchStats()
      }
    },
    {
      confirmText: 'Eliminar',
      isDanger: true
    }
  )
}

onMounted(async () => {
  fetchStats()
  fetchUsers()
  fetchAvailableRoles()
  await rolesStore.fetchRoles()
  await rolesStore.fetchPermissions()
})
</script>

<style scoped>
.admin-view {
  min-height: 100vh;
  padding-bottom: 80px; /* Espacio para la navegación móvil */
}

@media (min-width: 768px) {
  .admin-view {
    padding-bottom: 0;
  }
}

.admin-view__main {
  padding-top: 1.5rem;
  padding-bottom: 2rem;
}

@media (min-width: 768px) {
  .admin-view__main {
    padding-top: 2rem;
  }
}

/* View Header */
.view-header {
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .view-header {
    margin-bottom: 2rem;
  }
}

.view-header__top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.view-header__icon {
  color: #9333ea; /* Purple para admin */
}

.view-header__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

@media (min-width: 768px) {
  .view-header__title {
    font-size: 1.875rem;
  }
}

.view-header__subtitle {
  font-size: 1.125rem;
  color: var(--color-text-muted);
}

/* Admin Tabs */
.admin-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.tab-btn:hover {
  background-color: var(--color-background);
  color: var(--color-text-main);
}

.tab-btn.active {
  background: #9333ea; /* Purple para admin */
  color: white;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon-wrapper {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-wrapper--blue {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.stat-icon-wrapper--green {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.stat-icon-wrapper--amber {
  background-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.stat-icon-wrapper--purple {
  background-color: rgba(168, 85, 247, 0.2);
  color: #a855f7;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* Quick Stats */
.admin-view__quick-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .admin-view__quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

.card__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 1rem;
}

.card__stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card__stats-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--color-text-muted);
}

.card__stats-value {
  font-weight: 600;
  color: var(--color-text-main);
}

.card__stats-value--green {
  color: #15803d;
}

.card__stats-value--purple {
  color: #9333ea;
}

.card__stats-value--blue {
  color: #3b82f6;
}

/* Colores de estadísticas en modo oscuro */
[data-theme='dark'] .card__stats-value--green {
  color: #4ade80;
}

[data-theme='dark'] .card__stats-value--purple {
  color: #c084fc;
}

[data-theme='dark'] .card__stats-value--blue {
  color: #60a5fa;
}

/* Table Card */
.table-card {
  overflow: hidden;
}

.table-card__header {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.table-card__subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

.table-card__search {
  position: relative;
  min-width: 250px;
}

.table-card__search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.table-card__search-input {
  padding-left: 2.5rem;
}

/* Loading */
.admin-view__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.admin-view__loader-icon {
  color: #9333ea;
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

/* Table */
.table-responsive {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admin-table th {
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.02);
  color: var(--color-text-muted);
  font-size: 0.85rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.admin-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.admin-table__row {
  transition: background-color var(--transition-fast);
}

.admin-table__row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.admin-table__row:last-child td {
  border-bottom: none;
}

.admin-table__user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-table__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: rgba(168, 85, 247, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9333ea;
  font-weight: 600;
  flex-shrink: 0;
}

.admin-table__user-name {
  font-weight: 500;
  color: var(--color-text-main);
  margin: 0;
}

.admin-table__user-email {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
}

.admin-table__role-select {
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.admin-table__role-select--purple {
  background-color: rgba(168, 85, 247, 0.2);
  color: #9333ea;
}

.admin-table__role-select--blue {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.admin-table__role-select--default {
  background-color: var(--color-border-light);
  color: var(--color-text-main);
}

/* Ajustes para modo oscuro */
[data-theme='dark'] .admin-table__role-select--purple {
  background-color: rgba(168, 85, 247, 0.25);
  color: #c084fc;
}

[data-theme='dark'] .admin-table__role-select--blue {
  background-color: rgba(59, 130, 246, 0.25);
  color: #60a5fa;
}

/* Opciones del select en modo oscuro */
.admin-table__role-select option {
  background-color: var(--color-surface);
  color: var(--color-text-main);
}

.admin-table__role-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.admin-table__text-muted {
  color: var(--color-text-muted);
}

.admin-table__date {
  font-size: 0.875rem;
}

.admin-table__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-table__action-btn {
  padding: 0.5rem;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.admin-table__action-btn:hover:not(:disabled) {
  background-color: var(--color-border-light);
}

.admin-table__action-btn--success {
  color: #15803d;
}

.admin-table__action-btn--success:hover:not(:disabled) {
  background-color: rgba(21, 128, 61, 0.1);
}

.admin-table__action-btn--warning {
  color: #f59e0b;
}

.admin-table__action-btn--warning:hover:not(:disabled) {
  background-color: rgba(245, 158, 11, 0.1);
}

.admin-table__action-btn--danger {
  color: var(--color-accent);
}

.admin-table__action-btn--danger:hover:not(:disabled) {
  background-color: rgba(239, 108, 0, 0.1);
}

/* Botones de acción en modo oscuro */
[data-theme='dark'] .admin-table__action-btn--success {
  color: #4ade80;
}

[data-theme='dark'] .admin-table__action-btn--warning {
  color: #fbbf24;
}

.admin-table__action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Status Badge */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-block;
}

.status-badge--active {
  background-color: #dcfce7; /* Green 100 */
  color: #15803d; /* Green 700 */
}

.status-badge--inactive {
  background-color: #fee2e2; /* Red 100 */
  color: #b91c1c; /* Red 700 */
}

/* Status Badge en modo oscuro */
[data-theme='dark'] .status-badge--active {
  background-color: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

[data-theme='dark'] .status-badge--inactive {
  background-color: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* Pagination */
.table-card__pagination {
  padding: 1.25rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-card__pagination-info {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
}

.table-card__pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-card__pagination-page {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

/* Roles Section */
.admin-view__roles {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.admin-view__roles-list {
  display: flex;
  flex-direction: column;
}

.admin-view__role-item {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  transition: background-color var(--transition-fast);
}

.admin-view__role-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.admin-view__role-item:last-child {
  border-bottom: none;
}

.admin-view__role-content {
  flex: 1;
}

.admin-view__role-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  flex-wrap: wrap;
}

.admin-view__role-name {
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.admin-view__role-description {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0 0 0.75rem 0;
}

.admin-view__role-permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.admin-view__permission-tag {
  padding: 0.25rem 0.5rem;
  background-color: rgba(16, 185, 129, 0.1);
  color: #15803d;
  font-size: 0.75rem;
  border-radius: var(--radius-full);
}

[data-theme='dark'] .admin-view__permission-tag {
  background-color: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.admin-view__permission-empty {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.admin-view__role-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Badge secondary ya definido en components.css, pero sobrescribimos si es necesario */
.admin-view .badge-secondary {
  background-color: var(--color-border-light);
  color: var(--color-text-muted);
}

/* Permissions Reference */
.admin-view__permissions {
  padding: 1.25rem;
}

.admin-view__permission-category {
  margin-bottom: 1.5rem;
}

.admin-view__permission-category:last-child {
  margin-bottom: 0;
}

.admin-view__permission-category-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.admin-view__permissions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .admin-view__permissions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.admin-view__permission-card {
  padding: 0.75rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-lg);
}

.admin-view__permission-card-name {
  font-weight: 500;
  color: var(--color-text-main);
  font-size: 0.875rem;
  margin: 0 0 0.25rem 0;
}

.admin-view__permission-card-desc {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-float);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-header__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-body__permissions {
  max-height: 15rem;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-lg);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal-body__permission-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.modal-body__permission-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.modal-body__checkbox {
  width: 1rem;
  height: 1rem;
  margin-top: 0.125rem;
  cursor: pointer;
  accent-color: #9333ea;
}

.modal-body__permission-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-main);
  margin: 0 0 0.25rem 0;
}

.modal-body__permission-desc {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin: 0;
}

.modal-body__actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
}

.modal-body__actions .btn {
  flex: 1;
}

.input-field--disabled {
  background-color: rgba(0, 0, 0, 0.05);
  cursor: not-allowed;
}

/* Form Section */
.form-section {
  margin-bottom: 1.25rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-main);
  font-size: 1rem;
}
</style>
