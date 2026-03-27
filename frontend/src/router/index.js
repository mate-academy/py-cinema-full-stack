import { createRouter, createWebHistory } from 'vue-router'
import MovieListScreen from '../views/MovieListScreen.vue'
import MovieDetailsScreen from '../views/MovieDetailsScreen.vue'
import MovieSessionListScreen from '../views/MovieSessionListScreen.vue'
import MovieSessionDetailsScreen from '../views/MovieSessionDetailsScreen.vue'
import OrderListScreen from '../views/OrderListScreen.vue'
import ProfileScreen from '../views/ProfileScreen.vue'

// Примітка: Якщо у вас ще немає окремих файлів для Login/SignUp,
// можна тимчасово використати ProfileScreen або створити порожні заглушки.
const routes = [
  { path: '/', redirect: '/movies' },
  {
    path: '/movies',
    name: 'movies',
    component: MovieListScreen
  },
  {
    path: '/movies/:id',
    name: 'movie-details',
    component: MovieDetailsScreen,
    props: true
  },
  {
    path: '/sessions',
    name: 'sessions',
    component: MovieSessionListScreen
  },
  {
    path: '/sessions/:id',
    name: 'session-details',
    component: MovieSessionDetailsScreen,
    props: true
  },
  {
    path: '/sign-in',
    name: 'login',
    component: ProfileScreen // Замініть на LoginScreen.vue, коли створите
  },
  {
    path: '/sign-up',
    name: 'signup',
    component: ProfileScreen // Замініть на SignUpScreen.vue, коли створите
  },
  {
    path: '/orders',
    name: 'orders',
    component: OrderListScreen,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileScreen,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation Guard: перевірка токена перед переходом на захищені сторінки
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('access')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/sign-in')
  } else {
    next()
  }
})

export default router
