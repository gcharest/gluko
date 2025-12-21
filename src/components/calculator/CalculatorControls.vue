<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import { PlusIcon, RotateCcwIcon } from 'lucide-vue-next'

const emit = defineEmits(['add', 'reset'])
</script>

<template>
  <div class="p-4 flex gap-3">
    <BaseButton variant="primary" class="flex-1" @click="emit('add')">
      <PlusIcon class="w-5 h-5" />
      {{ $t('components.mealCalculator.actions.addNutrient') }}
    </BaseButton>
    <BaseButton variant="secondary" @click="emit('reset')">
      <RotateCcwIcon class="w-5 h-5" />
      <span class="sr-only">{{ $t('components.mealCalculator.actions.reset') }}</span>
    </BaseButton>
  </div>
</template>
