<script setup lang="ts">
import { ref, type PropType, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Nutrient } from '@/stores/meal'
import type { SearchResult } from '@/stores/nutrientsFile'
import { useMealStore } from '@/stores/meal'
import { Modal } from 'bootstrap'
import NutrientSearch from '@/components/search/NutrientSearch.vue'

const { locale } = useI18n()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nutrient: { type: Object as PropType<Nutrient>, required: true }
})

const emit = defineEmits(['update:modelValue', 'cancelNutrientChanges'])
const mealStore = useMealStore()
const modalRef = ref<HTMLElement | null>(null)
let bsModal: Modal | null = null

let previousActiveElement: HTMLElement | null = null

// Store event handlers separately for cleanup
const eventHandlers = {
  handleHiding: () => {
    // Move focus before animation starts
    if (previousActiveElement && 'focus' in previousActiveElement) {
      try {
        ;(previousActiveElement as HTMLElement).focus()
      } catch (e) {
        console.warn('Failed to focus on previous element:', e)
        // Fallback if the element is no longer focusable
        const modifyButton = document.querySelector(
          `[data-nutrient-id="${props.nutrient.id}"]`
        ) as HTMLButtonElement | null
        modifyButton?.focus()
      }
    }
  },
  handleHidden: () => {
    emit('update:modelValue', false)
    document.removeEventListener('keydown', handleGlobalKeydown)
    previousActiveElement = null
  },
  handleShown: () => {
    document.addEventListener('keydown', handleGlobalKeydown)
    // Store the previously focused element
    previousActiveElement = document.activeElement as HTMLElement
    // Focus the first input when modal is shown
    const firstInput = modalRef.value?.querySelector('input')
    if (firstInput) {
      firstInput.focus()
    }
  }
}

// Handle Enter key press globally when modal is open
function handleGlobalKeydown(event: KeyboardEvent) {
  // Only handle Enter key
  if (event.key !== 'Enter') return

  // Don't trigger if user is typing in an input field
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    event.target instanceof HTMLSelectElement
  ) {
    return
  }

  // Don't trigger if user is holding modifier keys
  if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) return

  event.preventDefault()
  saveNutrient()
}

const currentNutrient = ref<Nutrient>({
  id: crypto.randomUUID(),
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
  // Ensure keyboard listener is removed
  document.removeEventListener('keydown', handleGlobalKeydown)
  if (bsModal) {
    bsModal.dispose()
  }
})

// Watch for v-model changes
// Watch for v-model changes to show/hide modal
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

// Watch for nutrient changes to update local state
watch(
  () => props.nutrient,
  (newVal) => {
    if (newVal) {
      // Deep clone the nutrient, preserving the ID for existing nutrients
      currentNutrient.value = JSON.parse(JSON.stringify(newVal))
    }
  },
  { immediate: true }
)

async function saveNutrient() {
  try {
    if (!props.nutrient.id) {
      // For new nutrients
      await mealStore.addNutrient(currentNutrient.value)
    } else {
      // For existing nutrients
      await mealStore.updateNutrient(currentNutrient.value)
    }
    emit('update:modelValue', false)
  } catch (err) {
    console.error('Failed to save nutrient:', err)
  }
}

function cancelNutrientChanges() {
  currentNutrient.value = JSON.parse(JSON.stringify(props.nutrient))
  emit('cancelNutrientChanges')
  emit('update:modelValue', false)
  // Modal hiding will be handled by the hide event handler
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

function handleNutrientSelect(result: SearchResult) {
  currentNutrient.value.name = result.item[`FoodDescription${locale.value === 'fr' ? 'F' : ''}`]
  currentNutrient.value.factor =
    result.item.FctGluc !== null ? result.item.FctGluc : result.item['205'] / 100

  // Focus quantity field after selection
  const quantityInput = document.getElementById('nutrient-quantity') as HTMLInputElement | null
  quantityInput?.focus()
}
</script>

<template>
  <Teleport to="body">
    <div
      ref="modalRef"
      class="modal modal-lg fade"
      tabindex="-1"
      aria-labelledby="nutrient-modal-title"
      :inert="!modelValue"
    >
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="nutrient-modal-title" class="modal-title display-6">
              {{ currentNutrient.name || $t('components.nutrientModal.fields.name') }}
            </h2>
            <button
              type="button"
              class="btn-close me-1"
              :aria-label="$t('components.nutrientModal.actions.close')"
              @click="cancelNutrientChanges"
            ></button>
          </div>
          <div class="modal-body">
            <form class="container-fluid">
              <!-- Search Section -->
              <div class="mb-4">
                <label for="searchInput" class="form-label">{{
                  $t('components.nutrientModal.search.label')
                }}</label>
                <NutrientSearch
                  :auto-search="false"
                  :clear-after-select="true"
                  :show-source-links="false"
                  :compact-results="true"
                  :search-button-label="$t('components.nutrientModal.search.button')"
                  :placeholder="$t('components.nutrientModal.search.placeholder')"
                  @select="handleNutrientSelect"
                />
                <small class="form-text text-muted">
                  {{ $t('components.nutrientModal.search.helper') }}
                </small>
              </div>
              <div class="row g-3">
                <div class="col-md-12 col-lg-6 form-floating">
                  <input
                    id="nutrient-name"
                    v-model="currentNutrient.name"
                    type="text"
                    class="form-control"
                    :placeholder="currentNutrient.name"
                    :aria-label="$t('components.nutrientModal.fields.name')"
                    @focus="handleInputFocus"
                    @keydown.enter.prevent="handleInputEnter"
                  />
                  <label class="ms-2" for="nutrient-name">{{
                    $t('components.nutrientModal.fields.name')
                  }}</label>
                </div>
                <div class="col col-lg-3 form-floating">
                  <input
                    id="nutrient-quantity"
                    v-model.number="currentNutrient.quantity"
                    type="number"
                    pattern="[0-9]*"
                    inputmode="decimal"
                    class="form-control"
                    :placeholder="currentNutrient.quantity?.toString() || '0'"
                    :aria-label="$t('components.nutrientModal.fields.quantity')"
                    @focus="handleInputFocus"
                    @keydown.enter.prevent="handleInputEnter"
                  />
                  <label class="ms-2" for="nutrient-quantity">
                    {{ $t('components.nutrientModal.fields.quantity') }}
                  </label>
                </div>
                <div class="col col-lg-3 form-floating">
                  <input
                    id="nutrient-factor"
                    v-model.number="currentNutrient.factor"
                    type="number"
                    pattern="[0-9]*"
                    inputmode="decimal"
                    class="form-control"
                    :placeholder="currentNutrient.factor?.toString() || '0'"
                    :aria-label="$t('components.nutrientModal.fields.factor')"
                    @focus="handleInputFocus"
                    @keydown.enter.prevent="handleInputEnter"
                  />
                  <label class="ms-2" for="nutrient-factor">
                    {{ $t('components.nutrientModal.fields.factor') }}
                  </label>
                </div>
              </div>
              <hr class="d-lg-none my-2 text-white-50" />
              <div class="row">
                <div class="col">
                  <p>
                    {{ $t('common.labels.subtotal') }} :
                    {{ (currentNutrient.quantity * currentNutrient.factor).toFixed(2) }}
                  </p>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="saveNutrient">
              {{ $t('components.nutrientModal.actions.save') }}
            </button>
            <button type="button" class="btn btn-secondary" @click="cancelNutrientChanges">
              {{ $t('components.nutrientModal.actions.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
