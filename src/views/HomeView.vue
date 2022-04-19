<script setup lang="ts">
import { useMealStore } from "@/stores/meal";
const store = useMealStore();
</script>

<template>
  <main class="bd-main container">
    <h1 class="text-light">{{ $t("Calculateur") }}</h1>
    <form>
      <div
        class="row g-3"
        v-for="(nutrient, index) in store.nutrients"
        :key="nutrient.name"
      >
        <div class="col form-floating mb-3">
          <input
            type="text"
            class="form-control text-black"
            v-model.lazy="nutrient.name"
            :placeholder="nutrient.name"
            :id="'nutrientName' + index"
          />
          <label class="text-dark" :for="'nutrientName' + index">{{
            $t("Nom de l'aliment")
          }}</label>
        </div>
        <div class="col form-floating mb-3">
          <input
            type="text"
            inputmode="decimal"
            class="form-control"
            v-model="nutrient.quantity"
            :placeholder="nutrient.quantity.toString()"
            :id="'nutrientQuantity' + index"
          />
          <label :for="'nutrientQuantity' + index">{{ $t("Quantité") }}</label>
        </div>
        <div class="col form-floating mb-3">
          <input
            type="text"
            class="form-control"
            v-model="nutrient.factor"
            :placeholder="nutrient.factor.toString()"
            :id="'nutrientFactor' + index"
          />
          <label :for="'nutrientFactor' + index">{{ $t("Facteur") }}</label>
        </div>
        <div class="col">
          <button
            v-if="store.nutrients.length > 1"
            type="button"
            class="btn btn-outline-light"
            @click="store.removeNutrient(index)"
          >
            <i class="bi bi-trash3-fill"></i>
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <button
            type="button"
            class="btn btn-primary"
            @click="store.addNutrient({ name: '', quantity: 0, factor: 0 })"
          >
            {{ $t("Ajouter un aliment") }}
          </button>
        </div>
        <div class="col">
          <button
            type="button"
            class="btn btn-secondary"
            @click="store.resetMeal"
          >
            {{ $t("Reset") }}
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col mt-3">
          <h2 class="text-light">
            {{ $t("message") }}: {{ Math.round(store.mealCarbs * 100) / 100 }}
          </h2>
        </div>
      </div>
    </form>
  </main>
</template>
