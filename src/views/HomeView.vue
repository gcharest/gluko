<script setup lang="ts">
import MealCalculator from "../components/MealCalculator.vue";
</script>

<template>
  <main class="bd-main container">
    <h1 class="text-light">{{ $t("Calculateur") }}</h1>
    <MealCalculator></MealCalculator>
  </main>
</template>
