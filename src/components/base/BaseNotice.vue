<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Modal } from 'bootstrap'

const showModal = ref(false)
const modalRef = ref<HTMLElement | null>(null)
let bsModal: Modal | null = null
let previousActiveElement: HTMLElement | null = null

// Store event handlers separately for cleanup
const eventHandlers = {
  handleHiding: () => {
    // Move focus before animation starts
    if (previousActiveElement && 'focus' in previousActiveElement) {
      try {
        (previousActiveElement as HTMLElement).focus()
      } catch (e) {
        console.warn('Failed to focus on previous element:', e)
      }
    }
  },
  handleHidden: () => {
    showModal.value = false
    previousActiveElement = null
  },
  handleShown: () => {
    // Store the previously focused element
    previousActiveElement = document.activeElement as HTMLElement
    // Focus the close button when modal is shown
    const closeButton = modalRef.value?.querySelector('button[data-action="close"]') as HTMLElement
    if (closeButton) {
      closeButton.focus()
    }
  }
}

onMounted(() => {
  if (modalRef.value) {
    // Remove Bootstrap's aria-hidden handling
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
          modalRef.value?.removeAttribute('aria-hidden')
        }
      })
    })

    observer.observe(modalRef.value, {
      attributes: true,
      attributeFilter: ['aria-hidden']
    })

    bsModal = new Modal(modalRef.value, {
      keyboard: true,
      backdrop: true
    })

    modalRef.value.addEventListener('hide.bs.modal', eventHandlers.handleHiding)
    modalRef.value.addEventListener('hidden.bs.modal', eventHandlers.handleHidden)
    modalRef.value.addEventListener('shown.bs.modal', eventHandlers.handleShown)

    // Initial cleanup of any existing aria-hidden
    modalRef.value.removeAttribute('aria-hidden')
  }
})

// Store observer reference for cleanup
let ariaObserver: MutationObserver | null = null

onMounted(() => {
  if (modalRef.value) {
    // Remove Bootstrap's aria-hidden handling
    ariaObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
          modalRef.value?.removeAttribute('aria-hidden')
        }
      })
    })

    ariaObserver.observe(modalRef.value, {
      attributes: true,
      attributeFilter: ['aria-hidden']
    })

    bsModal = new Modal(modalRef.value, {
      keyboard: true,
      backdrop: true
    })

    modalRef.value.addEventListener('hide.bs.modal', eventHandlers.handleHiding)
    modalRef.value.addEventListener('hidden.bs.modal', eventHandlers.handleHidden)
    modalRef.value.addEventListener('shown.bs.modal', eventHandlers.handleShown)

    // Initial cleanup of any existing aria-hidden
    modalRef.value.removeAttribute('aria-hidden')
  }
})

onBeforeUnmount(() => {
  if (modalRef.value) {
    modalRef.value.removeEventListener('hide.bs.modal', eventHandlers.handleHiding)
    modalRef.value.removeEventListener('hidden.bs.modal', eventHandlers.handleHidden)
    modalRef.value.removeEventListener('shown.bs.modal', eventHandlers.handleShown)
  }
  if (bsModal) {
    bsModal.dispose()
  }
  if (ariaObserver) {
    ariaObserver.disconnect()
  }
})

function openModal() {
  showModal.value = true
  if (bsModal) {
    bsModal.show()
  }
}

function closeModal() {
  if (bsModal) {
    bsModal.hide()
  }
}
</script>

<template>
  <button type="button" class="btn btn-link nav-link" @click="openModal">
    <i class="bi bi-exclamation-circle"></i>
    <span class="d-lg-none ms-2">
      {{ $t('notices.experimental.display') }}
    </span>
  </button>

  <Teleport to="body">
    <div ref="modalRef" class="modal modal-lg fade" tabindex="-1" aria-labelledby="experimentLabel" :inert="!showModal">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="experimentLabel" class="modal-title">
              {{ $t('notices.experimental.label') }}
            </h5>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col">
                <p>{{ $t('notices.experimental.message') }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-action="close" @click="closeModal">
              {{ $t('common.actions.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
