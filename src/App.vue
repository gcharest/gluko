<script setup lang="ts">
import { RouterView } from 'vue-router'
import BaseNavigationBar from '@/components/BaseNavigationBar.vue'
import BaseFooter from '@/components/BaseFooter.vue'
import ReloadPrompt from '@/components/ReloadPrompt.vue'
</script>

<template>
  <Teleport to="body">
    <BaseNavigationBar />
    <main id="content" class="flex-shrink-0 mt-3">
      <RouterView />
    </main>
    <BaseFooter />
  </Teleport>
  <ReloadPrompt />
</template>
