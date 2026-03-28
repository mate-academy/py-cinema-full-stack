<template>
  <div id="app">
    <app-header v-if="user" :user="user" @log-out="logOut" />

    <main class="main-content" :class="{ 'auth-page': !user }">
      <router-view
        :user="user"
        :isStaff="user?.is_staff"
        @log-in="handleLogIn"
        @refresh-user="fetchUser"
      />
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
    async checkAuth() {
      const accessToken = localStorage.getItem('access');

      if (!accessToken) {
        // Якщо ми не на сторінці реєстрації — відправляємо на вхід
        if (!this.$route.path.includes('sign')) {
          this.$router.push('/sign-in');
        }
        return;
      }

      try {
        const { exp } = jwtDecode(accessToken);
        this.expiresAt = exp;

        // Якщо токен живий — отримуємо дані юзера
        if (this.expiresAt * 1000 > Date.now()) {
          await this.fetchUser();
        } else {
          await this.refreshToken();
        }
      } catch (e) {
        console.error("Auth check failed:", e);
        this.logOut();
      }
    },

    async handleLogIn() {
      await this.checkAuth();
      this.$router.push('/movies');
    },

    logOut() {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      this.user = null;
      this.expiresAt = null;
      this.$router.push('/sign-in');
    },

    async fetchUser() {
      try {
        // Axios перехоплювач сам додасть токен
        const { data } = await this.axios.get('/user/me/');
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
        if (data.refresh) {
          localStorage.setItem('refresh', data.refresh);
        }
        await this.checkAuth();
      } catch (err) {
        console.error("Token refresh failed:", err);
        this.logOut();
      }
    }
  },
  created() {
    this.checkAuth();

    // Кожну хвилину перевіряємо, чи не протух токен
    this.refreshInterval = setInterval(() => {
      if (this.expiresAt && this.expiresAt * 1000 < Date.now()) {
        this.refreshToken();
      }
    }, 60000);
  },
  beforeUnmount() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }
};
</script>

<style scoped>
.main-content:not(.auth-page) {
  padding: 60px 100px;
  min-height: calc(100vh - 160px);
}

.main-content.auth-page {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
