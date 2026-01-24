<template>
  <div class="auth-view">
    <div class="auth-container">
      <div class="auth-header">
        <div class="logo-circle">
          <LeafIcon :size="32" />
        </div>
        <h1 class="auth-title">Terracheck</h1>
        <p class="auth-subtitle">Inicia sesión para gestionar tus terrarios</p>
      </div>

      <div class="card auth-card">
        <h2 class="card-title">Iniciar Sesión</h2>

        <div v-if="authStore.error" class="alert alert-danger mb-md">
          <div class="alert-content">
            <AlertCircleIcon :size="20" />
            <span>{{ authStore.error }}</span>
          </div>
          <button @click="authStore.clearError()" class="btn-icon">
            <XIcon :size="18" />
          </button>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <div class="input-wrapper">
              <MailIcon :size="20" class="input-icon" />
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                autocomplete="email"
                class="input-field input-with-icon"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <div class="input-wrapper">
              <LockIcon :size="20" class="input-icon" />
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                class="input-field input-with-icon input-with-action"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="input-action-btn"
              >
                <EyeIcon v-if="!showPassword" :size="20" />
                <EyeOffIcon v-else :size="20" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading || !isFormValid"
            class="btn btn-primary w-full"
          >
            <LoaderIcon v-if="authStore.loading" :size="20" class="spin" />
            <span>{{ authStore.loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}</span>
          </button>
        </form>

        <p class="auth-footer">
          ¿No tienes cuenta?
          <router-link to="/register" class="link-primary">
            Regístrate
          </router-link>
        </p>
      </div>

      <div class="demo-accounts">
        <p class="demo-title">Cuentas de demostración</p>
        
        <div 
          class="demo-card demo-card--admin"
          @click="fillCredentials('admin@terracheck.com', 'admin123')"
        >
          <div class="demo-info">
            <div class="demo-icon demo-icon--admin">
              <ShieldIcon :size="16" />
            </div>
            <div>
              <p class="demo-name demo-text--admin">Admin</p>
              <p class="demo-role demo-text--admin">Acceso completo</p>
            </div>
          </div>
          <div class="text-right">
            <p class="demo-email demo-text--admin">admin@terracheck.com</p>
            <p class="demo-pass demo-text--admin">admin123</p>
          </div>
        </div>

        <div 
          class="demo-card demo-card--user"
          @click="fillCredentials('user@terracheck.com', 'user123')"
        >
          <div class="demo-info">
            <div class="demo-icon demo-icon--user">
              <UserIcon :size="16" />
            </div>
            <div>
              <p class="demo-name demo-text--user">Usuario</p>
              <p class="demo-role demo-text--user">Acceso limitado</p>
            </div>
          </div>
          <div class="text-right">
            <p class="demo-email demo-text--user">user@terracheck.com</p>
            <p class="demo-pass demo-text--user">user123</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LeafIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  XIcon,
  LoaderIcon,
  ShieldIcon,
  UserIcon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)

const isFormValid = computed(() => {
  return form.value.email.trim() !== '' && form.value.password.trim() !== ''
})

const handleLogin = async () => {
  if (!isFormValid.value) return
  const success = await authStore.login(form.value.email, form.value.password)
  if (success) {
    router.push('/')
  }
}

const fillCredentials = (email: string, password: string) => {
  form.value.email = email
  form.value.password = password
}
</script>

<style scoped>
.auth-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: var(--color-background);
}

.auth-container {
  width: 100%;
  max-width: 450px;
}

/* Header */
.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background-color: var(--color-primary-light);
  border-radius: 50%;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.auth-subtitle {
  color: var(--color-text-muted);
  margin-top: 0.5rem;
}

/* Card & Form */
.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
}

/* Inputs con Iconos */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: var(--color-text-muted);
  pointer-events: none;
}

.input-with-icon {
  padding-left: 3rem !important;
}

.input-with-action {
  padding-right: 3rem !important;
}

.input-action-btn {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.25rem;
}

.input-action-btn:hover {
  color: var(--color-text-main);
}

/* Botones y Links */
.w-full {
  width: 100%;
}

.spin {
  animation: spin 1s linear infinite;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--color-text-muted);
}

.link-primary {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.link-primary:hover {
  color: #1b5e20; /* Darker green */
}

/* Alerts custom */
.alert {
  flex-direction: row;
  justify-content: space-between;
  padding: 1rem;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.btn-icon {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
}

.btn-icon:hover {
  opacity: 1;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Demo Accounts Styles */
.demo-accounts {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.demo-title {
  text-align: center;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.demo-card {
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all var(--transition-fast);
}

.demo-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.demo-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-name {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
}

.demo-role {
  font-size: 0.75rem;
  margin: 0;
  opacity: 0.8;
}

.demo-email, .demo-pass {
  font-size: 0.75rem;
  font-family: monospace;
  margin: 0;
}

/* Admin Theme */
.demo-card--admin {
  background-color: #f3e8ff; /* Purple 50 equivalent */
  border-color: #d8b4fe;
}
.demo-card--admin:hover {
  background-color: #e9d5ff;
}
.demo-icon--admin {
  background-color: #d8b4fe;
  color: #6b21a8;
}
.demo-text--admin {
  color: #6b21a8;
}

/* User Theme */
.demo-card--user {
  background-color: var(--color-primary-light);
  border-color: #a7f3d0;
}
.demo-card--user:hover {
  background-color: #d1fae5;
}
.demo-icon--user {
  background-color: #a7f3d0;
  color: var(--color-primary);
}
.demo-text--user {
  color: #064e3b;
}
</style>