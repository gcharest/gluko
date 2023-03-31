<script setup lang="ts">
import { onBeforeMount } from "vue";
import NutrientListItem from "./NutrientListItem.vue";
import { useMealStore } from "@/stores/meal";
const store = useMealStore();
onBeforeMount(() => {
  if (store.nutrients.length === 0) {
    store.$reset();
  }
});
const saveNutrient = (
  id: string,
  name: string,
  quantity: number,
  factor: number
) => {
  store.updateNutrient({
    id: id,
    name: name,
    quantity: quantity,
    factor: factor,
  });
};
const addNutrient = () => {
  const id = crypto.randomUUID();
  store.addNutrient({
    id: id,
    name: "Aliment " + (store.nutrients.length + 1),
    quantity: 0,
    factor: 0,
  });
};
</script>

<template>
  <div v-for="(nutrient, index) in store.nutrients" :key="nutrient.name">
    <NutrientListItem
      :nutrient="nutrient"
      :index="index"
      :saveNutrient="saveNutrient"
    />
  </div>
  <form class="position-sticky bottom-0">
    <div class="card bg-dark border-2 border-light p-2">
      <div class="row">
        <div class="card-body">
          <h2 class="card-title text-light">
            {{ $t("message") }}:
            {{ (Math.round(store.mealCarbs * 100) / 100).toFixed(2) }} g
          </h2>
        </div>
      </div>

      <div class="col">
        <button
          type="button"
          class="btn btn-primary m-2"
          @click="addNutrient()"
        >
          {{ $t("Ajouter un aliment") }}
        </button>
        <button
          type="button"
          class="btn btn-secondary m-2"
          @click="store.$reset"
        >
          {{ $t("Reset") }}
        </button>
      </div>
    </div>
  </form>
</template>
