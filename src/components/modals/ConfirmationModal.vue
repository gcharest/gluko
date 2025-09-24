<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Modal } from 'bootstrap'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: undefined },
  cancelLabel: { type: String, default: undefined },
  confirmVariant: { type: String, default: 'danger' }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])
const modalRef = ref<HTMLElement | null>(null)
let bsModal: Modal | null = null

let previousActiveElement: HTMLElement | null = null

const eventHandlers = {
  handleHiding: () => {
    // Move focus before animation starts
    if (previousActiveElement && 'focus' in previousActiveElement) {
      try {
        ;(previousActiveElement as HTMLElement).focus()
      } catch {
        // Fallback to body if original element is no longer available
        document.body.focus()
      }
    }
  },
  handleHidden: () => {
    emit('update:modelValue', false)
    previousActiveElement = null
  },
  handleShown: () => {
    emit('update:modelValue', true)
    // Store the previously focused element
    previousActiveElement = document.activeElement as HTMLElement
    // Focus the cancel button by default for safety
    const cancelBtn = modalRef.value?.querySelector('.btn-secondary') as HTMLButtonElement | null
    cancelBtn?.focus()
  }
}

// Initialize Bootstrap modal and event handlers
onMounted(() => {
  if (modalRef.value) {
    bsModal = new Modal(modalRef.value, {
      keyboard: true,
      backdrop: true
    })

    modalRef.value.addEventListener('hide.bs.modal', eventHandlers.handleHiding)
    modalRef.value.addEventListener('hidden.bs.modal', eventHandlers.handleHidden)
    modalRef.value.addEventListener('shown.bs.modal', eventHandlers.handleShown)
  }
})

// Cleanup event listeners and modal instance
onBeforeUnmount(() => {
  if (modalRef.value) {
    modalRef.value.removeEventListener('hide.bs.modal', eventHandlers.handleHiding)
    modalRef.value.removeEventListener('hidden.bs.modal', eventHandlers.handleHidden)
    modalRef.value.removeEventListener('shown.bs.modal', eventHandlers.handleShown)
  }
  if (bsModal) {
    bsModal.dispose()
  }
})

// Watch for v-model changes
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && bsModal) {
      bsModal.show()
    } else if (!newVal && bsModal) {
      bsModal.hide()
    }
  }
)

function handleConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

// Handle keyboard events
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleConfirm()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      ref="modalRef"
      class="modal fade"
      tabindex="-1"
      :aria-labelledby="'confirmation-modal-title'"
      :inert="!modelValue"
      @keydown="handleKeydown"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="confirmation-modal-title" class="modal-title">
              {{ title }}
            </h5>
            <button
              type="button"
              class="btn-close"
              :aria-label="$t('common.actions.close')"
              @click="handleCancel"
            ></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="handleCancel">
              {{ cancelLabel || $t('modals.general.cancel') }}
            </button>
            <button type="button" :class="`btn btn-${confirmVariant}`" @click="handleConfirm">
              {{ confirmLabel || $t('modals.general.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
