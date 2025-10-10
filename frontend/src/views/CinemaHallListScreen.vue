<template>
  <section v-show="active" class="hall-list">
    <h1>Cinema halls</h1>

    <div v-if="loading">Loading…</div>
    <p v-if="errorText" class="err">{{ errorText }}</p>

    <ul v-if="!loading && halls.length">
      <li v-for="h in halls" :key="h.id">
        <strong>{{ h.name || `Hall #${h.id}` }}</strong>
        <small v-if="h.capacity"> — capacity: {{ h.capacity }}</small>
      </li>
    </ul>
  </section>
</template>

<script>
import { fetchCinemaHalls } from '@/api'

export default {
  data: () => ({
    active: false,
    halls: [],
    loading: false,
    errorText: ''
  }),

  methods: {
    isMyHash () { return /^#\/cinema-halls/.test(location.hash) },
    async load () {
      this.loading = true
      this.errorText = ''
      try {
        const data = await fetchCinemaHalls({})
        this.halls = data.results || data || []
      } catch (err) {
        const s = err?.response?.status
        this.errorText = err?.response?.data?.detail || `Failed to load halls${s ? ` (HTTP ${s})` : ''}`
        console.error('[Halls] load failed:', s, err)
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
.hall-list { display:grid; gap:12px; }
.err { color:#ff6b6b; }
</style>
