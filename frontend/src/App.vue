<template>
  <div id="app">
    <div v-if="error" class="api-error" role="alert">{{ error }} <button @click="error = ''">Dismiss</button></div>
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
    <profile-screen v-if="user" :user="user" @profile-updated="user = $event"></profile-screen>
    <app-footer v-if="user"></app-footer>
  </div>
</template>

<script>

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
    error: '',
    user: null,
    type: 'password'
  }),
  methods: {
    async logIn () {
      if (!localStorage.getItem('access') && !localStorage.getItem('refresh')) return;
      await this.fetchUser();
    },

    async handleLogIn () {
      this.error = '';
      await this.logIn();
      location.hash = '#/';
    },

    logOut () {
      this.error = '';
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');

      this.user = null;
      location.hash = '#/sign-in';
    },

    async fetchUser () {
      const accessToken = localStorage.getItem('access');
      try {
        const { data: user } = await this.axios.get(`/api/user/me/`,
          { headers: { Authorization: `Bearer ${accessToken}` } });

        this.user = user;
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    },

    handleApiError (event) {
      this.error = event.detail;
    },
    handleSessionExpired () {
      this.logOut();
      location.hash = '#/sign-in';
    }
  },
  created () {
    window.addEventListener('api-error', this.handleApiError);
    window.addEventListener('session-expired', this.handleSessionExpired);
    this.logIn();
  },
  beforeDestroy () {
    window.removeEventListener('api-error', this.handleApiError);
    window.removeEventListener('session-expired', this.handleSessionExpired);
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
