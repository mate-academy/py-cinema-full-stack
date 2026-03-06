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
import jwtDecode from "jwt-decode";

import SignIn from "./views/SignIn.vue";
import MovieListScreen from "./views/MovieListScreen.vue";
import AppHeader from "./views/AppHeader.vue";
import AppFooter from "./views/AppFooter.vue";
import MovieDetailsScreen from "./views/MovieDetailsScreen.vue";
import MovieAddScreen from "./views/MovieAddScreen.vue";
import MovieSessionListScreen from "./views/MovieSessionListScreen.vue";
import MovieSessionAddScreen from "./views/MovieSessionAddScreen.vue";
import CinemaHallListScreen from "./views/CinemaHallListScreen.vue";
import CinemaHallAddScreen from "./views/CinemaHallAddScreen.vue";
import GenreListScreen from "./views/GenreListScreen.vue";
import ActorListScreen from "./views/ActorListScreen.vue";
import MovieSessionDetailsScreen from "./views/MovieSessionDetailsScreen.vue";
import OrderListScreen from "./views/OrderListScreen.vue";
import ProfileScreen from "./views/ProfileScreen.vue";
import SignUp from "./views/SignUp.vue";

export default {
  data: () => ({
    expiresAt: null,
    user: null,
    type: "password",
  }),
  methods: {
    apiBase() {
      // VITE_API_URL is backend root (e.g. http://localhost:8000)
      return `${import.meta.env.VITE_API_URL}/api`;
    },

    async logIn() {
      const accessToken = localStorage.getItem("access");
      if (!accessToken) return;

      const { exp } = jwtDecode(accessToken);
      this.expiresAt = exp;

      if (this.expiresAt * 1e3 > Date.now()) {
        await this.fetchUser();
        return;
      }

      await this.refreshToken();
    },

    async handleLogIn() {
      await this.logIn();
      location.hash = "#/";
    },

    logOut() {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      this.user = null;
    },

    async fetchUser() {
      const accessToken = localStorage.getItem("access");
      if (!accessToken) return;

      try {
        // правильний endpoint: GET /api/user/me/
        const { data: user } = await this.axios.get(
          `${this.apiBase()}/user/me/`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        this.user = user;
      } catch (err) {
        const status = err?.response?.status;
        const payload = err?.response?.data;
        console.error("fetchUser failed:", status, payload || err.message);
      }
    },

    async refreshToken() {
      const refresh = localStorage.getItem("refresh");
      if (!refresh) return;

      try {
        // правильний endpoint: POST /api/user/token/refresh/
        const { data } = await this.axios.post(
          `${this.apiBase()}/user/token/refresh/`,
          { refresh }
        );

        const { access, refresh: newRefresh } = data;

        localStorage.setItem("access", access);
        if (newRefresh) localStorage.setItem("refresh", newRefresh);

        await this.logIn();
      } catch (err) {
        const status = err?.response?.status;
        const payload = err?.response?.data;
        console.error("refreshToken failed:", status, payload || err.message);

        // якщо refresh протух/невалідний — розлогін
        this.logOut();
      }
    },
  },
  created() {
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
    SignUp,
  },
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
