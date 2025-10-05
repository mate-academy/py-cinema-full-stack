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
import MovieSessionDetailsScreen from './views/MovieSessionDetailsScreen.vue';

import CinemaHallListScreen from './views/CinemaHallListScreen.vue';
import CinemaHallAddScreen from './views/CinemaHallAddScreen.vue';

import GenreListScreen from './views/GenreListScreen.vue';
import ActorListScreen from './views/ActorListScreen.vue';

import OrderListScreen from './views/OrderListScreen.vue';
import ProfileScreen from './views/ProfileScreen.vue';

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
    expiresAt: null, // epoch (segundos)
  }),

  methods: {
    async handleLogIn () {
      // chamado pelo SignIn / SignUp após salvar tokens no localStorage
      await this.logIn();
      location.hash = '#/';
    },

    async logIn () {
      const access = localStorage.getItem('access');
      if (!access) return;

      try {
        const { exp } = jwtDecode(access);
        this.expiresAt = exp;
      } catch {
        // token inválido — força log out
        this.logOut();
        return;
      }

      // Se ainda está válido, busca o usuário; senão tenta renovar
      if (this.expiresAt * 1000 > Date.now()) {
        await this.fetchUser();
      } else {
        await this.refreshToken();
      }
    },

    logOut () {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      this.user = null;
    },

    async fetchUser () {
      try {
        // Authorization já é adicionado pelo interceptor do axios instance
        const { data } = await this.axios.get('/api/user/me/');
        this.user = data;
      } catch (err) {
        console.error('[me] error:', err?.response?.data || err?.message);
        // se não conseguiu obter o usuário, encerra a sessão local
        this.logOut();
      }
    },

    async refreshToken () {
      const refresh = localStorage.getItem('refresh');
      if (!refresh) {
        this.logOut();
        return;
      }

      try {
        // algumas configurações do SimpleJWT retornam apenas "access"
        const { data } = await this.axios.post('/api/user/token/refresh/', { refresh });

        if (data?.access) {
          localStorage.setItem('access', data.access);
          // mantém o refresh atual caso o backend não gire um novo
          if (data?.refresh) localStorage.setItem('refresh', data.refresh);

          const { exp } = jwtDecode(data.access);
          this.expiresAt = exp;

          await this.fetchUser();
          return;
        }

        // sem access => não deu para renovar
        this.logOut();
      } catch (err) {
        console.error('[refresh] error:', err?.response?.data || err?.message);
        this.logOut();
      }
    },
  },

  created () {
    // tenta autenticar ao carregar
    this.logIn();

    // checagem simples para renovar o token quando expirar
    setInterval(() => {
      if (!this.expiresAt) return;
      const willExpire = this.expiresAt * 1000 <= Date.now() + 30_000; // 30s de margem
      if (willExpire) this.refreshToken();
    }, 60 * 1000);
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
