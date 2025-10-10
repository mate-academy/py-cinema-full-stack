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
import ActionButton from '../comps/ActionButton.vue'
import InputItem from '../comps/InputItem.vue'
import PasswordInput from '../comps/PasswordInput.vue'
import { login } from '../api'
import { BASE_URL } from '../axios'

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
      this.active = !/#\/sign-up$/.test(location.hash)
    },

    async signIn() {
      if (this.loading) return
      this.errorText = ''
      this.loading = true

      try {
        // limpa tokens antigos
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')

        const data = await login(this.email, this.password)

        if (!data?.access || !data?.refresh) {
          throw new Error('Unexpected response from server')
        }

        // salva tokens
        localStorage.setItem('access', data.access)
        localStorage.setItem('refresh', data.refresh)

        // notifica quem ouvir e, principalmente, REDIRECIONA
        this.$emit('log-in')

        // 🔁 Força navegação para uma rota logada e recarrega o app
        // escolha a que existir no seu app: '#/profile', '#/movies' ou '#/'
        location.hash = '#/profile'
        // recarrega uma vez para que o App.vue/estado pegue os tokens
        setTimeout(() => location.reload(), 0)
      } catch (err) {
        const status = err?.response?.status
        const detail =
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          (status === 401 && 'No active account found with the given credentials') ||
          (status === 400 && 'Invalid payload') ||
          err?.message || 'Failed to sign in'
        // eslint-disable-next-line no-console
        console.error('[SignIn] login failed:', status, detail, err?.response?.data)
        this.errorText = detail
      } finally {
        this.loading = false
      }
    }
  },

  mounted() {
    window.addEventListener('hashchange', this.hashHandler)
    this.hashHandler()
  },

  beforeDestroy() {
    window.removeEventListener('hashchange', this.hashHandler)
  }
}
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
h1 { font-size: 50px; font-weight: 600; text-align: center; line-height: 60px; }
h2 { font-size: 25px; text-align: center; margin-bottom: 16px; line-height: 30px; }
a  { text-decoration: underline; font-weight: 600; cursor: pointer; color: var(--main-font); }
</style>
