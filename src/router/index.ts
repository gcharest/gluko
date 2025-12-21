import { createRouter, createWebHistory } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import HomeView from '../views/HomeView.vue'
import CarbFactor from '@/views/CarbFactor.vue'
import CalculatorView from '@/views/CalculatorView.vue'
import MealHistoryView from '@/views/MealHistoryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/calculator',
      name: 'calculator',
      component: CalculatorView
    },
    {
      path: '/carb-factor',
      name: 'carb-factor',
      component: CarbFactor
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/history',
      name: 'meal-history',
      component: MealHistoryView
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
