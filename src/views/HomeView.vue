<script setup lang="ts">
import MealCalculator from "@/components/MealCalculator.vue";
</script>

<template>
  <div class="container text-light">
    <h1 class="text-light">{{ $t("Calculateur") }}</h1>
    <p>{{ $t("Experimental") }}</p>
    <MealCalculator />
  </div>
</template>
