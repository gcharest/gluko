<script setup lang="ts">
import { ref, type PropType, type Ref, watch } from 'vue'
import type { Nutrient } from '@/stores/meal'
import { useMealStore } from '@/stores/meal'
const mealStore = useMealStore()
const props = defineProps({
  nutrient: { type: Object as PropType<Nutrient>, required: true }
})
const emit = defineEmits(['cancelNutrientChanges'])

const currentNutrient: Ref<Nutrient> = ref({
  id: '',
  name: '',
  quantity: 0,
  factor: 0
})

if (props.nutrient !== undefined) {
  currentNutrient.value = JSON.parse(JSON.stringify(props.nutrient))
}

watch(
  () => props.nutrient,
  (newVal) => {
    currentNutrient.value = JSON.parse(JSON.stringify(newVal))
  }
)

function resetCurrentNutrient() {
  currentNutrient.value = JSON.parse(JSON.stringify(props.nutrient))
}

function saveNutrient() {
  mealStore.updateNutrient(currentNutrient.value)
}

function cancelNutrientChanges() {
  resetCurrentNutrient()
  emit('cancelNutrientChanges')
}
</script>

<template>
  <Teleport to="body">
    <div
      class="modal modal-lg fade"
      id="nutrient-modal"
      tabindex="-1"
      aria-labelledby="nutrient-modal"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title display-6">
              {{ currentNutrient.name ? currentNutrient.name : $t("Nom de l'aliment") }}
            </div>
            <button
              type="button"
              class="btn-close me-1"
              data-bs-dismiss="modal"
              :aria-label="$t('Close')"
              @click="cancelNutrientChanges"
            ></button>
          </div>
          <div class="modal-body">
            <form class="container-fluid">
              <div class="row g-3">
                <div class="col-md-12 col-lg-6 form-floating">
                  <input
                    type="text"
                    class="form-control"
                    v-model="currentNutrient.name"
                    :placeholder="currentNutrient.name"
                    id="nutrient-name"
                    onclick="select()"
                  />
                  <label class="ms-2" for="nutrient-name">{{ $t("Nom de l'aliment") }}</label>
                </div>
                <div class="col col-lg-3 form-floating">
                  <input
                    type="number"
                    pattern="[0-9]*"
                    inputmode="decimal"
                    class="form-control"
                    v-model="currentNutrient.quantity"
                    :placeholder="
                      currentNutrient.quantity ? currentNutrient.quantity.toString() : '0'
                    "
                    id="nutrient-quantity"
                    onclick="select()"
                  />
                  <label class="ms-2" for="nutrient-quantity">{{ $t('Quantité') }}</label>
                </div>
                <div class="col col-lg-3 form-floating mb-3 lg">
                  <input
                    type="number"
                    pattern="[0-9]*"
                    inputmode="decimal"
                    class="form-control"
                    v-model="currentNutrient.factor"
                    :placeholder="
                      currentNutrient.quantity ? currentNutrient.quantity.toString() : '0'
                    "
                    id="nutrient-factor"
                    onclick="select()"
                  />
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
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              @click="cancelNutrientChanges"
            >
              {{ $t('Close') }}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              data-bs-dismiss="modal"
              @click="saveNutrient()"
            >
              {{ $t('Save Changes') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
