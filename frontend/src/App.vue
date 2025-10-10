<template>
  <div id="app">
    <app-header v-if="user" :user="user" @log-out="logOut" />

    <!-- telas públicas -->
    <sign-in v-if="!user" @log-in="handleLogIn" />
    <sign-up v-if="!user" @log-in="handleLogIn" />

    <!-- telas privadas (cada uma se auto-ativa pelo hash) -->
    <movie-list-screen v-if="user" :isStaff="user.is_staff" />
    <movie-session-list-screen v-if="user" :isStaff="user.is_staff" />
    <cinema-hall-list-screen v-if="user" :isStaff="user.is_staff" />
    <genre-list-screen v-if="user" :isStaff="user.is_staff" />
    <actor-list-screen v-if="user" :isStaff="user.is_staff" />
    <movie-details-screen v-if="user" />
    <movie-session-details-screen v-if="user" :user="user" />
    <movie-add-screen v-if="user" :isStaff="user.is_staff" />
    <movie-session-add-screen v-if="user" :isStaff="user.is_staff" />
    <cinema-hall-add-screen v-if="user" :isStaff="user.is_staff" />
    <order-list-screen v-if="user" />
    <profile-screen v-if="user" :user="user" />

    <app-footer v-if="user" />
  </div>
</template>

<script>
import jwtDecode from 'jwt-decode'

import SignIn from './views/SignIn.vue'
import SignUp from './views/SignUp.vue'
import AppHeader from './views/AppHeader.vue'
import AppFooter from './views/AppFooter.vue'

import MovieListScreen from './views/MovieListScreen.vue'
import MovieDetailsScreen from './views/MovieDetailsScreen.vue'
import MovieAddScreen from './views/MovieAddScreen.vue'

import MovieSessionListScreen from './views/MovieSessionListScreen.vue'
import MovieSessionAddScreen from './views/MovieSessionAddScreen.vue'
import MovieSessionDetailsScreen from './views/MovieSessionDetailsScreen.vue'

import CinemaHallListScreen from './views/CinemaHallListScreen.vue'
import CinemaHallAddScreen from './views/CinemaHallAddScreen.vue'

import GenreListScreen from './views/GenreListScreen.vue'
import ActorListScreen from './views/ActorListScreen.vue'

import OrderListScreen from './views/OrderListScreen.vue'
import ProfileScreen from './views/ProfileScreen.vue'

// 👇 use as chamadas centralizadas
import { fetchMe, refreshToken as apiRefresh } from './api'

export default {
  components: {
    SignIn,
    SignUp,
    AppHeader,
    AppFooter,
    MovieListScreen,
    MovieDetailsScreen,
    MovieAddScreen,
    MovieSessionListScreen,
    MovieSessionAddScreen,
    MovieSessionDetailsScreen,
    CinemaHallListScreen,
    CinemaHallAddScreen,
    GenreListScreen,
    ActorListScreen,
    OrderListScreen,
    ProfileScreen
  },

  data: () => ({
    user: null,
    expiresAt: null // epoch (segundos)
  }),

  methods: {
    async handleLogIn () {
      // chamado pelo SignIn/SignUp após salvar tokens no localStorage
      await this.logIn()
      // opcional: leve para uma rota logada
      if (!location.hash || location.hash === '#/' || location.hash === '#/sign-in') {
        location.hash = '#/profile'
      }
    },

    async logIn () {
      const access = localStorage.getItem('access')
      if (!access) return

      try {
        const { exp } = jwtDecode(access)
        this.expiresAt = exp
      } catch {
        this.logOut()
        return
      }

      // Se o token ainda está válido, busca o usuário; senão tenta renovar
      if (this.expiresAt * 1000 > Date.now()) {
        await this.fetchUser()
      } else {
        await this.refreshToken()
      }
    },

    logOut () {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      this.user = null
      // opcional: voltar para login
      location.hash = '#/sign-in'
    },

    async fetchUser () {
      try {
        const me = await fetchMe()   // GET /api/user/me/
        this.user = me
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[me] error:', err?.response?.data || err?.message)
        this.logOut()
      }
    },

    async refreshToken () {
      const refresh = localStorage.getItem('refresh')
      if (!refresh) {
        this.logOut()
        return
      }

      try {
        // POST /api/user/token/refresh/
        const data = await apiRefresh(refresh)

        if (data?.access) {
          localStorage.setItem('access', data.access)
          if (data?.refresh) localStorage.setItem('refresh', data.refresh)

          const { exp } = jwtDecode(data.access)
          this.expiresAt = exp

          await this.fetchUser()
          return
        }

        this.logOut()
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[refresh] error:', err?.response?.data || err?.message)
        this.logOut()
      }
    }
  },

  created () {
    // tenta autenticar ao carregar
    this.logIn()

    // checagem periódica para renovar o access antes de expirar
    setInterval(() => {
      if (!this.expiresAt) return
      const willExpire = this.expiresAt * 1000 <= Date.now() + 30_000 // 30s de margem
      if (willExpire) this.refreshToken()
    }, 60 * 1000)
  }
}
</script>

<style scoped>
#app > *:not(:last-child):not(:first-child) { padding: 60px 100px; }
#app > *:last-child { padding-bottom: 40px; }
#app .sign-in { padding: 0; }
</style>
