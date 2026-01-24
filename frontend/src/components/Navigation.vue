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
        to="/species"
        class="nav-link"
        :class="{ 'nav-link--active': $route.path === '/species' }"
        aria-label="Especies"
      >
        <BookOpenIcon :size="24" />
        <span class="nav-link__text">Especies</span>
      </router-link>

      <router-link
        to="/my-animals"
        class="nav-link"
        :class="{ 'nav-link--active': $route.path === '/my-animals' }"
        aria-label="Mis Especies"
      >
        <PawPrintIcon :size="24" />
        <span class="nav-link__text">Mis Especies</span>
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
  BookOpenIcon,
  LogOutIcon,
  ShieldIcon,
  PawPrintIcon
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
  background-color: var(--color-surface);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: var(--shadow-sm);
  z-index: 1030;
}

/* Navegación Móvil */
.nav-bar--mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  border-bottom: none;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.nav-bar--mobile .nav-bar__container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 64px;
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
  background-color: rgba(0, 0, 0, 0.1);
}

.nav-bar__user {
  display: flex;
  align-items: center;
  gap: 1rem;
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

  .nav-bar--desktop {
    display: block;
  }
}
</style>
