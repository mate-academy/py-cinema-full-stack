<template>
  <div id="app">
    <app-header v-if="user" :user="user" @log-out="logOut" />

    <main class="main-content" :class="{ 'auth-page': !user }">
      <router-view :user="user" @log-in="handleLogIn" />
    </main>

    <app-footer v-if="user" />
  </div>
</template>

<script>
import { jwtDecode } from 'jwt-decode';
import AppHeader from './views/AppHeader.vue';
import AppFooter from './views/AppFooter.vue';

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter
  },
  data: () => ({
    user: null,
    expiresAt: null,
    refreshInterval: null
  }),
  methods: {
    async logIn() {
      const accessToken = localStorage.getItem('access');

      if (!accessToken) {
        // Якщо токена немає і ми не на сторінках реєстрації/входу — редирект
        if (!['/sign-in', '/sign-up'].includes(this.$route.path)) {
          this.$router.push('/sign-in');
        }
        return;
      }

      try {
        const { exp } = jwtDecode(accessToken);
        this.expiresAt = exp;

        // Перевіряємо, чи токен ще дійсний (exp у секундах, тому * 1000)
        if (this.expiresAt * 1e3 > Date.now()) {
          await this.fetchUser();
        } else {
          await this.refreshToken();
        }
      } catch (e) {
        console.error("JWT Decode error or Expired:", e);
        this.logOut();
      }
    },

    async handleLogIn() {
      await this.logIn();
      // Після успішного входу відправляємо на головну
      this.$router.push('/movies');
    },

    logOut() {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      this.user = null;
      this.expiresAt = null;

      if (this.$route.path !== '/sign-in') {
        this.$router.push('/sign-in');
      }
    },

    async fetchUser() {
      const accessToken = localStorage.getItem('access');
      try {
        // Використовуємо VITE_API_URL, який ми прописали в .env
        const { data } = await this.axios.get('/user/me/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        this.user = data;
      } catch (err) {
        console.error("Fetch user error:", err);
        this.logOut();
      }
    },

    async refreshToken() {
      const refresh = localStorage.getItem('refresh');
      if (!refresh) return this.logOut();

      try {
        const { data } = await this.axios.post('/user/token/refresh/', {
          refresh: refresh
        });

        localStorage.setItem('access', data.access);
        // Деякі конфігурації Django повертають новий refresh токен, деякі ні
        if (data.refresh) {
          localStorage.setItem('refresh', data.refresh);
        }

        await this.logIn();
      } catch (err) {
        console.error("Refresh token error:", err);
        this.logOut();
      }
    }
  },
  created() {
    this.logIn();

    // Перевірка терміну дії токена кожну хвилину
    this.refreshInterval = setInterval(() => {
      if (this.expiresAt && this.expiresAt * 1e3 < Date.now()) {
        this.refreshToken();
      }
    }, 60000);
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
};
</script>

<style scoped>
/* Стилі залишаємо без змін, вони у вас коректні */
.main-content:not(.auth-page) {
  padding: 60px 100px;
  min-height: calc(100vh - 160px);
}

.main-content.auth-page {
  padding: 0;
}

#app > *:last-child {
  padding-bottom: 40px;
}
</style>
