<script setup lang="ts">
import MealCalculator from '@/components/MealCalculator.vue'
</script>

<template>
  <div class="container">
    <h1 class="">{{ $t('components.mealCalculator.title') }}</h1>
    <p>{{ $t('notices.experimental.display') }}</p>
    <MealCalculator />
  </div>
</template>
