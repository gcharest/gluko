<script setup lang="ts">
import MealCalculator from '@/components/MealCalculator.vue'
</script>

<template>
  <div class="container">
    <h1 class="">{{ $t('calculateur') }}</h1>
    <p>{{ $t('experimental') }}</p>
    <MealCalculator />
  </div>
</template>
