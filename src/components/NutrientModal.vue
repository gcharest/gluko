<script setup lang="ts">
import { ref, type PropType, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Nutrient } from '@/stores/meal'
import { useMealStore } from '@/stores/meal'
import { Modal } from 'bootstrap'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nutrient: { type: Object as PropType<Nutrient>, required: true }
})

const emit = defineEmits(['update:modelValue', 'cancelNutrientChanges'])
const mealStore = useMealStore()
const modalRef = ref<HTMLElement | null>(null)
let bsModal: Modal | null = null

// Store event handlers separately for cleanup
const eventHandlers = {
  handleHidden: () => {
    emit('update:modelValue', false)
    emit('cancelNutrientChanges')
    // Remove keyboard listener when modal is hidden
    document.removeEventListener('keydown', handleGlobalKeydown)
  },
  handleShown: () => {
    emit('update:modelValue', true)
    // Focus first input when modal opens
    const firstInput = modalRef.value?.querySelector('input')
    firstInput?.focus()
    // Add keyboard listener when modal is shown
    document.addEventListener('keydown', handleGlobalKeydown)
  }
}

// Handle Enter key press globally when modal is open
function handleGlobalKeydown(event: KeyboardEvent) {
  // Only handle Enter key
  if (event.key !== 'Enter') return

  // Don't trigger if user is typing in an input field
  if (event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    event.target instanceof HTMLSelectElement) {
    return
  }

  // Don't trigger if user is holding modifier keys
  if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) return

  event.preventDefault()
  saveNutrient()
}

const currentNutrient = ref<Nutrient>({
  id: '',
  name: '',
  quantity: 0,
  factor: 0
})

// Initialize Bootstrap modal and event handlers
onMounted(() => {
  if (modalRef.value) {
    bsModal = new Modal(modalRef.value, {
      keyboard: true,
      backdrop: true
    })

    modalRef.value.addEventListener('hidden.bs.modal', eventHandlers.handleHidden)
    modalRef.value.addEventListener('shown.bs.modal', eventHandlers.handleShown)
  }
})

// Cleanup event listeners and modal instance
onBeforeUnmount(() => {
  if (modalRef.value) {
    modalRef.value.removeEventListener('hidden.bs.modal', eventHandlers.handleHidden)
    modalRef.value.removeEventListener('shown.bs.modal', eventHandlers.handleShown)
  }
  // Ensure keyboard listener is removed
  document.removeEventListener('keydown', handleGlobalKeydown)
  if (bsModal) {
    bsModal.dispose()
  }
})

// Watch for v-model changes
// Watch for v-model changes to show/hide modal
watch(() => props.modelValue, (newVal) => {
  if (newVal && bsModal) {
    bsModal.show()
  } else if (!newVal && bsModal) {
    bsModal.hide()
  }
})

// Watch for nutrient changes to update local state
watch(() => props.nutrient, (newVal) => {
  if (newVal) {
    currentNutrient.value = JSON.parse(JSON.stringify(newVal))
  }
}, { immediate: true })

function saveNutrient() {
  mealStore.updateNutrient(currentNutrient.value)
  emit('update:modelValue', false)
}

function cancelNutrientChanges() {
  currentNutrient.value = JSON.parse(JSON.stringify(props.nutrient))
  emit('cancelNutrientChanges')
  emit('update:modelValue', false)
}

// Input event handlers
function handleInputFocus(event: FocusEvent) {
  const input = event.target as HTMLInputElement
  input?.select?.()
}

function handleInputEnter(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement
  input?.blur?.()
}
</script>

<template>
  <Teleport to="body">
    <div ref="modalRef" class="modal modal-lg fade" tabindex="-1" aria-labelledby="nutrient-modal-title"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="nutrient-modal-title" class="modal-title display-6">
              {{ currentNutrient.name || $t("Nom de l'aliment") }}
            </h5>
            <button type="button" class="btn-close me-1" :aria-label="$t('Close')"
              @click="cancelNutrientChanges"></button>
          </div>
          <div class="modal-body">
            <form class="container-fluid">
              <div class="row g-3">
                <div class="col-md-12 col-lg-6 form-floating">
                  <input type="text" class="form-control" v-model="currentNutrient.name"
                    :placeholder="currentNutrient.name" id="nutrient-name" :aria-label="$t('Nom de l\'aliment')"
                    @focus="handleInputFocus" @keydown.enter.prevent="handleInputEnter" />
                  <label class="ms-2" for="nutrient-name">{{ $t("Nom de l'aliment") }}</label>
                </div>
                <div class="col col-lg-3 form-floating">
                  <input type="number" pattern="[0-9]*" inputmode="decimal" class="form-control"
                    v-model="currentNutrient.quantity" :placeholder="currentNutrient.quantity?.toString() || '0'"
                    id="nutrient-quantity" :aria-label="$t('Quantité')" @focus="handleInputFocus"
                    @keydown.enter.prevent="handleInputEnter" />
                  <label class="ms-2" for="nutrient-quantity">{{ $t('Quantité') }}</label>
                </div>
                <div class="col col-lg-3 form-floating mb-3 lg">
                  <input type="number" pattern="[0-9]*" inputmode="decimal" class="form-control"
                    v-model="currentNutrient.factor" :placeholder="currentNutrient.factor?.toString() || '0'"
                    id="nutrient-factor" :aria-label="$t('Facteur')" @focus="handleInputFocus"
                    @keydown.enter.prevent="handleInputEnter" />
                  <label class="ms-2" for="nutrient-factor">{{ $t('Facteur') }}</label>
                </div>
              </div>
              <hr class="d-lg-none my-2 text-white-50" />
              <div class="row">
                <div class="col">
                  <p>
                    {{ $t('Subtotal') }} :
                    {{ (currentNutrient.quantity * currentNutrient.factor).toFixed(2) }}
                  </p>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="saveNutrient">
              {{ $t('Save Changes') }}
            </button>
            <button type="button" class="btn btn-secondary" @click="cancelNutrientChanges">
              {{ $t('Close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
