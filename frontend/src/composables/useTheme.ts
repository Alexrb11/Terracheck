import { ref, onMounted } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'terracheck-theme'

export function useTheme() {
  const theme = ref<Theme>('light')

  // Función para aplicar el tema al DOM
  const applyTheme = (newTheme: Theme) => {
    document.documentElement.dataset.theme = newTheme
    localStorage.setItem(STORAGE_KEY, newTheme)
    theme.value = newTheme
  }

  // Función para obtener el tema inicial
  const getInitialTheme = (): Theme => {
    // 1. Revisar localStorage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored as Theme
    }

    // 2. Revisar preferencias del sistema
    if (globalThis.matchMedia && globalThis.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    // 3. Por defecto, modo claro
    return 'light'
  }

  // Inicializar tema
  const initializeTheme = () => {
    const initialTheme = getInitialTheme()
    applyTheme(initialTheme)
  }

  // Función para cambiar el tema
  const toggleTheme = () => {
    const newTheme: Theme = theme.value === 'light' ? 'dark' : 'light'
    applyTheme(newTheme)
  }

  // Escuchar cambios en las preferencias del sistema (solo si no hay tema guardado)
  const watchSystemPreference = () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light')
      }
      
      // Escuchar cambios
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
      }
    }
  }

  // Inicializar al montar
  onMounted(() => {
    initializeTheme()
    watchSystemPreference()
  })

  return {
    theme,
    toggleTheme,
    initializeTheme
  }
}
