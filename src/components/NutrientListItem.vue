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
  <div class="card bg-dark border-light mb-3 w-80 translate-middle-x start-50">
    <div class="card-header text-light border-light">
      {{ props.nutrient.name === '' ? $t('Nutrient') : props.nutrient.name }}
    </div>
    <div class="card-body text-light">
      <div class="row gx-5">
        <div class="col-md-8">
          <div class="row">
            <div class="col-6 col-md-4">
              <p>{{ $t('Quantité') }}:</p>
              <p>{{ props.nutrient.quantity }} g</p>
            </div>
            <div class="col-6 col-md-4">
              <p>{{ $t('Facteur') }}:</p>
              <p>{{ props.nutrient.factor }}</p>
            </div>
            <hr />
            <div class="col-6 col-md-4">
              <p>{{ $t('Subtotal') }}:</p>
              <p>
                {{ (props.nutrient.quantity * props.nutrient.factor).toFixed(2) }}
                g
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-4 text-end">
          <div class="row">
            <div class="row">
              <button
                type="button"
                class="btn btn-primary p-lg-2 lg-3 m-2 mx-3"
                @click="emit('modifyCurrentNutrient', props.nutrient.id)"
              >
                {{ $t('Modify') }}
              </button>
            </div>
            <div class="row">
              <button
                v-if="mealStore.mealNutrients.length > 1"
                type="button"
                class="btn btn-secondary p-lg-2 lg-3 m-2 mx-3"
                @click="removeNutrient"
              >
                <i class="bi bi-trash3-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
