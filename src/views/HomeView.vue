<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { CalculatorIcon, SearchIcon, AlertCircleIcon } from 'lucide-vue-next'

const router = useRouter()

const navigateTo = (route: string) => {
  router.push(route)
}
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        {{ $t('navigation.home') }}
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
        {{ $t('aboutText.para1') }}
      </p>

      <!-- Experimental Notice -->
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-warning-50 dark:bg-warning-950 text-warning-800 dark:text-warning-200 rounded-lg">
        <AlertCircleIcon class="w-5 h-5" />
        <span class="text-sm font-medium">{{ $t('notices.experimental.title') }}</span>
      </div>
    </div>

    <!-- Feature Cards -->
    <div class="grid md:grid-cols-2 gap-6 mb-12">
      <!-- Calculator Card -->
      <BaseCard variant="elevated" class="hover:shadow-lg transition-shadow duration-200">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary-100 dark:bg-primary-950 rounded-lg">
              <CalculatorIcon class="w-6 h-6 text-primary-700 dark:text-primary-400" />
            </div>
            <h2 class="text-2xl font-bold">{{ $t('components.mealCalculator.title') }}</h2>
          </div>
        </template>

        <p class="text-gray-600 dark:text-gray-300 mb-6">
          {{ $t('aboutText.para2') }}
        </p>

        <BaseButton variant="primary" class="w-full" @click="navigateTo('/calculator')">
          {{ $t('components.mealCalculator.title') }}
        </BaseButton>
      </BaseCard>

      <!-- Search Card -->
      <BaseCard variant="elevated" class="hover:shadow-lg transition-shadow duration-200">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary-100 dark:bg-primary-950 rounded-lg">
              <SearchIcon class="w-6 h-6 text-primary-700 dark:text-primary-400" />
            </div>
            <h2 class="text-2xl font-bold">{{ $t('components.search.title') }}</h2>
          </div>
        </template>

        <p class="text-gray-600 dark:text-gray-300 mb-2">
          {{ $t('aboutText.para3') }}
          <a
            :href="$t('aboutText.url')"
            target="_blank"
            rel="noopener"
            class="text-primary-700 dark:text-primary-400 hover:underline"
          >
            {{ $t('aboutText.CNF') }}
          </a>.
        </p>

        <BaseButton variant="secondary" class="w-full mt-4" @click="navigateTo('/carb-factor')">
          {{ $t('navigation.carbFactor') }}
        </BaseButton>
      </BaseCard>
    </div>
  </div>
</template>
