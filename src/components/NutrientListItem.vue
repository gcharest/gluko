<script setup lang="ts">
import type { PropType } from 'vue'
import { useMealStore, type Nutrient } from '@/stores/meal'
const mealStore = useMealStore()
const props = defineProps({
  nutrient: { type: Object as PropType<Nutrient>, required: true }
})
const emit = defineEmits(['modifyCurrentNutrient'])

const removeNutrient = () => {
  mealStore.removeNutrient(props.nutrient)
}
</script>
<template>
  <div class="card w-85 mx-auto mb-3">
    <div class="card-header">
      {{ props.nutrient.name === '' ? $t('Nutrient') : props.nutrient.name }}
    </div>
    <div class="card-body">
      <div class="row gx-5">
        <div class="col-6 col-lg-3 mb-3 mb-lg-0 text-center">
          <p>{{ $t('Quantité') }}:</p>
          <p>{{ props.nutrient.quantity }} g</p>
        </div>
        <div class="col-6 col-lg-3 mb-3 mb-lg-0 text-center">
          <p>{{ $t('Facteur') }}:</p>

          <p>{{ props.nutrient.factor }}</p>
        </div>
        <div class="d-lg-none">
          <hr class="d-lg-none my-2 w-80 text-white-50" />
        </div>
        <div class="col-md-12 col-lg-2 text-center mb-3 mb-md-0">
          <p>{{ $t('Subtotal') }}:</p>
          <p>
            {{ (props.nutrient.quantity * props.nutrient.factor).toFixed(2) }}
            g
          </p>
        </div>
        <div class="col-12 col-lg-3">
          <div class="row">
            <div class="col-lg-12 col-6 text-center mb-3">
              <button
                :class="mealStore.mealNutrients.length <= 1 ? 'disabled' : ''"
                type="button"
                class="btn btn-secondary w-100"
                @click="removeNutrient"
              >
                <i class="bi bi-trash3-fill"></i>
              </button>
            </div>
            <div class="col-lg-12 col-6 text-center">
              <button
                type="button"
                class="btn btn-primary w-100"
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
