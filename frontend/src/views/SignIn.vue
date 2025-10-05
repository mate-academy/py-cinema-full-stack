<template>
  <div class="sign-in" v-if="active">
    <h1>Sign in to Cinema Shop</h1>
    <h2>
      Please enter your sign in details.
      <a href="#/sign-up">Sign up</a>
      here if you are not registered yet.
    </h2>

    <input-item
      label="Login"
      pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$"
      placeholder="Email"
      v-model="email"
    />

    <password-input v-model="password" />

    <action-button
      :label="loading ? 'Signing in…' : 'Sign in'"
      :disabled="loading"
      @click="signIn"
    />
    <p v-if="errorText" style="color:#ff6b6b;margin-top:8px">{{ errorText }}</p>
  </div>
</template>

<script>
import ActionButton from '../comps/ActionButton.vue';
import InputItem from '../comps/InputItem.vue';
import PasswordInput from '../comps/PasswordInput.vue';

export default {
  components: { InputItem, PasswordInput, ActionButton },

  data: () => ({
    active: false,
    email: '',
    password: '',
    errorText: '',
    loading: false
  }),

  methods: {
    hashHandler() {
      this.active = !/#\/sign-up$/.test(location.hash);
    },

    baseUrl() {
      const env = (import.meta.env && import.meta.env.VITE_API_URL) || '';
      const base = env && env.trim() ? env.trim() : 'http://localhost:8080';
      return new URL('/', base).origin;
    },

    async signIn() {
      if (this.loading) return;
      this.errorText = '';
      this.loading = true;

      const url = new URL('/api/user/token/', this.baseUrl()).toString();
      console.log('[SignIn] VITE_API_URL =', import.meta.env.VITE_API_URL, '| URL final =', url);

      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password })
        });

        let payload = null;
        try {
          payload = await resp.json();
        } catch (_) {}

        if (!resp.ok) {
          const detail =
            (payload && (payload.detail || payload.error)) ||
            (resp.status === 400 && 'Invalid payload') ||
            (resp.status === 401 && 'No active account found with the given credentials') ||
            `HTTP ${resp.status}`;
          throw new Error(detail);
        }

        const data = payload || {};
        if (!data.access || !data.refresh) {
          throw new Error('Unexpected response from server');
        }

        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);

        // Dispara evento para App.vue buscar /api/user/me/
        this.$emit('log-in');
      } catch (err) {
        console.error('[SignIn] fetch falhou:', err);
        this.errorText = err?.message || 'Failed to fetch';
      } finally {
        this.loading = false;
      }
    }
  },

  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
  },

  beforeDestroy() {
    window.removeEventListener('hashchange', this.hashHandler);
  }
};
</script>

<style scoped>
.sign-in {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
}
h1 {
  font-size: 50px;
  font-weight: 600;
  text-align: center;
  line-height: 60px;
}
h2 {
  font-size: 25px;
  text-align: center;
  margin-bottom: 16px;
  line-height: 30px;
}
a {
  text-decoration: underline;
  font-weight: 600;
  cursor: pointer;
  color: var(--main-font);
}
</style>
