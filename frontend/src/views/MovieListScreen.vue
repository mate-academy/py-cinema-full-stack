<template>
  <section v-show="active" class="movie-list">
    <h1>Movies</h1>

    <div v-if="loading">Loading…</div>
    <p v-if="errorText" class="err">{{ errorText }}</p>

    <ul v-if="!loading && movies.length">
      <li v-for="m in movies" :key="m.id">
        <strong>{{ m.title }}</strong>
        <small v-if="m.description"> — {{ m.description }}</small>
      </li>
    </ul>

    <div class="pager" v-if="count > pageSize">
      <button :disabled="page===1 || loading" @click="go(page-1)">Prev</button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <button :disabled="page===totalPages || loading" @click="go(page+1)">Next</button>
    </div>
  </section>
</template>

<script>
import { fetchMovies } from '@/api'

export default {
  data: () => ({
    active: false,
    movies: [],
    count: 0,
    page: 1,
    pageSize: 6,
    loading: false,
    errorText: ''
  }),

  computed: {
    totalPages () {
      return Math.max(1, Math.ceil(this.count / this.pageSize))
    }
  },

  methods: {
    isMyHash () {
      // raiz (#/), ou /movies
      return !location.hash || location.hash === '#/' || /^#\/movies/.test(location.hash)
    },
    async load () {
      this.loading = true
      this.errorText = ''
      try {
        const offset = (this.page - 1) * this.pageSize
        const data = await fetchMovies({ limit: this.pageSize, offset })
        this.movies = data.results || data || []
        this.count = typeof data.count === 'number' ? data.count : this.movies.length
      } catch (err) {
        const s = err?.response?.status
        this.errorText = err?.response?.data?.detail || `Failed to load movies${s ? ` (HTTP ${s})` : ''}`
        console.error('[Movies] load failed:', s, err)
      } finally {
        this.loading = false
      }
    },
    go (p) {
      this.page = Math.min(Math.max(1, p), this.totalPages)
      this.load()
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
.movie-list { display:grid; gap:12px; }
.pager { display:flex; gap:12px; align-items:center; }
.err { color:#ff6b6b; }
</style>
