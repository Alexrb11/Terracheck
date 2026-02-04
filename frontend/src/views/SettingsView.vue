<template>
  <div class="settings-view">
    <Navigation />

    <!-- Contenido Principal -->
    <main class="container settings-view__main">
      <div class="settings-view__header">
        <h2 class="settings-view__title">
          <SettingsIcon :size="28" />
          Configuración de Usuario
        </h2>
        <p class="settings-view__subtitle">
          Gestiona tu perfil, seguridad y cuenta
        </p>
      </div>

      <!-- Sección: Perfil -->
      <div class="card settings-section">
        <div class="settings-section__header">
          <div class="settings-section__header-content">
            <div class="settings-section__icon-wrapper">
              <UserIcon :size="24" />
            </div>
            <h3 class="settings-section__title">Perfil</h3>
          </div>
        </div>

        <form @submit.prevent="handleUpdateProfile" class="settings-section__form">
          <div class="form-group">
            <label for="name" class="form-label">Nombre</label>
            <input
              id="name"
              v-model="profileForm.name"
              type="text"
              class="input-field"
              :class="{ 'input-field--error': profileErrors.name }"
              placeholder="Tu nombre completo"
              required
            />
            <span v-if="profileErrors.name" class="form-error">{{ profileErrors.name }}</span>
          </div>

          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input
              id="username"
              v-model="profileForm.username"
              type="text"
              class="input-field"
              placeholder="Tu nombre de usuario (opcional)"
            />
            <p class="form-hint">Opcional. Úsalo para identificarte de forma única.</p>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="profileForm.email"
              type="email"
              class="input-field"
              :class="{ 'input-field--error': profileErrors.email }"
              placeholder="tu@email.com"
              required
            />
            <span v-if="profileErrors.email" class="form-error">{{ profileErrors.email }}</span>
          </div>

          <div v-if="profileError" class="alert alert-danger mb-md">
            {{ profileError }}
          </div>

          <div v-if="profileSuccess" class="alert alert-success mb-md">
            Perfil actualizado exitosamente
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="profileLoading"
          >
            <SaveIcon :size="20" />
            <span v-if="!profileLoading">Guardar Cambios</span>
            <span v-else>Guardando...</span>
          </button>
        </form>
      </div>

      <!-- Sección: Privacidad -->
      <div class="card settings-section">
        <div class="settings-section__header">
          <div class="settings-section__header-content">
            <div class="settings-section__icon-wrapper settings-section__icon-wrapper--privacy">
              <EyeIcon :size="24" />
            </div>
            <h3 class="settings-section__title">Privacidad</h3>
          </div>
        </div>

        <div class="settings-section__form">
          <div class="form-group">
            <label for="profileVisibility" class="form-label">
              <GlobeIcon :size="18" class="form-label-icon" />
              Visibilidad del Perfil
            </label>
            <select
              id="profileVisibility"
              v-model="profileForm.privacySettings.profileVisibility"
              class="input-field input-field--select"
            >
              <option value="public">Público</option>
              <option value="friends_only">Solo Amigos</option>
              <option value="private">Privado</option>
            </select>
            <p class="form-hint">Quién puede ver que existes y tu información básica.</p>
          </div>

          <div class="form-group">
            <label for="showTerrariums" class="form-label">
              <UsersIcon :size="18" class="form-label-icon" />
              Quién puede ver mis Terrarios
            </label>
            <select
              id="showTerrariums"
              v-model="profileForm.privacySettings.showTerrariums"
              class="input-field input-field--select"
            >
              <option value="everyone">Todos</option>
              <option value="friends_only">Solo Amigos</option>
              <option value="private">Nadie</option>
            </select>
          </div>

          <div class="form-group">
            <label for="showAnimals" class="form-label">
              <EyeOffIcon :size="18" class="form-label-icon" />
              Quién puede ver mis Animales
            </label>
            <select
              id="showAnimals"
              v-model="profileForm.privacySettings.showAnimals"
              class="input-field input-field--select"
            >
              <option value="everyone">Todos</option>
              <option value="friends_only">Solo Amigos</option>
              <option value="private">Nadie</option>
            </select>
          </div>

          <p class="settings-section__privacy-note">
            Los administradores del sistema pueden ver tu contenido por motivos de seguridad y moderación.
          </p>

          <div v-if="privacyError" class="alert alert-danger mb-md">
            {{ privacyError }}
          </div>
          <div v-if="privacySuccess" class="alert alert-success mb-md">
            Configuración de privacidad guardada
          </div>

          <button
            type="button"
            class="btn btn-primary"
            :disabled="privacyLoading"
            @click="handleSavePrivacy"
          >
            <SaveIcon :size="20" />
            <span v-if="!privacyLoading">Guardar Privacidad</span>
            <span v-else>Guardando...</span>
          </button>
        </div>
      </div>

      <!-- Sección: Seguridad -->
      <div class="card settings-section">
        <div class="settings-section__header">
          <div class="settings-section__header-content">
            <div class="settings-section__icon-wrapper">
              <LockIcon :size="24" />
            </div>
            <h3 class="settings-section__title">Seguridad</h3>
          </div>
        </div>

        <form @submit.prevent="handleChangePassword" class="settings-section__form">
          <div class="form-group">
            <label for="currentPassword" class="form-label">Contraseña Actual</label>
            <input
              id="currentPassword"
              v-model="passwordForm.currentPassword"
              type="password"
              class="input-field"
              :class="{ 'input-field--error': passwordErrors.currentPassword }"
              placeholder="Ingresa tu contraseña actual"
              required
            />
            <span v-if="passwordErrors.currentPassword" class="form-error">{{ passwordErrors.currentPassword }}</span>
          </div>

          <div class="form-group">
            <label for="newPassword" class="form-label">Nueva Contraseña</label>
            <input
              id="newPassword"
              v-model="passwordForm.newPassword"
              type="password"
              class="input-field"
              :class="{ 'input-field--error': passwordErrors.newPassword }"
              placeholder="Mínimo 6 caracteres"
              required
              minlength="6"
            />
            <span v-if="passwordErrors.newPassword" class="form-error">{{ passwordErrors.newPassword }}</span>
          </div>

          <div v-if="passwordError" class="alert alert-danger mb-md">
            {{ passwordError }}
          </div>

          <div v-if="passwordSuccess" class="alert alert-success mb-md">
            Contraseña actualizada exitosamente
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="passwordLoading"
          >
            <LockIcon :size="20" />
            <span v-if="!passwordLoading">Cambiar Contraseña</span>
            <span v-else>Cambiando...</span>
          </button>
        </form>
      </div>

      <!-- Sección: Zona de Peligro -->
      <div class="card settings-section settings-section--danger">
        <div class="settings-section__header">
          <div class="settings-section__header-content">
            <div class="settings-section__icon-wrapper settings-section__icon-wrapper--danger">
              <TrashIcon :size="24" />
            </div>
            <h3 class="settings-section__title">Zona de Peligro</h3>
          </div>
        </div>

        <div class="settings-section__content">
          <p class="settings-section__danger-text">
            Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten cuidado.
          </p>

          <div v-if="deleteError" class="alert alert-danger mb-md">
            {{ deleteError }}
          </div>

          <button
            @click="showDeleteModal = true"
            class="btn btn-danger"
            :disabled="deleteLoading"
          >
            <TrashIcon :size="20" />
            <span>Eliminar Cuenta</span>
          </button>
        </div>
      </div>
    </main>

    <!-- Modal de Confirmación para Eliminar Cuenta -->
    <ConfirmationModal
      :is-open="showDeleteModal"
      title="Eliminar Cuenta"
      message="¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible y todos tus datos serán desactivados."
      confirm-text="Sí, Eliminar Cuenta"
      cancel-text="Cancelar"
      :is-danger="true"
      @close="showDeleteModal = false"
      @confirm="handleDeleteAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Navigation from '@/components/Navigation.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import {
  SettingsIcon,
  UserIcon,
  LockIcon,
  TrashIcon,
  SaveIcon,
  EyeIcon,
  EyeOffIcon,
  UsersIcon,
  GlobeIcon
} from 'lucide-vue-next'
import type { PrivacySettings } from '@/stores/auth'

const authStore = useAuthStore()

const defaultPrivacy: PrivacySettings = {
  profileVisibility: 'public',
  showTerrariums: 'friends_only',
  showAnimals: 'friends_only'
}

const profileForm = reactive({
  name: '',
  email: '',
  username: '',
  privacySettings: { ...defaultPrivacy }
})

const profileLoading = ref(false)
const profileError = ref<string | null>(null)
const profileSuccess = ref(false)
const profileErrors = ref<{
  name?: string
  email?: string
}>({})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: ''
})

const passwordLoading = ref(false)
const passwordError = ref<string | null>(null)
const passwordSuccess = ref(false)
const passwordErrors = ref<{
  currentPassword?: string
  newPassword?: string
}>({})

const privacyLoading = ref(false)
const privacyError = ref<string | null>(null)
const privacySuccess = ref(false)

const deleteLoading = ref(false)
const deleteError = ref<string | null>(null)
const showDeleteModal = ref(false)

onMounted(() => {
  if (authStore.user) {
    profileForm.name = authStore.user.name
    profileForm.email = authStore.user.email
    profileForm.username = authStore.user.username || ''
    if (authStore.user.privacySettings) {
      profileForm.privacySettings = {
        profileVisibility: authStore.user.privacySettings.profileVisibility ?? defaultPrivacy.profileVisibility,
        showTerrariums: authStore.user.privacySettings.showTerrariums ?? defaultPrivacy.showTerrariums,
        showAnimals: authStore.user.privacySettings.showAnimals ?? defaultPrivacy.showAnimals
      }
    }
  }
})

const validateProfile = (): boolean => {
  profileErrors.value = {}

  if (!profileForm.name.trim()) {
    profileErrors.value.name = 'El nombre es obligatorio'
  }

  if (!profileForm.email.trim()) {
    profileErrors.value.email = 'El email es obligatorio'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
    profileErrors.value.email = 'Por favor ingresa un email válido'
  }

  return Object.keys(profileErrors.value).length === 0
}

const handleUpdateProfile = async () => {
  profileErrors.value = {}
  profileLoading.value = true
  profileError.value = null
  profileSuccess.value = false

  if (!validateProfile()) {
    profileLoading.value = false
    return
  }

  try {
    const success = await authStore.updateProfile({
      name: profileForm.name,
      email: profileForm.email,
      username: profileForm.username || undefined,
      privacySettings: profileForm.privacySettings
    })

    if (success) {
      profileSuccess.value = true
      setTimeout(() => {
        profileSuccess.value = false
      }, 3000)
    } else {
      profileError.value = authStore.error || 'Error al actualizar perfil'
    }
  } catch (error) {
    profileError.value = error instanceof Error ? error.message : 'Error desconocido'
  } finally {
    profileLoading.value = false
  }
}

const handleSavePrivacy = async () => {
  privacyLoading.value = true
  privacyError.value = null
  privacySuccess.value = false
  try {
    const success = await authStore.updateProfile({
      name: profileForm.name,
      email: profileForm.email,
      username: profileForm.username || undefined,
      privacySettings: profileForm.privacySettings
    })
    if (success) {
      privacySuccess.value = true
      setTimeout(() => { privacySuccess.value = false }, 3000)
    } else {
      privacyError.value = authStore.error || 'Error al guardar privacidad'
    }
  } catch (error) {
    privacyError.value = error instanceof Error ? error.message : 'Error desconocido'
  } finally {
    privacyLoading.value = false
  }
}

const validatePassword = (): boolean => {
  passwordErrors.value = {}

  if (!passwordForm.currentPassword.trim()) {
    passwordErrors.value.currentPassword = 'La contraseña actual es obligatoria'
  }

  if (!passwordForm.newPassword.trim()) {
    passwordErrors.value.newPassword = 'La nueva contraseña es obligatoria'
  } else if (passwordForm.newPassword.length < 6) {
    passwordErrors.value.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres'
  }

  return Object.keys(passwordErrors.value).length === 0
}

const handleChangePassword = async () => {
  passwordErrors.value = {}
  passwordLoading.value = true
  passwordError.value = null
  passwordSuccess.value = false

  if (!validatePassword()) {
    passwordLoading.value = false
    return
  }

  try {
    const success = await authStore.changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    )

    if (success) {
      passwordSuccess.value = true
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      setTimeout(() => {
        passwordSuccess.value = false
      }, 3000)
    } else {
      passwordError.value = authStore.error || 'Error al cambiar contraseña'
    }
  } catch (error) {
    passwordError.value = error instanceof Error ? error.message : 'Error desconocido'
  } finally {
    passwordLoading.value = false
  }
}

const handleDeleteAccount = async () => {
  deleteLoading.value = true
  deleteError.value = null
  showDeleteModal.value = false

  try {
    await authStore.deleteAccount()
  } catch (error) {
    deleteError.value = error instanceof Error ? error.message : 'Error al eliminar cuenta'
    deleteLoading.value = false
  }
}
</script>

<style scoped>
.settings-view {
  min-height: 100vh;
  padding-bottom: 80px; /* Espacio para la navegación móvil */
  background-color: var(--color-background);
}

.settings-view__main {
  padding: 2rem 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.settings-view__header {
  margin-bottom: 2rem;
  text-align: center;
}

.settings-view__title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
}

.settings-view__subtitle {
  color: var(--color-text-muted);
  font-size: 1rem;
}

/* Secciones de configuración */
.settings-section {
  margin-bottom: 2rem;
}

.settings-section__header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.settings-section__header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.settings-section__icon-wrapper {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-md);
  background-color: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.settings-section__icon-wrapper--privacy {
  background-color: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}

.settings-section__icon-wrapper--danger {
  background-color: rgba(239, 108, 0, 0.1);
  color: var(--color-accent);
}

.form-label-icon {
  vertical-align: middle;
  margin-right: 0.35rem;
}

.input-field--select {
  cursor: pointer;
  appearance: auto;
}

.settings-section__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-main);
  margin: 0;
}

.settings-section__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-section__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settings-section__danger-text {
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;
}

/* Formulario */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: var(--color-text-main);
  font-size: 0.95rem;
}

.form-hint {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
}

.settings-section__privacy-note {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.04);
  border-radius: var(--radius-md);
  border-left: 3px solid #9333ea;
}

/* Alertas */
.alert-success {
  background-color: rgba(46, 125, 50, 0.1);
  border-color: rgba(46, 125, 50, 0.3);
  color: #0d4f14;
  padding: 1rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Botones */
.btn {
  align-self: flex-start;
}

@media (min-width: 768px) {
  .settings-view__main {
    padding: 3rem 2rem;
  }

  .settings-view__title {
    font-size: 2.5rem;
  }
}

/* Errores de formulario */
.form-error {
  color: var(--color-accent);
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.input-field--error {
  border-color: var(--color-accent);
}
</style>
