<template>
  <div class="auth-view">
    <div class="auth-container">
      <div class="auth-header">
        <div class="logo-circle">
          <LeafIcon :size="32" />
        </div>
        <h1 class="auth-title">Terracheck</h1>
        <p class="auth-subtitle">Crea tu cuenta para empezar</p>
      </div>

      <div class="card auth-card">
        <h2 class="card-title">Crear Cuenta</h2>

        <div v-if="authStore.error" class="alert alert-danger mb-md">
          <div class="alert-content">
            <AlertCircleIcon :size="20" />
            <span>{{ authStore.error }}</span>
          </div>
          <button @click="authStore.clearError()" class="btn-icon">
            <XIcon :size="18" />
          </button>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="name" class="form-label">Nombre</label>
            <div class="input-wrapper">
              <UserIcon :size="20" class="input-icon" />
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                autocomplete="name"
                class="input-field input-with-icon"
                placeholder="Tu nombre"
              />
            </div>
          </div>

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
                autocomplete="new-password"
                minlength="6"
                class="input-field input-with-icon input-with-action"
                placeholder="Mínimo 6 caracteres"
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
            <p v-if="form.password && form.password.length < 6" class="form-hint warning">
              La contraseña debe tener al menos 6 caracteres
            </p>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading || !isFormValid"
            class="btn btn-primary w-full"
          >
            <LoaderIcon v-if="authStore.loading" :size="20" class="spin" />
            <span>{{ authStore.loading ? 'Creando cuenta...' : 'Crear Cuenta' }}</span>
          </button>
        </form>

        <p class="auth-footer">
          ¿Ya tienes cuenta?
          <router-link to="/login" class="link-primary">
            Inicia Sesión
          </router-link>
        </p>
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
  UserIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  XIcon,
  LoaderIcon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  name: '',
  email: '',
  password: ''
})

const showPassword = ref(false)

const isFormValid = computed(() => {
  return (
    form.value.name.trim() !== '' &&
    form.value.email.trim() !== '' &&
    form.value.password.length >= 6
  )
})

const handleRegister = async () => {
  if (!isFormValid.value) return
  const success = await authStore.register(
    form.value.name,
    form.value.email,
    form.value.password
  )
  if (success) {
    router.push('/')
  }
}
</script>

<style scoped>
/* Copia exactamente los mismos estilos del LoginView para mantener consistencia */
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

.form-hint {
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.form-hint.warning {
  color: var(--color-accent);
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
  color: #1b5e20;
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
</style>