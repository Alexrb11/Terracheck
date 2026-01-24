<template>
  <BaseModal
    :is-open="isOpen"
    :max-width="'400px'"
    :card-class="'confirmation-modal-card'"
    @close="$emit('close')"
  >
    <template #header>
      <div class="confirmation-header__content">
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
      </div>
    </template>

    <template #default>
      <p class="modal-message">{{ message }}</p>
    </template>

    <template #footer>
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
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import { AlertTriangleIcon, InfoIcon } from 'lucide-vue-next'
import { useScrollLock } from '@/composables/useScrollLock'

const props = withDefaults(defineProps<{
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

// Bloquear scroll cuando el modal está abierto
useScrollLock(toRef(props, 'isOpen'))
</script>

<style scoped>
/* ============================================
   HEADER
   ============================================ */
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

/* Contenedor para icono y título juntos */
.confirmation-header__content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

:deep(.modal-title) {
  margin: 0;
  flex: 0 1 auto;
}

/* ============================================
   BODY
   ============================================ */
.modal-message {
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0;
  font-size: 0.95rem;
}

/* ============================================
   FOOTER
   ============================================ */
:deep(.modal-footer .btn) {
  min-width: 100px;
}

/* Asegurar que el modal de confirmación no exceda 400px en desktop */
.confirmation-modal-card {
  max-width: 400px !important;
}
</style>
