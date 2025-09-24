<script setup lang="ts">
const emit = defineEmits(['add', 'reset'])
</script>

<template>
  <div class="card-footer">
    <button type="button" class="btn btn-primary m-2" @click="emit('add')">
      {{ $t('components.mealCalculator.actions.addNutrient') }}
    </button>
    <button type="button" class="btn btn-secondary m-2" @click="emit('reset')">
      {{ $t('components.mealCalculator.actions.reset') }}
    </button>
  </div>
</template>
