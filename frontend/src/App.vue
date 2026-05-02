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
    <movie-session-details-screen v-if="user" :user="user" ></movie-session-details-screen>
    <movie-add-screen v-if="user" :isStaff="user.is_staff"></movie-add-screen>
    <movie-session-add-screen v-if="user" :isStaff="user.is_staff"></movie-session-add-screen>
    <cinema-hall-add-screen v-if="user" :isStaff="user.is_staff"></cinema-hall-add-screen>
    <order-list-screen v-if="user"></order-list-screen>
    <profile-screen v-if="user" :user="user"></profile-screen>
    <app-footer v-if="user"></app-footer>
  </div>
</template>

<script>
import jwtDecode from 'jwt-decode';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, setAuthHeader } from './utils/auth.js';

import SignIn from './views/SignIn.vue';
import MovieListScreen from './views/MovieListScreen.vue';
import AppHeader from './views/AppHeader.vue';
import AppFooter from './views/AppFooter.vue';
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
import SignUp from './views/SignUp.vue';

export default {
  data: () => ({
    expiresAt: null,
    user: null,
    type: 'password'
  }),
  methods: {
    async logIn () {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      setAuthHeader(accessToken);

      const { exp } = jwtDecode(accessToken);
      this.expiresAt = exp;

      if (this.expiresAt * 1e3 > Date.now()) {
        await this.fetchUser();
        return;
      }

      this.refreshToken();
    },

    async handleLogIn () {
      await this.logIn();
      location.hash = '#/';
    },

    logOut () {
      clearTokens();
      setAuthHeader(null);

      this.user = null;
    },

    async fetchUser () {
      const accessToken = getAccessToken();

      if (!accessToken) {
        this.user = null;
        return;
      }

      try {
        const { data: user } = await this.axios.get(`${import.meta.env.VITE_API_URL}/api/user/me/`,
          { headers: { Authorization: `Bearer ${accessToken}` } });

        this.user = user;
      } catch (err) {
        console.error(err.response?.data || err);
      }
    },

    async refreshToken () {
      try {
        const { data } = await this.axios.post(`${import.meta.env.VITE_API_URL}/api/user/token/refresh/`, {
          refresh: getRefreshToken()
        });

        const access = data.access || data.accessToken || data.token;
        const refresh = data.refresh || data.refreshToken;

        setTokens(access, refresh);
        setAuthHeader(access);

        this.logIn();
      } catch (err) {
        console.error(err.response?.data || err);
      }
    }
  },
  created () {
    this.logIn();

    setInterval(() => {
      if (!this.user) return;
      if (this.expiresAt && this.expiresAt * 1e3 > Date.now()) return;
      this.refreshToken();
    }, 60 * 1e3);
  },
  components: {
    SignIn,
    MovieListScreen,
    AppHeader,
    AppFooter,
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
    ProfileScreen,
    SignUp
  }
};
</script>

<style scoped>
#app > *:not(:last-child):not(:first-child) {
  padding: 60px 100px;
}

#app > *:last-child{
  padding-bottom: 40px;
}

#app .sign-in {
  padding: 0;
}
</style>
