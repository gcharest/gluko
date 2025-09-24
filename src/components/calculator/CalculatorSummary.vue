<script setup lang="ts">
defineProps<{
  totalCarbs: number
  nutrientCount: number
}>()
</script>

<template>
  <div class="card-body pb-0 pb-md-1 pt-1 pt-md-2">
    <h2 class="card-title">
      {{ $t('components.mealCalculator.totalCarbs') }}:
      {{ (Math.round(totalCarbs * 100) / 100).toFixed(2) }} g
    </h2>
    <p>{{ $t('components.mealCalculator.nutrientCount') }}: {{ nutrientCount }}</p>
  </div>
</template>
