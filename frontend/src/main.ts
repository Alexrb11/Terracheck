import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Interceptor global para manejar errores 403 (Forbidden)
// Guardar la función fetch original
const originalFetch = window.fetch

// Variable para almacenar la función de logout del store
let authLogout: (() => void) | null = null

// Función para configurar el logout del store (se llamará después de que la app esté montada)
export function setAuthLogout(logoutFn: () => void) {
  authLogout = logoutFn
}

// Sobrescribir fetch globalmente para interceptar respuestas 403
window.fetch = async function(...args: Parameters<typeof fetch>): Promise<Response> {
  const response = await originalFetch(...args)

  // Si la respuesta es 403 (Forbidden), redirigir al login
  if (response.status === 403) {
    // Limpiar token del localStorage
    localStorage.removeItem('token')
    
    // Si el store de auth está disponible, usar su método logout
    if (authLogout) {
      authLogout()
    } else {
      // Si no está disponible, redirigir directamente
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }
  }

  return response
}

// Aplicar tema temprano para evitar flash de contenido sin estilo
function initializeTheme() {
  const STORAGE_KEY = 'terracheck-theme'
  
  // Obtener tema guardado o preferencia del sistema
  const stored = localStorage.getItem(STORAGE_KEY)
  let theme: 'light' | 'dark' = 'light'
  
  if (stored === 'light' || stored === 'dark') {
    theme = stored
  } else if (globalThis.matchMedia && globalThis.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme = 'dark'
  }
  
  // Aplicar inmediatamente al elemento HTML
  document.documentElement.dataset.theme = theme
}

// Ejecutar antes de crear la app
initializeTheme()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inicializar autenticación antes de montar la app
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()

// Configurar el logout del store en el interceptor global
setAuthLogout(() => {
  authStore.logout()
})

// Usar top-level await si es posible, o promise chain
;(async () => {
  await authStore.initializeAuth()
  app.mount('#app')
})()
