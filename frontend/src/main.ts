import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

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

// Usar top-level await si es posible, o promise chain
;(async () => {
  await authStore.initializeAuth()
  app.mount('#app')
})()
