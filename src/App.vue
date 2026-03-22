<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import BaseTopBar from '@/components/base/BaseTopBar.vue'
import BaseBottomNav from '@/components/base/BaseBottomNav.vue'
import BaseSideRail from '@/components/base/BaseSideRail.vue'
import ReloadPrompt from '@/components/base/ReloadPrompt.vue'
import DatabaseErrorNotification from './components/base/DatabaseErrorNotification.vue'
import DatasetUpdateManager from './components/base/DatasetUpdateManager.vue'
import ToastContainer from '@/components/base/ToastContainer.vue'
import { useNutrientFileStore } from '@/stores/nutrientsFile'

const nutrientStore = useNutrientFileStore()

onMounted(() => {
  // Dismiss the inline HTML splash now that the app shell has painted
  document.body.classList.add('app-mounted')

  // Kick off background data loading after the shell is interactive.
  // loadInitialData reads from IndexedDB (fast) or downloads shards (first load).
  // It is fire-and-forget; the store exposes isLoadingDataset / loadProgress
  // for any component that wants to show progress.
  nutrientStore.loadInitialData()
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Desktop: Side Rail -->
    <BaseSideRail />

    <!-- Mobile: Top Bar -->
    <BaseTopBar />

    <!-- Main Content -->
    <main
      id="content"
      class="min-h-screen transition-all duration-300"
      :class="[
        'lg:ml-24', // Desktop: Add left margin for side rail
        'pt-14 lg:pt-0', // Mobile: Add top padding for top bar
        'pb-20 lg:pb-4' // Mobile: Add bottom padding for bottom nav
      ]"
    >
      <div class="container mx-auto px-4 py-3">
        <!-- KeepAlive preserves component instances for stateful views (active session,
             active filters) across navigation, avoiding costly re-mounts. -->
        <RouterView v-slot="{ Component }">
          <KeepAlive :include="['CalculatorView', 'MealHistoryView']">
            <component :is="Component" />
          </KeepAlive>
        </RouterView>
      </div>
    </main>

    <!-- Mobile: Bottom Navigation -->
    <BaseBottomNav />

    <!-- Global Components -->
    <ReloadPrompt />
    <DatabaseErrorNotification />
    <DatasetUpdateManager />
    <ToastContainer />
  </div>
</template>

<style scoped>
/* Ensure smooth transitions */
#app {
  transition: background-color 150ms ease-in-out;
}
</style>
