<script setup lang="ts">
import { RouterView } from 'vue-router'
import BaseTopBar from '@/components/base/BaseTopBar.vue'
import BaseBottomNav from '@/components/base/BaseBottomNav.vue'
import BaseSideRail from '@/components/base/BaseSideRail.vue'
import ReloadPrompt from '@/components/base/ReloadPrompt.vue'
import DatabaseErrorNotification from './components/base/DatabaseErrorNotification.vue'
import DatasetUpdateManager from './components/base/DatasetUpdateManager.vue'
import { useDarkMode } from '@/composables/useDarkMode'

const { isDark } = useDarkMode()
</script>

<template>
  <div id="app" :class="{ 'dark': isDark }" class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Desktop: Side Rail -->
    <BaseSideRail />

    <!-- Mobile: Top Bar -->
    <BaseTopBar />

    <!-- Main Content -->
    <main
      id="content"
      class="min-h-screen transition-all duration-300"
      :class="[
        'lg:ml-20', // Desktop: Add left margin for side rail
        'pt-14 lg:pt-0', // Mobile: Add top padding for top bar
        'pb-20 lg:pb-4', // Mobile: Add bottom padding for bottom nav
      ]"
    >
      <div class="container mx-auto px-4 py-6">
        <RouterView />
      </div>
    </main>

    <!-- Mobile: Bottom Navigation -->
    <BaseBottomNav />

    <!-- Global Components -->
    <ReloadPrompt />
    <DatabaseErrorNotification />
    <DatasetUpdateManager />
  </div>
</template>

<style scoped>
/* Ensure smooth transitions */
#app {
  transition: background-color 150ms ease-in-out;
}
</style>
