<template>
  <div id="app">
    <app-header v-if="user" :user="user" @log-out="logOut"></app-header>
    <sign-in v-if="!user" @log-in="handleLogIn"></sign-in>
    <sign-up v-if="!user" @log-in="handleLogIn"></sign-up>

    <movie-list-screen v-if="user" :isStaff="user.is_staff"></movie-list-screen>
    <movie-session-list-screen v-if="user" :isStaff="user.is_staff"></movie-session-list-screen>
    <cinema-hall-list-screen v-if="user" :isStaff="user.is_staff"></cinema-hall-list-screen>
    <genre-list-screen v-if="user" :isStaff="user.is_staff"></genre-list-screen>
    <actor-list-screen v-if="user" :isStaff="user.is_staff"></actor-list-screen>
    <movie-details-screen v-if="user"></movie-details-screen>
    <movie-session-details-screen v-if="user" :user="user"></movie-session-details-screen>
    <movie-add-screen v-if="user" :isStaff="user.is_staff"></movie-add-screen>
    <movie-session-add-screen v-if="user" :isStaff="user.is_staff"></movie-session-add-screen>
    <cinema-hall-add-screen v-if="user" :isStaff="user.is_staff"></cinema-hall-add-screen>
    <order-list-screen v-if="user"></order-list-screen>
    <profile-screen v-if="user" :user="user"></profile-screen>
    <app-footer v-if="user"></app-footer>
  </div>
</template>

<script>
import axios from 'axios';
import jwtDecode from 'jwt-decode';

import SignIn from './views/SignIn.vue';
import SignUp from './views/SignUp.vue';
import AppHeader from './views/AppHeader.vue';
import AppFooter from './views/AppFooter.vue';
import MovieListScreen from './views/MovieListScreen.vue';
import MovieDetailsScreen from './views/MovieDetailsScreen.vue';
import MovieAddScreen from './views/MovieAddScreen.vue';
import MovieSessionListScreen from './views/MovieSessionListScreen.vue';
import MovieSessionAddScreen from './views/MovieSessionAddScreen.vue';
import CinemaHallListScreen from './views/CinemaHallListScreen.vue';
import CinemaHallAddScreen from './views/CinemaHallAddScreen.vue';
import GenreListScreen from './views/GenreListScreen.vue';
import ActorListScreen from './views/ActorListScreen.vue';
import MovieSessionDetailsScreen from './views/MovieSessionDetailsScreen.vue';
import OrderListScreen from './views/OrderListScreen.vue';
import ProfileScreen from './views/ProfileScreen.vue';

export default {
  data: () => ({
    expiresAt: null,
    user: null
  }),
  methods: {
    async logIn() {
      const accessToken = localStorage.getItem('access');
      if (!accessToken) return;

      try {
        const { exp } = jwtDecode(accessToken);
        this.expiresAt = exp;

        if (this.expiresAt * 1000 > Date.now()) {
          await this.fetchUser();
          return;
        }

        await this.refreshToken();
      } catch (err) {
        console.error('Invalid access token', err);
        this.user = null;
      }
    },

    async handleLogIn() {
      await this.logIn();
      location.hash = '#/';
    },

    logOut() {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      this.user = null;
    },

    async fetchUser() {
      const accessToken = localStorage.getItem('access');
      if (!accessToken) return;

      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/me/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true
        });

        this.user = data;
      } catch (err) {
        console.error('Fetch user failed', err.response?.data || err);
        this.user = null;
      }
    },

    async refreshToken() {
      const refreshToken = localStorage.getItem('refresh');
      if (!refreshToken) return;

      try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/token/refresh/`,
          { refresh: refreshToken },
          { withCredentials: true }
        );

        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        await this.logIn();
      } catch (err) {
        console.error('Refresh token failed', err.response?.data || err);
        this.user = null;
      }
    }
  },
  created() {
    this.logIn();

    setInterval(async () => {
      if (!this.expiresAt || this.expiresAt * 1000 <= Date.now()) {
        await this.refreshToken();
      }
    }, 60 * 1000);
  },
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
    CinemaHallListScreen,
    CinemaHallAddScreen,
    GenreListScreen,
    ActorListScreen,
    MovieSessionDetailsScreen,
    OrderListScreen,
    ProfileScreen
  }
};
</script>

<style scoped>
#app > *:not(:last-child):not(:first-child) {
  padding: 60px 100px;
}
#app > *:last-child {
  padding-bottom: 40px;
}
#app .sign-in {
  padding: 0;
}
</style>
