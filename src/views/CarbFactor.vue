<script setup lang="ts">
import NutrientSearch from '@/components/search/NutrientSearch.vue'
import { PercentIcon, AlertCircleIcon } from 'lucide-vue-next'
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="p-3 bg-primary-100 dark:bg-primary-950 rounded-lg">
          <PercentIcon class="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          {{ $t('navigation.carbFactor') }}
        </h1>
      </div>

      <!-- Experimental Notice -->
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-warning-50 dark:bg-warning-950 text-warning-800 dark:text-warning-200 rounded-lg">
        <AlertCircleIcon class="w-5 h-5" />
        <span class="text-sm font-medium">{{ $t('notices.experimental.title') }}</span>
      </div>
    </div>

    <!-- Search Component -->
    <NutrientSearch />
  </div>
</template>
