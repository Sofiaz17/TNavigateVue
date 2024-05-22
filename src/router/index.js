import { createRouter, createWebHistory } from 'vue-router'
import ShopsView from '../views/ShopsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/shops',
      name: 'home',
      component: ShopsView
    },
    // {
    //   path: '/login',
    //   name: 'login',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/LoginView.vue')
    // },
    // {
    //   path: '/signup',
    //   name: 'signup',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/SignupView.vue')
    // }
  ]
})

export default router
