import { createRouter, createWebHistory } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'

// All route components are lazy-loaded so they are excluded from the initial bundle.
// The SW precaches all chunks, so on cached visits these loads are instant.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/calculator',
      name: 'calculator',
      component: () => import('../views/CalculatorView.vue')
    },
    {
      path: '/carb-factor',
      name: 'carb-factor',
      component: () => import('../views/CarbFactor.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/history',
      name: 'meal-history',
      component: () => import('../views/MealHistoryView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
})

/**
 * Global navigation guard to clear view-related notifications
 * When a user visits a view, clear any notifications that should be cleared on visit
 */
router.afterEach((to) => {
  const notificationStore = useNotificationStore()
  // Clear notifications for the view being visited
  if (to.path) {
    notificationStore.clearNotificationsForView(to.path)
  }
})

export default router
