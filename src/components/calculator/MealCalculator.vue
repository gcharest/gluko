<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import NutrientList from '@/components/nutrients/NutrientList.vue'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'
import { useMealStore } from '@/stores/meal'
import { useMealHistoryStore } from '@/stores/mealHistory'
import type { Nutrient } from '@/types/meal-history'

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
  <div class="d-flex flex-column gap-3 h-100">
    <div class="flex-grow-1 d-flex flex-column" style="min-height: 0">
      <NutrientList :nutrients="store.currentNutrients" @add="handleAdd" @reset="handleReset" />
    </div>

    <!-- Save to history button -->
    <div class="flex-shrink-0">
      <button
        type="button"
        class="btn btn-primary w-100"
        :disabled="
          !store.currentNutrients.length ||
          store.currentNutrients.every((n: Nutrient) => !n.quantity)
        "
        @click="handleSaveToHistory"
      >
        <i class="bi bi-journal-plus me-1"></i>
        {{ $t('components.mealCalculator.actions.saveToHistory') }}
      </button>
    </div>
  </div>

  <ConfirmationModal
    v-model="showResetConfirmation"
    :title="$t('modals.confirmation.reset.title')"
    :message="$t('modals.confirmation.reset.message')"
    :confirm-label="$t('modals.confirmation.reset.confirmLabel')"
    :cancel-label="$t('modals.confirmation.reset.cancelLabel')"
    confirm-variant="warning"
    @confirm="handleResetConfirm"
  />
</template>
