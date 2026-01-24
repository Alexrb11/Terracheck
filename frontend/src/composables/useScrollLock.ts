import { watch, onUnmounted, type Ref } from 'vue'

/**
 * Composable para bloquear/desbloquear el scroll del body
 * Útil para modales, lightboxes, etc.
 * 
 * @param isLocked - Referencia reactiva que indica si el scroll debe estar bloqueado
 */
export function useScrollLock(isLocked: Ref<boolean>): void {
  // Función para actualizar el estado del scroll
  const updateScrollLock = (locked: boolean) => {
    if (locked) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }

  // Observar cambios en isLocked
  watch(
    isLocked,
    (newValue) => {
      updateScrollLock(newValue)
    },
    { immediate: true } // Ejecutar inmediatamente al montar
  )

  // Seguridad: siempre restaurar el scroll al desmontar el componente
  onUnmounted(() => {
    document.body.style.overflow = ''
  })
}
