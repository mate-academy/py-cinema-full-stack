<template>
  <div id="app">
    <app-header v-if="user" :user="user" @log-out="logOut"></app-header>
    <div v-if="authError" class="auth-error">{{authError}}</div>
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
    authError: ''
  }),
  methods: {
    async logIn () {
      const accessToken = localStorage.getItem('access');
      if (!accessToken) return;

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
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');

      this.user = null;
      this.expiresAt = null;
    },

    async fetchUser () {
      const accessToken = localStorage.getItem('access');
      try {
        const { data: user } = await this.axios.get('/api/user/me/',
          { headers: { Authorization: `Bearer ${accessToken}` } });

        this.user = user;
      } catch (err) {
        this.authError = this.getErrorMessage(err, 'Unable to load your profile.');
        this.logOut();
      }
    },

    async refreshToken () {
      try {
        const { data } = await this.axios.post('/api/user/token/refresh/', {
          refresh: localStorage.getItem('refresh')
        });

        const { access, refresh } = data;

        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);
        this.logIn();
      } catch (err) {
        this.authError = this.getErrorMessage(err, 'Your session has expired. Please sign in again.');
        this.logOut();
      }
    },

    getErrorMessage (err, fallback) {
      const data = err.response && err.response.data;
      if (!data) return fallback;
      if (typeof data === 'string') return data;
      return Object.values(data).flat().join(' ') || fallback;
    }
  },
  created () {
    this.logIn();

    setInterval(() => {
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

.auth-error {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  color: var(--red);
}
</style>
