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
    <profile-screen v-if="user" :user="user" @user-updated="user = $event"></profile-screen>
    <app-footer v-if="user"></app-footer>
  </div>
</template>

<script>
import jwtDecode from 'jwt-decode';

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
    type: 'password',
    refreshTimer: null
  }),
  methods: {
    async logIn () {
      const accessToken = localStorage.getItem('access');
      if (!accessToken) return this.refreshToken();

      try {
        this.expiresAt = jwtDecode(accessToken).exp;
      } catch (err) {
        this.logOut();
        return;
      }

      if (this.expiresAt * 1e3 > Date.now()) {
        await this.fetchUser();
        return;
      }

      await this.refreshToken();
    },

    async handleLogIn () {
      await this.logIn();
      location.hash = '#/';
    },

    logOut () {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');

      this.user = null;
      this.expiresAt = null;
      location.hash = '#/sign-in';
    },

    async fetchUser () {
      const accessToken = localStorage.getItem('access');
      try {
        const { data: user } = await this.axios.get(`/api/user/me/`,
          { headers: { Authorization: `Bearer ${accessToken}` } });

        this.user = user;
      } catch (err) {
        if (err.response?.status === 401) this.logOut();
        console.error(err.response?.data || err.message);
      }
    },

    async refreshToken () {
      const refreshToken = localStorage.getItem('refresh');
      if (!refreshToken) return;

      try {
        const { data } = await this.axios.post(`/api/user/token/refresh/`, {
          refresh: refreshToken
        });

        const { access, refresh } = data;

        localStorage.setItem('access', access);
        if (refresh) localStorage.setItem('refresh', refresh);
        await this.logIn();
      } catch (err) {
        if (err.response?.status === 401) this.logOut();
        console.error(err.response?.data || err.message);
      }
    }
  },
  created () {
    this.logIn();

    this.refreshTimer = setInterval(() => {
      if (!localStorage.getItem('refresh')) return;
      if (this.expiresAt && this.expiresAt * 1e3 > Date.now()) return;
      this.refreshToken();
    }, 60 * 1e3);
  },
  beforeDestroy () {
    clearInterval(this.refreshTimer);
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
