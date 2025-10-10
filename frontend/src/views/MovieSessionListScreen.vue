<template>
  <section v-show="active" class="session-list">
    <h1>Movie sessions</h1>

    <div v-if="loading">Loading…</div>
    <p v-if="errorText" class="err">{{ errorText }}</p>

    <ul v-if="!loading && sessions.length">
      <li v-for="s in sessions" :key="s.id">
        <strong>{{ s.movie?.title || s.movie_title }}</strong>
        <small> — {{ s.show_time }}</small>
      </li>
    </ul>
  </section>
</template>

<script>
import { fetchMovieSessions } from '@/api'

export default {
  data: () => ({
    active: false,
    sessions: [],
    loading: false,
    errorText: ''
  }),

  methods: {
    isMyHash () { return /^#\/movie-sessions/.test(location.hash) },
    async load () {
      this.loading = true
      this.errorText = ''
      try {
        // passe filtros se quiser (ex.: date)
        const data = await fetchMovieSessions({})
        this.sessions = data.results || data || []
      } catch (err) {
        const s = err?.response?.status
        this.errorText = err?.response?.data?.detail || `Failed to load sessions${s ? ` (HTTP ${s})` : ''}`
        console.error('[Sessions] load failed:', s, err)
      } finally {
        this.loading = false
      }
    },
    hashHandler () {
      const was = this.active
      this.active = this.isMyHash()
      if (this.active && !was) this.load()
    }
  },

  mounted () {
    window.addEventListener('hashchange', this.hashHandler)
    this.hashHandler()
  },
  beforeDestroy () {
    window.removeEventListener('hashchange', this.hashHandler)
  }
}
</script>

<style scoped>
.session-list { display:grid; gap:12px; }
.err { color:#ff6b6b; }
</style>
