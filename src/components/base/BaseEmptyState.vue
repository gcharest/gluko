<template>
  <div class="text-center py-12 px-4">
    <!-- Icon -->
    <div v-if="icon || $slots.icon" class="flex justify-center mb-4">
      <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
        <slot name="icon">
          <component :is="icon" class="w-12 h-12 text-gray-400 dark:text-gray-600" />
        </slot>
      </div>
    </div>

    <!-- Title -->
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {{ title }}
    </h3>

    <!-- Description -->
    <p v-if="description" class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {{ description }}
    </p>

    <!-- Custom content slot -->
    <div v-if="$slots.default" class="mb-6">
      <slot />
    </div>

    <!-- Action button -->
    <div v-if="$slots.action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  title: string
  description?: string
  icon?: Component
}

defineProps<Props>()
</script>
