<script setup lang="ts">
import MealCalculator from "../components/MealCalculator.vue";
</script>

<template>
  <main class="flex-shrink-0">
    <div class="container">
      <h1 class="text-light">{{ $t("Calculateur") }}</h1>
      <MealCalculator></MealCalculator>
    </div>
  </main>
</template>
