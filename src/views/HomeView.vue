<script setup lang="ts">
import MealCalculator from "@/components/MealCalculator.vue";
</script>

<template>
  <main class="flex-shrink-0">
    <div class="container text-light">
      <h1 class="text-light">{{ $t("Calculateur") }}</h1>
      <p>{{ $t("Experimental") }}</p>
      <MealCalculator />
    </div>
  </main>
</template>
