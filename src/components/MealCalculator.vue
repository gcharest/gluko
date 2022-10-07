<script setup lang="ts">
import NutrientModal from "./NutrientModal.vue";
import { useMealStore } from "@/stores/meal";
const store = useMealStore();
const generateUUID = () => {
  return Number.parseInt(crypto.randomUUID());
};
</script>

<template>
  <div v-for="(nutrient, index) in store.nutrients" :key="nutrient.name">
    <div
      class="card bg-dark border-light mb-3 w-80 translate-middle-x start-50"
    >
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
            <p>{{ nutrient.quantity * nutrient.factor }} g</p>
          </div>
          <div class="col-4 text-end">
            <div class="row">
              <NutrientModal
                v-bind:nutrient-name="nutrient.name"
                :nutrient-index="index"
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
  </div>
  <form class="position-sticky bottom-0">
    <div class="card bg-dark border-2 border-light p-2">
      <div class="row">
        <div class="card-body">
          <h2 class="card-title text-light">
            {{ $t("message") }}: {{ Math.round(store.mealCarbs * 100) / 100 }} g
          </h2>
        </div>
      </div>

      <div class="col">
        <button
          type="button"
          class="btn btn-primary m-2"
          @click="
            store.addNutrient({
              id: generateUUID(),
              name: 'Aliment ' + (store.nutrients.length + 1),
              quantity: 0,
              factor: 0,
            })
          "
        >
          {{ $t("Ajouter un aliment") }}
        </button>
        <button
          type="button"
          class="btn btn-secondary m-2"
          @click="store.resetMeal"
        >
          {{ $t("Reset") }}
        </button>
      </div>
    </div>
  </form>
</template>
