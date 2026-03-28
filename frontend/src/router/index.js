import { createRouter, createWebHashHistory } from 'vue-router'
import MovieListScreen from '../views/MovieListScreen.vue'
import MovieDetailsScreen from '../views/MovieDetailsScreen.vue'
import MovieSessionListScreen from '../views/MovieSessionListScreen.vue'
import MovieSessionDetailsScreen from '../views/MovieSessionDetailsScreen.vue'
import OrderListScreen from '../views/OrderListScreen.vue'
import ProfileScreen from '../views/ProfileScreen.vue'

// Імпорти для сторінок додавання (адмін-панель)
import AddMovieScreen from '../views/AddMovieScreen.vue'
import AddCinemaHallScreen from '../views/AddCinemaHallScreen.vue'
import AddMovieSessionScreen from '../views/AddMovieSessionScreen.vue'
import CinemaHallListScreen from '../views/CinemaHallListScreen.vue'

const routes = [
  { path: '/', redirect: '/movies' },
  {
    path: '/movies',
    name: 'movies',
    component: MovieListScreen
  },
  {
    path: '/movies/add',
    name: 'add-movie',
    component: AddMovieScreen,
    meta: { requiresAuth: true, requiresStaff: true }
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
    path: '/cinema-halls',
    name: 'cinema-halls',
    component: CinemaHallListScreen,
    meta: { requiresAuth: true, requiresStaff: true }
  },
  {
    path: '/cinema-halls/add',
    name: 'add-cinema-hall',
    component: AddCinemaHallScreen,
    meta: { requiresAuth: true, requiresStaff: true }
  },
  {
    path: '/movie-sessions/add',
    name: 'add-movie-session',
    component: AddMovieSessionScreen,
    meta: { requiresAuth: true, requiresStaff: true }
  },
  {
    path: '/sign-in',
    name: 'login',
    component: ProfileScreen
  },
  {
    path: '/sign-up',
    name: 'signup',
    component: ProfileScreen
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
  // Використовуємо Hash History для надійності
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access')
  const isAuthenticated = !!token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/sign-in')
  } else {
    next()
  }
})

export default router
