<template>
  <!-- Topbar Móvil -->
  <nav class="nav-bar nav-bar--mobile" aria-label="Navegación móvil">
    <div class="nav-bar__mobile-header">
      <button
        @click="isDrawerOpen = true"
        class="nav-bar__menu-button"
        aria-label="Abrir menú"
      >
        <MenuIcon :size="24" />
      </button>
      <router-link to="/" class="nav-bar__mobile-logo">
        Terracheck
      </router-link>
      <div v-if="authStore.user" class="nav-bar__mobile-avatar">
        <UserIcon :size="20" />
      </div>
    </div>
  </nav>

  <!-- Overlay del Drawer -->
  <div
    v-if="isDrawerOpen"
    class="drawer-overlay"
    @click="closeDrawer"
  ></div>

  <!-- Drawer (Menú Lateral) -->
  <aside
    class="drawer"
    :class="{ 'drawer--open': isDrawerOpen }"
    aria-label="Menú de navegación"
  >
    <!-- Header del Drawer -->
    <div class="drawer__header">
      <router-link to="/" class="drawer__logo" @click="closeDrawer">
        Terracheck
      </router-link>
      <button
        @click="closeDrawer"
        class="drawer__close-button"
        aria-label="Cerrar menú"
      >
        <XIcon :size="24" />
      </button>
    </div>

    <!-- Navegación del Drawer -->
    <nav class="drawer__nav" aria-label="Navegación principal">
      <router-link
        to="/"
        class="drawer__nav-item"
        :class="{ 'drawer__nav-item--active': $route.path === '/' }"
        @click="closeDrawer"
      >
        <LayoutGridIcon :size="24" />
        <span>Terrarios</span>
        <ChevronRightIcon :size="20" class="drawer__nav-chevron" />
      </router-link>

      <router-link
        to="/species"
        class="drawer__nav-item"
        :class="{ 'drawer__nav-item--active': $route.path === '/species' }"
        @click="closeDrawer"
      >
        <BookOpenIcon :size="24" />
        <span>Especies</span>
        <ChevronRightIcon :size="20" class="drawer__nav-chevron" />
      </router-link>

      <router-link
        to="/my-animals"
        class="drawer__nav-item"
        :class="{ 'drawer__nav-item--active': $route.path === '/my-animals' }"
        @click="closeDrawer"
      >
        <PawPrintIcon :size="24" />
        <span>Mis Especies</span>
        <ChevronRightIcon :size="20" class="drawer__nav-chevron" />
      </router-link>

      <router-link
        v-if="authStore.isAdmin"
        to="/admin"
        class="drawer__nav-item drawer__nav-item--admin"
        :class="{ 'drawer__nav-item--active': $route.path.startsWith('/admin') }"
        @click="closeDrawer"
      >
        <ShieldIcon :size="24" />
        <span>Admin</span>
        <ChevronRightIcon :size="20" class="drawer__nav-chevron" />
      </router-link>
    </nav>

    <!-- Footer del Drawer (Perfil) -->
    <div class="drawer__footer">
      <div v-if="authStore.user" class="drawer__user-info">
        <div class="drawer__user-avatar">
          <UserIcon :size="24" />
        </div>
        <div class="drawer__user-details">
          <p class="drawer__user-name">{{ authStore.user.name }}</p>
          <p class="drawer__user-email">{{ authStore.user.email }}</p>
        </div>
      </div>

      <div class="drawer__user-actions">
        <button
          class="drawer__action-item"
          @click="toggleTheme"
          aria-label="Cambiar tema"
        >
          <SunIcon v-if="theme === 'dark'" :size="20" />
          <MoonIcon v-else :size="20" />
          <span>{{ theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro' }}</span>
        </button>

        <router-link
          to="/profile"
          class="drawer__action-item"
          :class="{ 'drawer__action-item--active': $route.path === '/profile' }"
          @click="closeDrawer"
        >
          <UserIcon :size="20" />
          <span>Mi Perfil</span>
        </router-link>

        <router-link
          to="/settings"
          class="drawer__action-item"
          :class="{ 'drawer__action-item--active': $route.path === '/settings' }"
          @click="closeDrawer"
        >
          <SettingsIcon :size="20" />
          <span>Configuración</span>
        </router-link>

        <button
          class="drawer__action-item drawer__action-item--danger"
          @click="handleLogout"
        >
          <LogOutIcon :size="20" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  </aside>

  <!-- Navegación Desktop (Top Bar) -->
  <nav class="nav-bar nav-bar--desktop" aria-label="Navegación principal">
    <div class="container">
      <div class="nav-bar__content">
        <router-link to="/" class="nav-bar__logo">
          Terracheck
        </router-link>

        <div class="nav-bar__menu">
          <router-link
            to="/"
            class="nav-link nav-link--horizontal"
            :class="{ 'nav-link--active': $route.path === '/' }"
          >
            <LayoutGridIcon :size="20" />
            <span>Mis Terrarios</span>
          </router-link>

          <router-link
            to="/species"
            class="nav-link nav-link--horizontal"
            :class="{ 'nav-link--active': $route.path === '/species' }"
          >
            <BookOpenIcon :size="20" />
            <span>Especies</span>
          </router-link>

          <router-link
            to="/my-animals"
            class="nav-link nav-link--horizontal"
            :class="{ 'nav-link--active': $route.path === '/my-animals' }"
          >
            <PawPrintIcon :size="20" />
            <span>Mis Especies</span>
          </router-link>

          <!-- Admin Panel (solo visible para admins) -->
          <router-link
            v-if="authStore.isAdmin"
            to="/admin"
            class="nav-link nav-link--horizontal nav-link--admin"
            :class="{ 'nav-link--active': $route.path.startsWith('/admin') }"
          >
            <ShieldIcon :size="20" />
            <span>Admin</span>
          </router-link>

          <!-- Separador -->
          <div class="nav-bar__separator"></div>

          <!-- Botón de cambio de tema -->
          <button
            @click="toggleTheme"
            class="nav-bar__theme-toggle"
            aria-label="Cambiar tema"
            :title="theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          >
            <SunIcon v-if="theme === 'dark'" :size="20" />
            <MoonIcon v-else :size="20" />
          </button>

          <!-- Usuario con Dropdown -->
          <div class="nav-bar__user" ref="userDropdownRef">
            <button
              @click="toggleDropdown"
              class="nav-bar__user-button"
              :class="{ 'nav-bar__user-button--active': showDropdown }"
              aria-label="Menú de usuario"
              :aria-expanded="showDropdown"
            >
              <div v-if="authStore.user" class="nav-bar__user-info">
                <div class="flex items-center gap-sm justify-end">
                  <p class="nav-bar__user-name">{{ authStore.user.name }}</p>
                  <span v-if="authStore.isAdmin" class="badge badge-primary">
                    Admin
                  </span>
                </div>
                <p class="nav-bar__user-email">{{ authStore.user.email }}</p>
              </div>
              <ChevronDownIcon
                :size="20"
                class="nav-bar__chevron"
                :class="{ 'nav-bar__chevron--rotated': showDropdown }"
              />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showDropdown"
              class="nav-bar__dropdown"
            >
              <button
                class="nav-bar__dropdown-item"
                @click="toggleTheme"
                aria-label="Cambiar tema"
              >
                <SunIcon v-if="theme === 'dark'" :size="18" />
                <MoonIcon v-else :size="18" />
                <span>{{ theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro' }}</span>
              </button>
              <div class="nav-bar__dropdown-divider"></div>
              <router-link
                to="/profile"
                class="nav-bar__dropdown-item"
                :class="{ 'nav-bar__dropdown-item--active': $route.path === '/profile' }"
                @click="closeDropdown"
              >
                <UserIcon :size="18" />
                <span>Mi Perfil</span>
              </router-link>
              <router-link
                to="/settings"
                class="nav-bar__dropdown-item"
                :class="{ 'nav-bar__dropdown-item--active': $route.path === '/settings' }"
                @click="closeDropdown"
              >
                <SettingsIcon :size="18" />
                <span>Configuración</span>
              </router-link>
              <div class="nav-bar__dropdown-divider"></div>
              <button
                class="nav-bar__dropdown-item nav-bar__dropdown-item--danger"
                @click="handleLogout"
              >
                <LogOutIcon :size="18" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import {
  LayoutGridIcon,
  BookOpenIcon,
  LogOutIcon,
  ShieldIcon,
  PawPrintIcon,
  SettingsIcon,
  ChevronDownIcon,
  MenuIcon,
  XIcon,
  UserIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon
} from 'lucide-vue-next'

const authStore = useAuthStore()
const { theme, toggleTheme } = useTheme()

// Estado del drawer móvil
const isDrawerOpen = ref(false)

const closeDrawer = () => {
  isDrawerOpen.value = false
}

// Estado del dropdown (desktop)
const showDropdown = ref(false)
const userDropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

// Cerrar dropdown al hacer clic fuera
const handleClickOutside = (event: MouseEvent) => {
  if (userDropdownRef.value && !userDropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleLogout = () => {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    closeDropdown()
    closeDrawer()
    authStore.logout()
  }
}
</script>

<style scoped>
.nav-bar {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  z-index: 1030;
}

/* Navegación Móvil - Topbar */
.nav-bar--mobile {
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1030;
}

.nav-bar__mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  height: 60px;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}

.nav-bar__menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--color-text-main);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-bar__menu-button:hover {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.nav-bar__mobile-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.nav-bar__mobile-logo:hover {
  opacity: 0.8;
}

.nav-bar__mobile-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

/* Drawer Overlay */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background-color: var(--color-overlay);
  z-index: 40;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Drawer (Menú Lateral) */
.drawer {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 80%;
  max-width: 320px;
  background-color: var(--color-surface);
  z-index: 50;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.drawer--open {
  transform: translateX(0);
}

.drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
}

.drawer__logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
}

.drawer__close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--color-text-main);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.drawer__close-button:hover {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

/* Navegación del Drawer */
.drawer__nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.drawer__nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: var(--color-text-main);
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
}

.drawer__nav-item:hover {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.drawer__nav-item--active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

.drawer__nav-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: var(--color-primary);
  border-radius: 0 2px 2px 0;
}

.drawer__nav-item--admin {
  color: #9333ea;
}

.drawer__nav-item--admin:hover,
.drawer__nav-item--admin.drawer__nav-item--active {
  background-color: #f3e8ff;
  color: #9333ea;
}

.drawer__nav-chevron {
  margin-left: auto;
  color: var(--color-text-muted);
  opacity: 0.5;
}

.drawer__nav-item--active .drawer__nav-chevron {
  color: var(--color-primary);
  opacity: 1;
}

/* Footer del Drawer (Perfil) */
.drawer__footer {
  border-top: 1px solid var(--color-border-light);
  padding: 1.5rem;
  background-color: var(--color-background);
}

.drawer__user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border-light);
}

.drawer__user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  flex-shrink: 0;
}

.drawer__user-details {
  flex: 1;
  min-width: 0;
}

.drawer__user-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawer__user-email {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawer__user-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.drawer__action-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--color-text-main);
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.drawer__action-item:hover {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.drawer__action-item--active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

.drawer__action-item--danger {
  color: var(--color-accent);
}

.drawer__action-item--danger:hover {
  background-color: rgba(239, 108, 0, 0.2);
  color: #d84315;
}

/* Navegación Desktop - Barra flotante con glass-bg (versión clara) */
.nav-bar--desktop {
  display: none;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

[data-theme='dark'] .nav-bar--desktop {
  background: rgba(15, 23, 42, 0.85); /* Slate 900 con transparencia */
}

.nav-bar__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  min-height: var(--header-height);
}

.nav-bar__logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  transition: color var(--transition-fast);
}

.nav-bar__logo:hover {
  opacity: 0.8;
}

.nav-bar__menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-bar__separator {
  width: 1px;
  height: 32px;
  background-color: var(--color-border);
}

.nav-bar__theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--color-text-main);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-bar__theme-toggle:hover {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.nav-bar__user {
  position: relative;
  display: flex;
  align-items: center;
}

.nav-bar__user-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-lg);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: right;
}

.nav-bar__user-button:hover {
  background-color: var(--color-primary-light);
}

.nav-bar__user-button--active {
  background-color: var(--color-primary-light);
}

.nav-bar__user-info {
  text-align: right;
}

.nav-bar__user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-main);
}

.nav-bar__user-email {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.nav-bar__chevron {
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
  flex-shrink: 0;
}

.nav-bar__chevron--rotated {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.nav-bar__dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 200px;
  padding: 0.5rem;
  z-index: 1000;
  border: 1px solid var(--color-border-light);
}

.nav-bar__dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--color-text-main);
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.nav-bar__dropdown-item:hover {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.nav-bar__dropdown-item--active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

.nav-bar__dropdown-item--danger {
  color: var(--color-accent);
}

.nav-bar__dropdown-item--danger:hover {
  background-color: rgba(239, 108, 0, 0.2);
  color: #d84315;
}

.nav-bar__dropdown-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 0.5rem 0;
}

/* Enlaces de navegación */
.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-lg);
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
  text-decoration: none;
  cursor: pointer;
}

.nav-link--horizontal {
  flex-direction: row;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
}

.nav-link:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.nav-link--active {
  color: var(--color-primary);
  font-weight: 700;
  background-color: var(--color-primary-light);
}

.nav-link--admin {
  color: #9333ea;
}

.nav-link--admin:hover,
.nav-link--admin.nav-link--active {
  background-color: #f3e8ff;
  font-weight: 700;
}

.nav-link--danger {
  color: var(--color-text-muted);
}

.nav-link--danger:hover {
  color: var(--color-accent);
  background-color: rgba(239, 108, 0, 0.1);
}

.nav-link__text {
  font-size: 0.75rem;
  font-weight: 500;
}

@media (min-width: 768px) {
  .nav-bar--mobile {
    display: none;
  }

  .drawer-overlay,
  .drawer {
    display: none;
  }

  .nav-bar--desktop {
    display: block;
  }
}
</style>
