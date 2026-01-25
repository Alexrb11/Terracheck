import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Rutas públicas
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false, guestOnly: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresAuth: false, guestOnly: true }
    },
    // Rutas protegidas
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/terrarium/:id',
      name: 'terrarium-detail',
      component: () => import('@/views/TerrariumDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/add',
      name: 'add-terrarium',
      component: () => import('@/views/AddTerrariumView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/species',
      name: 'species',
      component: () => import('@/views/SpeciesListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/my-animals',
      name: 'my-animals',
      component: () => import('@/views/MyAnimalsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/my-animals/:id',
      name: 'animal-detail',
      component: () => import('@/views/AnimalDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAuth: true }
    },
    // Ruta 404
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Navigation Guard
router.beforeEach(async (to, _from, next) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

  // Si la ruta requiere autenticación y no hay token
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
    return
  }

  // Si es una ruta solo para invitados (login/register) y ya está autenticado
  if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  // Si la ruta requiere admin, verificar rol
  if (to.meta.requiresAdmin && isAuthenticated) {
    // Importar dinámicamente para evitar circular dependency
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    
    // Si el store no tiene usuario, intentar cargar
    if (!authStore.user) {
      await authStore.fetchCurrentUser()
    }
    
    if (!authStore.isAdmin) {
      next({ name: 'dashboard' })
      return
    }
  }

  next()
})

export default router
