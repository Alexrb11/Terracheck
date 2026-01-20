<template>
  <!-- Navegación Móvil (Bottom Bar) -->
  <nav class="nav-bar nav-bar--mobile" aria-label="Navegación principal">
    <div class="nav-bar__container">
      <router-link
        to="/"
        class="nav-link"
        :class="{ 'nav-link--active': $route.path === '/' }"
        aria-label="Mis Terrarios"
      >
        <LayoutGridIcon :size="24" />
        <span class="nav-link__text">Terrarios</span>
      </router-link>

      <router-link
        to="/add"
        class="nav-link"
        :class="{ 'nav-link--active': $route.path === '/add' }"
        aria-label="Agregar Terrario"
      >
        <PlusCircleIcon :size="24" />
        <span class="nav-link__text">Agregar</span>
      </router-link>

      <router-link
        to="/species"
        class="nav-link"
        :class="{ 'nav-link--active': $route.path === '/species' }"
        aria-label="Especies"
      >
        <BookOpenIcon :size="24" />
        <span class="nav-link__text">Especies</span>
      </router-link>

      <button
        class="nav-link nav-link--danger"
        aria-label="Cerrar Sesión"
        @click="handleLogout"
      >
        <LogOutIcon :size="24" />
        <span class="nav-link__text">Salir</span>
      </button>
    </div>
  </nav>

  <!-- Navegación Desktop (Top Bar) -->
  <nav class="nav-bar nav-bar--desktop" aria-label="Navegación principal">
    <div class="container">
      <div class="nav-bar__content">
        <router-link to="/" class="nav-bar__logo">
          TerrariumKeeper
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
            to="/add"
            class="nav-link nav-link--horizontal"
            :class="{ 'nav-link--active': $route.path === '/add' }"
          >
            <PlusCircleIcon :size="20" />
            <span>Agregar</span>
          </router-link>

          <router-link
            to="/species"
            class="nav-link nav-link--horizontal"
            :class="{ 'nav-link--active': $route.path === '/species' }"
          >
            <BookOpenIcon :size="20" />
            <span>Especies</span>
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

          <!-- Usuario y Logout -->
          <div class="nav-bar__user">
            <div v-if="authStore.user" class="nav-bar__user-info">
              <div class="flex items-center gap-sm justify-end">
                <p class="nav-bar__user-name">{{ authStore.user.name }}</p>
                <span v-if="authStore.isAdmin" class="badge badge-primary">
                  Admin
                </span>
              </div>
              <p class="nav-bar__user-email">{{ authStore.user.email }}</p>
            </div>
            <button
              class="nav-link nav-link--horizontal nav-link--danger"
              @click="handleLogout"
              title="Cerrar Sesión"
            >
              <LogOutIcon :size="20" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import {
  LayoutGridIcon,
  PlusCircleIcon,
  BookOpenIcon,
  LogOutIcon,
  ShieldIcon
} from 'lucide-vue-next'

const authStore = useAuthStore()

const handleLogout = () => {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    authStore.logout()
  }
}
</script>

<style scoped>
.nav-bar {
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  z-index: var(--z-fixed);
}

/* Navegación Móvil */
.nav-bar--mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid var(--border-light);
  border-bottom: none;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
}

.nav-bar--mobile .nav-bar__container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 64px;
}

/* Navegación Desktop */
.nav-bar--desktop {
  display: none;
  position: sticky;
  top: 0;
}

.nav-bar__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
}

.nav-bar__logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  transition: color var(--transition-fast);
}

.nav-bar__logo:hover {
  color: var(--primary-dark);
}

.nav-bar__menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.nav-bar__separator {
  width: 1px;
  height: 32px;
  background-color: var(--border-light);
}

.nav-bar__user {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.nav-bar__user-info {
  text-align: right;
}

.nav-bar__user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-main);
}

.nav-bar__user-email {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Enlaces de navegación */
.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-xl);
  color: var(--text-muted);
  transition: all var(--transition-fast);
  text-decoration: none;
  cursor: pointer;
}

.nav-link--horizontal {
  flex-direction: row;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  font-weight: 500;
}

.nav-link:hover {
  color: var(--primary);
  background-color: var(--primary-light);
  background-color: rgba(134, 239, 172, 0.2);
}

.nav-link--active {
  color: var(--primary);
  background-color: rgba(134, 239, 172, 0.2);
}

.nav-link--admin {
  color: #9333ea;
}

.nav-link--admin:hover,
.nav-link--admin.nav-link--active {
  background-color: #f3e8ff;
}

.nav-link--danger {
  color: var(--text-muted);
}

.nav-link--danger:hover {
  color: var(--danger);
  background-color: var(--danger-light);
}

.nav-link__text {
  font-size: 0.75rem;
  font-weight: 500;
}

@media (min-width: 768px) {
  .nav-bar--mobile {
    display: none;
  }

  .nav-bar--desktop {
    display: block;
  }
}
</style>
