import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Component } from 'vue'
import {
  HomeIcon,
  CalculatorIcon,
  HistoryIcon,
  SettingsIcon,
  InfoIcon,
  PercentIcon
} from 'lucide-vue-next'

export interface NavigationItem {
  to: string
  label: string
  icon: Component
  showInBottomNav?: boolean
  showInSideRail?: boolean
}

export const useNavigationStore = defineStore('navigation', () => {
  const { t } = useI18n()
  const isSideRailOpen = ref(false)

  // Define navigation items
  const navigationItems = computed<NavigationItem[]>(() => [
    {
      to: '/',
      label: t('navigation.home'),
      icon: HomeIcon,
      showInBottomNav: true,
      showInSideRail: true
    },
    {
      to: '/calculator',
      label: t('components.mealCalculator.title'),
      icon: CalculatorIcon,
      showInBottomNav: true,
      showInSideRail: true
    },
    {
      to: '/history',
      label: t('navigation.history'),
      icon: HistoryIcon,
      showInBottomNav: true,
      showInSideRail: true
    },
    {
      to: '/carb-factor',
      label: t('navigation.carbFactor'),
      icon: PercentIcon,
      showInBottomNav: false,
      showInSideRail: true
    },
    {
      to: '/about',
      label: t('navigation.about'),
      icon: InfoIcon,
      showInBottomNav: false,
      showInSideRail: true
    },
    {
      to: '/settings',
      label: t('navigation.settings'),
      icon: SettingsIcon,
      showInBottomNav: true,
      showInSideRail: true
    }
  ])

  // Filter items for bottom nav (mobile)
  const bottomNavItems = computed(() =>
    navigationItems.value.filter((item) => item.showInBottomNav)
  )

  // Filter items for side rail (desktop)
  const sideRailItems = computed(() => navigationItems.value.filter((item) => item.showInSideRail))

  function toggleSideRail() {
    isSideRailOpen.value = !isSideRailOpen.value
  }

  function closeSideRail() {
    isSideRailOpen.value = false
  }

  function openSideRail() {
    isSideRailOpen.value = true
  }

  return {
    navigationItems,
    bottomNavItems,
    sideRailItems,
    isSideRailOpen,
    toggleSideRail,
    closeSideRail,
    openSideRail
  }
})
