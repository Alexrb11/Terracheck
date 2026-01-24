<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="modal-overlay" 
        @click.self="handleClose"
      >
        <div 
          class="modal-card" 
          :class="cardClass"
          role="dialog" 
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <!-- Header -->
          <header v-if="$slots.header || title" class="modal-header">
            <slot name="header">
              <h2 v-if="title" :id="titleId" class="modal-title">{{ title }}</h2>
              <button 
                v-if="showCloseButton"
                class="btn-icon" 
                @click="handleClose" 
                title="Cerrar"
                aria-label="Cerrar"
              >
                <XIcon :size="24" />
              </button>
            </slot>
          </header>
          
          <!-- Body -->
          <div class="modal-body" :class="bodyClass">
            <slot></slot>
          </div>

          <!-- Footer -->
          <footer v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { XIcon } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  title?: string
  showCloseButton?: boolean
  maxWidth?: string
  bodyClass?: string
  cardClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  showCloseButton: true,
  maxWidth: '40%',
  bodyClass: '',
  cardClass: ''
})

const emit = defineEmits<{
  close: []
}>()

const titleId = computed(() => props.title ? 'modal-title' : undefined)

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
/* ============================================
   OVERLAY Y MODAL BASE
   ============================================ */
.modal-overlay {
  position: fixed;
  top: calc(var(--header-height) + 1rem);
  bottom: var(--bottom-nav-height); /* Respeta Barra Inferior (0px en PC, 80px en Móvil) */
  left: 0;
  right: 0;
  height: calc(100vh - var(--header-height) - var(--bottom-nav-height));
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  /* Asegurar márgenes mínimos arriba y abajo */
  padding-top: max(2rem, calc(var(--header-height) * 0.5));
  padding-bottom: 2rem;
}

/* En móvil, la barra está abajo, así que usamos pantalla completa */
@media (max-width: 767px) {
  .modal-overlay {
    top: 0;
    height: calc(100vh - var(--bottom-nav-height));
    padding: 1.5rem 1rem;
    padding-top: 1.5rem;
    padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
  }
}

.modal-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: v-bind('props.maxWidth');
  max-height: calc(100vh - var(--header-height) - 4rem);
  box-shadow: var(--shadow-float);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modal-slide-up 0.3s ease-out;
}

/* En pantallas grandes, limitar al 40% */
@media (min-width: 768px) {
  .modal-card {
    max-width: 40%;
  }
}

/* En móvil, ajustar el max-height y ancho completo */
@media (max-width: 767px) {
  .modal-card {
    max-width: 100%;
    max-height: calc(100vh - var(--bottom-nav-height) - 3rem);
  }
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transición de fade para el overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ============================================
   HEADER
   ============================================ */
.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
  flex: 1;
}

.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: 0.25rem;
  border-radius: 50%;
  transition: background var(--transition-fast), color var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
}

.btn-icon:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-text-main);
}

/* ============================================
   BODY
   ============================================ */
.modal-body {
  padding: 1.5rem;
  padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
  overflow-y: auto;
  flex: 1;
}

/* ============================================
   FOOTER
   ============================================ */
.modal-footer {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.02);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}
</style>
