<script setup lang="ts">
import MealCalculator from '@/components/calculator/MealCalculator.vue'
</script>

<template>
  <div class="container">
    <h1>{{ $t('components.mealCalculator.title') }}</h1>
    <p>{{ $t('notices.experimental.title') }}</p>
    <MealCalculator />
  </div>
</template>
