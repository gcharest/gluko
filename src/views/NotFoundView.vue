<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { AlertTriangleIcon, HomeIcon } from 'lucide-vue-next'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <BaseCard variant="elevated" class="text-center">
      <!-- Error Icon -->
      <div class="flex justify-center mb-6">
        <div class="p-4 bg-danger-100 dark:bg-danger-950 rounded-full">
          <AlertTriangleIcon class="w-16 h-16 text-danger-600 dark:text-danger-400" />
        </div>
      </div>

      <!-- Error Message -->
      <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">
        {{ $t('errors.notFound.title') }}
      </h1>

      <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
        {{ $t('errors.notFound.message') }}
      </p>

      <!-- Action Button -->
      <BaseButton variant="primary" size="lg" @click="goHome">
        <HomeIcon class="w-5 h-5 mr-2" />
        {{ $t('navigation.home') }}
      </BaseButton>
    </BaseCard>
  </div>
</template>
