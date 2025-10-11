<template>
  <div class="profile">
    <h1>My profile</h1>

    <div v-if="loading">Loading…</div>
    <p v-if="errorText" class="error">{{ errorText }}</p>

    <div v-if="!loading && me">
      <ul class="info">
        <li><strong>ID:</strong> <span>{{ me.id }}</span></li>
        <li><strong>Email:</strong> <span>{{ me.email || me.username }}</span></li>
        <li v-if="me.username"><strong>Username:</strong> <span>{{ me.username }}</span></li>
        <li><strong>Staff:</strong> <span>{{ me.is_staff ? 'yes' : 'no' }}</span></li>
      </ul>

      <div class="actions">
        <button @click="loadMe" :disabled="loading">Reload</button>
        <button class="outline" @click="signOut">Sign out</button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchMe } from '@/api'

export default {
  name: 'ProfileScreen',

  data: () => ({
    me: null,
    loading: false,
    errorText: ''
  }),

  methods: {
    async loadMe() {
      this.loading = true
      this.errorText = ''
      try {
        this.me = await fetchMe()
      } catch (err) {
        const status = err?.response?.status
        this.errorText =
          err?.response?.data?.detail ||
          `Failed to load profile${status ? ` (HTTP ${status})` : ''}`
        // eslint-disable-next-line no-console
        console.error('[Profile] load failed:', status, err)
      } finally {
        this.loading = false
      }
    },

    signOut() {
      // Limpa tokens e volta para a tela de login
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      // Se o app usa hash-router simples:
      location.hash = '#/sign-in'
      // e força recarregar dados
      this.me = null
    }
  },

  mounted() {
    this.loadMe() // dispara GET /api/user/me/ para a screenshot
  }
}
</script>

<style scoped>
.profile { display: grid; gap: 16px; max-width: 720px; margin: 0 auto; }
.info { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.info li { display: grid; grid-template-columns: 140px 1fr; align-items: center; }
.error { color: #ff6b6b; }
.actions { display: flex; gap: 12px; margin-top: 8px; }
button { padding: 8px 14px; border-radius: 8px; border: none; cursor: pointer; }
button.outline { background: transparent; border: 1px solid var(--main-font, #999); }
</style>
