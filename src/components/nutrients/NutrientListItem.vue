<script setup lang="ts">
import { ref } from 'vue'
import type { PropType } from 'vue'
import { useMealStore, type Nutrient } from '@/stores/meal'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'

const mealStore = useMealStore()
const props = defineProps({
  nutrient: { type: Object as PropType<Nutrient>, required: true },
  index: { type: Number, required: true }
})
const emit = defineEmits(['modifyCurrentNutrient'])

const showDeleteConfirmation = ref(false)

const removeNutrient = () => {
  showDeleteConfirmation.value = true
}

const handleConfirmDelete = () => {
  mealStore.removeNutrient(props.nutrient)
}

// Handle keyboard events for modify button
const handleModifyKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('modifyCurrentNutrient', props.nutrient.id)
  }
}
</script>
<template>
  <div
    class="card mb-3"
    :aria-label="$t('components.nutrientList.item.title', { index: props.index + 1 })"
  >
    <div class="card-header">
      <span class="fw-bold">{{ props.index + 1 }}:</span>
      {{ props.nutrient.name || $t('common.labels.nutrient') }}
    </div>
    <div class="card-body p-2">
      <div class="row gx-5">
        <div class="col-6 col-lg-3 text-center mb-1 mb-lg-0 mt-md-3">
          <p id="quantity-label-{{props.nutrient.id}}" class="mb-1">
            {{ $t('common.labels.quantity') }}:
          </p>
          <p class="mb-1 mb-md-3" aria-labelledby="quantity-label-{{props.nutrient.id}}">
            {{ props.nutrient.quantity }} {{ $t('common.units.grams') }}
          </p>
        </div>
        <div class="col-6 col-lg-3 text-center mb-1 mb-lg-0 mt-md-3">
          <p id="factor-label-{{props.nutrient.id}}" class="mb-1">
            {{ $t('common.labels.factor') }}:
          </p>
          <p class="mb-1 mb-md-3" aria-labelledby="factor-label-{{props.nutrient.id}}">
            {{ props.nutrient.factor }}
          </p>
        </div>
        <div class="d-lg-none">
          <hr class="d-lg-none my-2 w-80" />
        </div>
        <div class="col-md-12 col-lg-2 text-center mb-1 mb-md-0 mt-md-3">
          <p id="subtotal-label-{{props.nutrient.id}}" class="mb-1">
            {{ $t('common.labels.subtotal') }}:
          </p>
          <p class="mb-1 mb-md-3" aria-labelledby="subtotal-label-{{props.nutrient.id}}">
            {{ (props.nutrient.quantity * props.nutrient.factor).toFixed(2) }}
            g
          </p>
        </div>
        <div class="col-12 col-lg-3">
          <div class="row">
            <div class="col-lg-12 col-6 text-center mb-1">
              <button
                type="button"
                class="btn btn-primary w-100 py-1 py-md-2"
                :aria-label="
                  $t('components.nutrientList.item.modifyButton', {
                    name: props.nutrient.name || $t('common.labels.nutrient')
                  })
                "
                tabindex="0"
                :data-nutrient-id="props.nutrient.id"
                @click="emit('modifyCurrentNutrient', props.nutrient.id)"
                @keydown="handleModifyKeydown"
              >
                {{ $t('common.actions.modify') }}
              </button>
            </div>
            <div class="col-lg-12 col-6 text-center">
              <button
                type="button"
                class="btn btn-secondary w-100 py-1 py-md-2"
                :disabled="mealStore.nutrientCount <= 1"
                :aria-label="
                  $t('components.nutrientList.item.removeButton', {
                    name: props.nutrient.name || $t('common.labels.nutrient')
                  })
                "
                @click="removeNutrient"
              >
                <i class="bi bi-trash3-fill" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ConfirmationModal
    v-model="showDeleteConfirmation"
    :title="$t('components.confirmationModal.delete.title')"
    :message="
      $t('components.confirmationModal.delete.message', {
        name: props.nutrient.name || $t('common.labels.nutrient')
      })
    "
    :confirm-label="$t('common.actions.delete')"
    :cancel-label="$t('common.actions.cancel')"
    confirm-variant="danger"
    @confirm="handleConfirmDelete"
  />
</template>
