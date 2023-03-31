<script setup lang="ts">
import NutrientModal from "./NutrientModal.vue";
import { useMealStore } from "@/stores/meal";
const store = useMealStore();
defineProps({
  nutrient: { type: Object, required: true },
  index: { type: Number, required: true },
  saveNutrient: { type: Function, required: true },
});
defineEmits(["removeNutrient"]);
</script>
<template>
  <div class="card bg-dark border-light mb-3 w-80 translate-middle-x start-50">
    <div class="card-header text-light border-light">
      {{
        nutrient.name === ""
          ? $t("Nutrient") + " " + (index + 1)
          : nutrient.name
      }}
    </div>
    <div class="card-body text-light">
      <div class="row gx-5">
        <div class="col-8">
          <p>{{ $t("Subtotal") }}:</p>
          <p>{{ (nutrient.quantity * nutrient.factor).toFixed(2) }} g</p>
        </div>
        <div class="col-4 text-end">
          <div class="row">
            <NutrientModal
              v-bind:nutrient-name="nutrient.name"
              :nutrient="nutrient"
              :index="index"
              :saveNutrient="saveNutrient"
            ></NutrientModal>
            <div class="row">
              <button
                v-if="store.nutrients.length > 1"
                type="button"
                class="btn btn-secondary p-lg-2 lg-3 m-2 mx-3"
                @click="store.removeNutrient(index)"
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
