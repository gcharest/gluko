<script setup lang="ts">
import { ref, type PropType, type Ref, watch } from "vue";
import type { Nutrient } from "@/stores/meal";
import { useMealStore } from "@/stores/meal";
const mealStore = useMealStore();
const props = defineProps({
  nutrient: { type: Object as PropType<Nutrient>, required: true },
});
const emit = defineEmits(["cancelNutrientChanges"]);

const currentNutrient: Ref<Nutrient> = ref({
  id: "",
  name: "",
  quantity: 0,
  factor: 0,
});

if (props.nutrient !== undefined) {
  currentNutrient.value = JSON.parse(JSON.stringify(props.nutrient));
}

watch(
  () => props.nutrient,
  (newVal) => {
    currentNutrient.value = JSON.parse(JSON.stringify(newVal));
  }
);

function resetCurrentNutrient() {
  currentNutrient.value = JSON.parse(JSON.stringify(props.nutrient));
}

function saveNutrient() {
  mealStore.updateNutrient(currentNutrient.value);
}

function cancelNutrientChanges() {
  resetCurrentNutrient();
  emit("cancelNutrientChanges");
}
</script>

<template>
  <Teleport to="body">
    <div
      class="modal modal-fullscreen-md-down fade"
      id="nutrient-modal"
      tabindex="-1"
      aria-labelledby="nutrient-modal"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content bg-dark text-light">
          <div class="modal-header">
            <div class="modal-title display-6">
              {{ currentNutrient.name }}
            </div>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col form-floating">
                <input
                  type="text"
                  class="form-control text-light bg-dark"
                  v-model="currentNutrient.name"
                  :placeholder="currentNutrient.name"
                  id="nutrient-name"
                  onclick="select()"
                />
                <label class="text-light" for="nutrient-name">{{
                  $t("Nom de l'aliment")
                }}</label>
              </div>
              <div class="col form-floating mb-3">
                <input
                  type="number"
                  pattern="[0-9]*"
                  inputmode="decimal"
                  class="form-control text-light bg-dark"
                  v-model="currentNutrient.quantity"
                  :placeholder="
                    currentNutrient.quantity
                      ? currentNutrient.quantity.toString()
                      : '0'
                  "
                  id="nutrient-quantity"
                  onclick="select()"
                />
                <label class="text-light" for="nutrient-quantity">{{
                  $t("Quantité")
                }}</label>
              </div>
              <div class="col form-floating mb-3 lg">
                <input
                  type="number"
                  pattern="[0-9]*"
                  inputmode="decimal"
                  class="form-control text-light bg-dark"
                  v-model="currentNutrient.factor"
                  :placeholder="
                    currentNutrient.quantity
                      ? currentNutrient.quantity.toString()
                      : '0'
                  "
                  id="nutrient-factor"
                  onclick="select()"
                />
                <label for="nutrient-factor">{{ $t("Facteur") }}</label>
              </div>
            </div>
            <hr />
            <div class="row">
              <div class="col">
                <p>
                  {{ $t("Subtotal") }} :
                  {{
                    (currentNutrient.quantity * currentNutrient.factor).toFixed(
                      2
                    )
                  }}
                </p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              @click="cancelNutrientChanges"
            >
              {{ $t("Close") }}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              data-bs-dismiss="modal"
              @click="saveNutrient()"
            >
              {{ $t("Save Changes") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
