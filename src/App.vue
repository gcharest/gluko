<script setup lang="ts">
import { RouterView } from 'vue-router'
import BaseNavigationBar from '@/components/base/BaseNavigationBar.vue'
import BaseFooter from '@/components/base/BaseFooter.vue'
import ReloadPrompt from '@/components/base/ReloadPrompt.vue'
import DatabaseErrorNotification from './components/base/DatabaseErrorNotification.vue'
import DatasetUpdateManager from './components/base/DatasetUpdateManager.vue'
import { useDarkMode } from '@/composables/useDarkMode'

const { isDark } = useDarkMode()
</script>

<template>
  <div id="app" :class="{ 'dark': isDark }">
    <Teleport to="body">
      <BaseNavigationBar />
      <main id="content" class="flex-shrink-0 mt-3">
        <RouterView />
      </main>
      <BaseFooter />
    </Teleport>
    <ReloadPrompt />
    <DatabaseErrorNotification />
    <DatasetUpdateManager />
  </div>
</template>
