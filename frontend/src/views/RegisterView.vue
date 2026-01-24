<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <LeafIcon :size="32" class="text-emerald-600" />
        </div>
        <h1 class="text-3xl font-bold text-slate-800">Terracheck</h1>
        <p class="text-slate-600 mt-2">Crea tu cuenta para empezar</p>
      </div>

      <!-- Card de Registro -->
      <div class="bg-white rounded-3xl shadow-lg p-8">
        <h2 class="text-2xl font-semibold text-slate-800 mb-6 text-center">
          Crear Cuenta
        </h2>

        <!-- Mensaje de error -->
        <div
          v-if="authStore.error"
          class="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3"
        >
          <AlertCircleIcon :size="20" class="text-red-600 flex-shrink-0" />
          <p class="text-red-700 text-sm">{{ authStore.error }}</p>
          <button
            @click="authStore.clearError()"
            class="ml-auto text-red-400 hover:text-red-600"
          >
            <XIcon :size="18" />
          </button>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Nombre -->
          <div>
            <label for="name" class="block text-sm font-medium text-slate-700 mb-2">
              Nombre
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon :size="20" class="text-slate-400" />
              </div>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                autocomplete="name"
                class="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-emerald-600 focus:outline-none text-lg"
                placeholder="Tu nombre"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MailIcon :size="20" class="text-slate-400" />
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                autocomplete="email"
                class="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-emerald-600 focus:outline-none text-lg"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-2">
              Contraseña
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LockIcon :size="20" class="text-slate-400" />
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="new-password"
                minlength="6"
                class="w-full pl-12 pr-12 py-3 rounded-2xl border-2 border-stone-200 focus:border-emerald-600 focus:outline-none text-lg"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                <EyeIcon v-if="!showPassword" :size="20" />
                <EyeOffIcon v-else :size="20" />
              </button>
            </div>
            <p
              v-if="form.password && form.password.length < 6"
              class="mt-1 text-sm text-amber-600"
            >
              La contraseña debe tener al menos 6 caracteres
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="authStore.loading || !isFormValid"
            class="w-full py-3 px-6 bg-emerald-600 text-white font-semibold text-lg rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <LoaderIcon v-if="authStore.loading" :size="20" class="animate-spin" />
            <span>{{ authStore.loading ? 'Creando cuenta...' : 'Crear Cuenta' }}</span>
          </button>
        </form>

        <!-- Link a login -->
        <p class="mt-6 text-center text-slate-600">
          ¿Ya tienes cuenta?
          <router-link
            to="/login"
            class="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
          >
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
