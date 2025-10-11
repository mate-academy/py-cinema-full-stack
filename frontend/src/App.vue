<template>
  <div id="app">
    <!-- Header/Footer só em rotas privadas (quando autenticado) -->
    <app-header v-if="showChrome" :user="user" @log-out="handleLogout" />

    <!-- aqui o Router controla QUAL página renderizar -->
    <router-view @log-in="handleLogin" />

    <app-footer v-if="showChrome" />
  </div>
</template>

<script>
import { isAuthenticated, me, clearTokens } from "@/api";
import AppHeader from "@/views/AppHeader.vue";
import AppFooter from "@/views/AppFooter.vue";

export default {
  name: "App",
  components: { AppHeader, AppFooter },

  data: () => ({
    user: null,
  }),

  computed: {
    // mostra header/footer somente em rotas com meta.requiresAuth
    showChrome() {
      const onPrivateRoute = this.$route.matched.some(
        (r) => r.meta && r.meta.requiresAuth
      );
      return onPrivateRoute && isAuthenticated();
    },
  },

  watch: {
    // quando a rota muda para uma privada, (re)carrega o usuário
    "$route.fullPath": {
      immediate: true,
      handler() {
        this.syncUser();
      },
    },
  },

  methods: {
    async syncUser() {
      try {
        if (isAuthenticated()) {
          const data = await me();
          this.user = data;
        } else {
          this.user = null;
        }
      } catch {
        // se der erro, limpa tokens e volta pro login
        this.user = null;
        clearTokens();
        if (this.$route.path !== "/login") {
          this.$router.replace({
            path: "/login",
            query: { next: this.$route.fullPath },
          });
        }
      }
    },

    async handleLogin() {
      // emitido opcionalmente pelo SignIn/SignUp
      await this.syncUser();
      if (this.$route.path === "/login") {
        this.$router.replace("/movies");
      }
    },

    handleLogout() {
      clearTokens();
      this.user = null;
      this.$router.replace("/login");
    },
  },
};
</script>

<style>
html, body, #app { height: 100%; margin: 0; }
</style>
