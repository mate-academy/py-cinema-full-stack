<template>
  <div class="sign-up" v-if="active">
    <h1>Sign up to Cinema Shop</h1>
    <h2>
      Please enter your credentials to sign up.
      <a href="#/sign-in">Sign in</a>
      here if you are registered yet.
    </h2>

    <input-item
      label="Email"
      pattern="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$"
      placeholder="Email"
      v-model="email"
    />

    <password-input v-model="password" />

    <action-button
      :label="loading ? 'Creating account…' : 'Sign up'"
      @click="signUp"
      :disabled="loading || !canSubmit"
    />

    <p v-if="errorText" class="error">{{ errorText }}</p>
    <p v-if="successText" class="success">{{ successText }}</p>
  </div>
</template>

<script>
import ActionButton from '../comps/ActionButton.vue';
import InputItem from '../comps/InputItem.vue';
import PasswordInput from '../comps/PasswordInput.vue';

export default {
  name: 'SignUp',
  components: { InputItem, PasswordInput, ActionButton },

  data: () => ({
    active: false,
    email: '',
    password: '',
    loading: false,
    errorText: '',
    successText: ''
  }),

  computed: {
    canSubmit () {
      const emailOk = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email.trim());
      const passOk = (this.password || '').length >= 8;
      return emailOk && passOk;
    },
    baseOrigin () {
      const env = (import.meta.env && import.meta.env.VITE_API_URL) || '';
      return (env && env.trim() ? env.trim() : 'http://127.0.0.1:8080').replace(/\/+$/, '');
    }
  },

  methods: {
    buildUrl (path) {
      // garante URL absoluta e com 1 barra
      return `${this.baseOrigin}${path.startsWith('/') ? '' : '/'}${path}`;
    },

    prettyErr (err) {
      const res = err?.response;
      if (!res) return err?.message || 'Network error';
      if (res.data && typeof res.data === 'object') {
        const first = Object.values(res.data)[0];
        if (Array.isArray(first)) return first[0];
        if (typeof first === 'string') return first;
      }
      return res.data?.detail || res.data?.error || `HTTP ${res.status}`;
    },

    async postJSON (url, payload) {
      return this.axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
    },

    async signUp () {
      if (!this.canSubmit || this.loading) return;

      this.loading = true;
      this.errorText = '';
      this.successText = '';

      const creds = { email: this.email.trim(), password: this.password };

      try {
        // 1) Criar usuário — tenta /register/ e faz fallback para /create/
        let created = false;
        try {
          await this.postJSON(this.buildUrl('/api/user/register/'), creds);
          created = true;
        } catch (e1) {
          try {
            await this.postJSON(this.buildUrl('/api/user/create/'), creds);
            created = true;
          } catch (e2) {
            throw e2; // propaga o erro real de criação
          }
        }

        if (!created) throw new Error('Account creation failed.');

        // 2) Login automático — tenta /token/ e fallback para /token
        let tokenResp;
        try {
          tokenResp = await this.postJSON(this.buildUrl('/api/user/token/'), creds);
        } catch (e3) {
          tokenResp = await this.postJSON(this.buildUrl('/api/user/token'), creds);
        }

        const { access, refresh } = tokenResp.data || {};
        if (!access) throw new Error('Login token not received.');

        localStorage.setItem('access', access);
        if (refresh) localStorage.setItem('refresh', refresh);

        this.successText = 'Account created! Signing you in…';
        // avisa o App.vue para carregar o usuário
        this.$emit('log-in');

        // navegação de segurança
        setTimeout(() => { location.hash = '#/'; }, 400);
      } catch (err) {
        this.errorText = this.prettyErr(err);
      } finally {
        this.loading = false;
      }
    },

    hashHandler () {
      this.active = /sign-up$/.test(location.hash);
    }
  },

  mounted () {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
  },

  beforeDestroy () {
    window.removeEventListener('hashchange', this.hashHandler);
  }
};
</script>

<style scoped>
.sign-up {
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
  left: 50%;
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

.error { color: #ff6b6b; }
.success { color: #43d17a; }
</style>
