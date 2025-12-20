<script setup lang="ts">
import { ref } from 'vue'
import type { PropType } from 'vue'
import { useMealStore, type Nutrient } from '@/stores/meal'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { EditIcon, TrashIcon } from 'lucide-vue-next'

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
  <BaseCard
    class="mb-3 animate-fade-in"
    :aria-label="$t('components.nutrientList.item.title', { index: props.index + 1 })"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <span class="font-bold text-primary-700 dark:text-primary-400">{{ props.index + 1 }}:</span>
        <span class="font-medium">{{ props.nutrient.name || $t('common.labels.nutrient') }}</span>
      </div>
    </template>

    <!-- Nutrient Details Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <!-- Quantity -->
      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {{ $t('common.labels.quantity') }}:
        </p>
        <p class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ props.nutrient.quantity }} {{ $t('common.units.grams') }}
        </p>
      </div>

      <!-- Factor -->
      <div class="text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {{ $t('common.labels.factor') }}:
        </p>
        <p class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ props.nutrient.factor }}
        </p>
      </div>

      <!-- Subtotal -->
      <div class="text-center col-span-2 md:col-span-1">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {{ $t('common.labels.subtotal') }}:
        </p>
        <p class="text-lg font-bold text-primary-700 dark:text-primary-400">
          {{ (props.nutrient.quantity * props.nutrient.factor).toFixed(2) }} g
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="col-span-2 md:col-span-1 flex gap-2">
        <BaseButton
          variant="primary"
          class="flex-1"
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
          <EditIcon class="w-4 h-4" />
          <span class="sr-only md:not-sr-only md:ml-2">{{ $t('common.actions.modify') }}</span>
        </BaseButton>
        <BaseButton
          variant="danger"
          :aria-label="
            $t('components.nutrientList.item.removeButton', {
              name: props.nutrient.name || $t('common.labels.nutrient')
            })
          "
          @click="removeNutrient"
        >
          <TrashIcon class="w-4 h-4" />
          <span class="sr-only">{{ $t('common.actions.remove') }}</span>
        </BaseButton>
      </div>
    </div>
  </BaseCard>

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
