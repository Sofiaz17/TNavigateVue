import { createRouter, createWebHistory } from 'vue-router'
import ShopsView from '../views/ShopsView.vue'
import HomeView from '../views/HomeView.vue'
import IndexView from '../views/IndexView.vue'
import ProductsView from '../views/ProductsView.vue'
import LoginView from '../views/LoginView.vue'


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
    // {
    //   path: '/shops',
    //   name: 'shops',
    //   component: ShopsView
    // },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    }
    // {
    //   path: '/signin',
    //   name: 'signin',
    //   component: SignInView
    // }
    // {
    //   path: '/products',
    //   name: 'products',
    //   component: ProductsView
    // },
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
