import { createRouter, createWebHistory } from 'vue-router'
import ShopsView from '../views/ShopsView.vue'
import HomeView from '../views/HomeView.vue'
import IndexView from '../views/IndexView.vue'
import ProductsView from '../views/ProductsView.vue'
import LoginView from '../views/LoginView.vue'
import SignUpView from '../views/SignUpView.vue'
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/shops',
      name: 'shops',
      component: ShopsView
    },
    {
      path: '/index',
      name: 'index',
      component: IndexView
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard to protect profile route
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
    } else {
      // Token exists, allow navigation (session validation happens in main.js)
      next()
    }
  } else {
    next()
  }
})

export default router
