<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-30 lg:hidden"
    :class="navClasses"
    :aria-label="$t('navigation.mainNavigation')"
  >
    <div class="flex justify-around items-center h-16 px-2 pb-safe">
      <RouterLink
        v-for="item in bottomNavItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="navItemClasses(item.to)"
        :aria-label="item.label"
      >
        <component :is="item.icon" class="w-6 h-6" />
        <span class="text-xs mt-1 font-medium">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNavigationStore } from '@/stores/navigation'

const route = useRoute()
const navigationStore = useNavigationStore()

const bottomNavItems = computed(() => navigationStore.bottomNavItems)

const navClasses = computed(() => [
  'bg-white dark:bg-gray-900',
  'border-t border-gray-200 dark:border-gray-800',
  'shadow-lg',
])

function navItemClasses(to: string) {
  const isActive = route.path === to
  return [
    'flex flex-col items-center justify-center',
    'flex-1 min-h-[44px]',
    'transition-colors duration-150',
    'rounded-lg mx-1',
    isActive
      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950'
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
  ]
}
</script>

<style scoped>
.pb-safe {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}

.nav-item {
  -webkit-tap-highlight-color: transparent;
}
</style>
