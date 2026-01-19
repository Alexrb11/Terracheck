import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/terrarium/:id',
      name: 'terrarium-detail',
      component: () => import('@/views/TerrariumDetailView.vue')
    },
    {
      path: '/add',
      name: 'add-terrarium',
      component: () => import('@/views/AddTerrariumView.vue')
    }
  ]
})

export default router
