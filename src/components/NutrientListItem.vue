<script setup lang="ts">
import type { PropType } from 'vue'
import { useMealStore, type Nutrient } from '@/stores/meal'
const mealStore = useMealStore()
const props = defineProps({
  nutrient: { type: Object as PropType<Nutrient>, required: true },
  index: { type: Number, required: true }
})
const emit = defineEmits(['modifyCurrentNutrient'])

const removeNutrient = () => {
  mealStore.removeNutrient(props.nutrient)
}
</script>
<template>
  <div class="card mb-3">
    <div class="card-header">
      {{ props.index + 1 }} :
      {{ props.nutrient.name === '' ? $t('Nutrient') : props.nutrient.name }}
    </div>
    <div class="card-body p-2">
      <div class="row gx-5">
        <div class="col-6 col-lg-3 text-center mb-1 mb-lg-0 mt-md-3">
          <p class="mb-1">{{ $t('Quantité') }}:</p>
          <p class="mb-1 mb-md-3">{{ props.nutrient.quantity }} g</p>
        </div>
        <div class="col-6 col-lg-3 text-center mb-1 mb-lg-0 mt-md-3">
          <p class="mb-1">{{ $t('Facteur') }}:</p>

          <p class="mb-1 mb-md-3">{{ props.nutrient.factor }}</p>
        </div>
        <div class="d-lg-none">
          <hr class="d-lg-none my-2 w-80 text-white-50" />
        </div>
        <div class="col-md-12 col-lg-2 text-center mb-1 mb-md-0 mt-md-3">
          <p class="mb-1">{{ $t('Subtotal') }}:</p>
          <p class="mb-1 mb-md-3">
            {{ (props.nutrient.quantity * props.nutrient.factor).toFixed(2) }}
            g
          </p>
        </div>
        <div class="col-12 col-lg-3">
          <div class="row">
            <div class="col-lg-12 col-6 text-center mb-1">
              <button
                :class="mealStore.mealNutrients.length <= 1 ? 'disabled' : ''"
                type="button"
                class="btn btn-secondary w-100 py-1 py-md-2"
                @click="removeNutrient"
              >
                <i class="bi bi-trash3-fill"></i>
              </button>
            </div>
            <div class="col-lg-12 col-6 text-center">
              <button
                type="button"
                class="btn btn-primary w-100 py-1 py-md-2"
                @click="emit('modifyCurrentNutrient', props.nutrient.id)"
              >
                {{ $t('Modify') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
