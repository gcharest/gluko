<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import NutrientList from '@/components/nutrients/NutrientList.vue'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useMealStore } from '@/stores/meal'
import { useMealHistoryStore } from '@/stores/mealHistory'
import type { Nutrient } from '@/types/meal-history'
import { BookPlusIcon } from 'lucide-vue-next'

const store = useMealStore()
const showResetConfirmation = ref(false)

onBeforeMount(async () => {
  if (store.nutrientEmpty) {
    await store.addEmptyNutrient()
  }
})

async function handleResetConfirm() {
  await store.clearSession()
  await store.addEmptyNutrient()
  showResetConfirmation.value = false
}

function handleReset() {
  showResetConfirmation.value = true
}

async function handleAdd() {
  await store.addEmptyNutrient()
}

async function handleSaveToHistory() {
  const mealHistoryStore = useMealHistoryStore()
  const totalCarbs = store.currentNutrients.reduce((total: number, nutrient: Nutrient) => {
    return total + nutrient.quantity * nutrient.factor
  }, 0)

  await mealHistoryStore.addEntry(store.currentNutrients, totalCarbs, {
    tags: []
  })

  // Clear the calculator after saving
  await store.clearSession()
  await store.addEmptyNutrient()
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <NutrientList :nutrients="store.currentNutrients" @add="handleAdd" @reset="handleReset" />

    <!-- Save to history button -->
    <BaseButton
      variant="primary"
      class="w-full"
      :disabled="
        !store.currentNutrients.length || store.currentNutrients.every((n: Nutrient) => !n.quantity)
      "
      @click="handleSaveToHistory"
    >
      <BookPlusIcon class="w-5 h-5 mr-2" />
      {{ $t('components.mealCalculator.actions.saveToHistory') }}
    </BaseButton>
  </div>

  <ConfirmationModal
    v-model="showResetConfirmation"
    :title="$t('modals.confirmation.reset.title')"
    :message="$t('modals.confirmation.reset.message')"
    :confirm-label="$t('modals.confirmation.reset.confirmLabel')"
    :cancel-label="$t('modals.confirmation.reset.cancelLabel')"
    confirm-variant="danger"
    @confirm="handleResetConfirm"
  />
</template>
