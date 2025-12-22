<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import {
  CalculatorIcon,
  SearchIcon,
  AlertCircleIcon,
  HistoryIcon,
  UsersIcon,
  LanguagesIcon,
  MoonIcon
} from 'lucide-vue-next'

const router = useRouter()

const navigateTo = (route: string) => {
  router.push(route)
}

const features = [
  {
    icon: CalculatorIcon,
    title: 'features.calculator.title',
    description: 'features.calculator.description',
    route: '/calculator'
  },
  {
    icon: SearchIcon,
    title: 'features.search.title',
    description: 'features.search.description',
    route: '/carb-factor'
  },
  {
    icon: HistoryIcon,
    title: 'features.history.title',
    description: 'features.history.description',
    route: '/history'
  },
  {
    icon: UsersIcon,
    title: 'features.multiSubject.title',
    description: 'features.multiSubject.description',
    route: '/history'
  }
]

const additionalFeatures = [
  { icon: LanguagesIcon, text: 'features.bilingual' },
  { icon: MoonIcon, text: 'features.darkMode' }
]
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Gluko</h1>
      <p class="text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
        A web application designed to help individuals and families more accurately calculate the
        carbohydrate content in their meals for better diabetes management.
      </p>

      <!-- Experimental Notice -->
      <div
        class="inline-flex items-center gap-2 px-4 py-2 bg-warning-50 dark:bg-warning-950 text-warning-800 dark:text-warning-200 rounded-lg"
      >
        <AlertCircleIcon class="w-5 h-5" />
        <span class="text-sm font-medium">{{ $t('notices.experimental.title') }}</span>
      </div>
    </div>

    <!-- Main Features Grid -->
    <div class="grid md:grid-cols-2 gap-6 mb-8">
      <BaseCard
        v-for="feature in features"
        :key="feature.route"
        variant="elevated"
        class="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        @click="navigateTo(feature.route)"
      >
        <div class="flex items-start gap-4">
          <div class="p-3 bg-primary-100 dark:bg-primary-950 rounded-lg shrink-0">
            <component :is="feature.icon" class="w-7 h-7 text-primary-700 dark:text-primary-400" />
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {{ $t(feature.title) }}
            </h2>
            <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">
              {{ $t(feature.description) }}
            </p>
            <BaseButton variant="secondary" size="sm" class="w-full">
              {{ $t('common.actions.open') }}
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Additional Features -->
    <BaseCard variant="elevated" class="mb-8">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {{ $t('features.additionalTitle') }}
      </h3>
      <div class="grid sm:grid-cols-2 gap-4">
        <div
          v-for="feature in additionalFeatures"
          :key="feature.text"
          class="flex items-center gap-3"
        >
          <div class="p-2 bg-primary-100 dark:bg-primary-950 rounded-lg">
            <component :is="feature.icon" class="w-5 h-5 text-primary-700 dark:text-primary-400" />
          </div>
          <span class="text-gray-700 dark:text-gray-300">{{ $t(feature.text) }}</span>
        </div>
      </div>
    </BaseCard>

    <!-- Why Gluko Section -->
    <BaseCard variant="elevated">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        {{ $t('features.whyTitle') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-300">
        {{ $t('features.whyDescription') }}
      </p>
    </BaseCard>
  </div>
</template>
