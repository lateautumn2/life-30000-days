import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAppStore } from '@/store'
import Layout from '@/components/Layout.vue'
import HomePage from '@/pages/HomePage.vue'
import IntersectionsPage from '@/pages/IntersectionsPage.vue'
import ConnectionDetail from '@/pages/ConnectionDetail.vue'
import MemosPage from '@/pages/MemosPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import AdminConsole from '@/pages/AdminConsole.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomePage,
        // Home page allows guest access
      },
      {
        path: 'intersections',
        name: 'intersections',
        component: IntersectionsPage,
        meta: { requiresAuth: true }
      },
      {
        path: 'intersections/:id',
        name: 'connection-detail',
        component: ConnectionDetail,
        meta: { requiresAuth: true }
      },
      {
        path: 'memos',
        name: 'memos',
        component: MemosPage,
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminConsole,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const store = useAppStore()
  const isAuthenticated = !!store.token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next('/')
  } else if (to.meta.requiresAdmin && store.user?.role !== 'admin') {
    next('/')
  } else {
    next()
  }
})

export default router
