<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="modal-overlay" 
        @click.self="$emit('close')"
      >
        <div class="modal-card confirmation-card">
          <header class="modal-header confirmation-header">
            <div 
              class="confirmation-header__icon-wrapper"
              :class="{
                'confirmation-header__icon-wrapper--danger': isDanger,
                'confirmation-header__icon-wrapper--info': !isDanger
              }"
            >
              <AlertTriangleIcon 
                v-if="isDanger" 
                class="confirmation-header__icon" 
                :size="24" 
              />
              <InfoIcon 
                v-else 
                class="confirmation-header__icon" 
                :size="24" 
              />
            </div>
            <h3 class="modal-title">{{ title }}</h3>
          </header>
          
          <div class="modal-body">
            <p class="modal-message">{{ message }}</p>
          </div>

          <footer class="modal-footer">
            <button 
              class="btn btn-secondary" 
              @click="$emit('close')"
            >
              {{ cancelText }}
            </button>
            <button 
              class="btn" 
              :class="isDanger ? 'btn-danger' : 'btn-primary'"
              @click="$emit('confirm')"
            >
              {{ confirmText }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangleIcon, InfoIcon } from 'lucide-vue-next'

withDefaults(defineProps<{
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
}>(), {
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  isDanger: false
})

defineEmits<{
  close: []
  confirm: []
}>()
</script>

<style scoped>
/* ============================================
   OVERLAY Y MODAL BASE
   ============================================ */
.modal-overlay {
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(100vh - var(--header-height));
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* En móvil, la barra está abajo, así que usamos pantalla completa */
@media (max-width: 767px) {
  .modal-overlay {
    top: 0;
    height: 100vh;
  }
}

.modal-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-float);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modal-slide-up 0.3s ease-out;
}

.confirmation-card {
  max-width: 400px; /* Más estrecho que el modal normal */
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
.confirmation-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.confirmation-header__icon-wrapper {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirmation-header__icon {
  color: inherit;
}

.confirmation-header__icon-wrapper--danger {
  background-color: rgba(239, 108, 0, 0.1);
}

.confirmation-header__icon-wrapper--danger .confirmation-header__icon {
  color: var(--color-accent);
}

.confirmation-header__icon-wrapper--info {
  background-color: var(--color-primary-light);
}

.confirmation-header__icon-wrapper--info .confirmation-header__icon {
  color: var(--color-primary);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
  flex: 1;
}

/* ============================================
   BODY
   ============================================ */
.modal-body {
  padding: 1.5rem;
}

.modal-message {
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0;
  font-size: 0.95rem;
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
}

.modal-footer .btn {
  min-width: 100px;
}
</style>
