<template>
  <section v-show="active" class="hall-list">
    <div class="head">
      <h1>Cinema halls</h1>
      <div class="actions">
        <button @click="load" :disabled="loading">Reload</button>
        <span v-if="count !== null" class="muted">Total: {{ count }}</span>
        <span v-if="isStaff" class="badge">Staff</span>
      </div>
    </div>

    <div v-if="loading" class="hint">Loading…</div>
    <p v-if="errorText" class="err">{{ errorText }}</p>

    <ul v-if="!loading && halls.length" class="grid">
      <li v-for="h in halls" :key="h.id" class="card">
        <div class="row1">
          <strong class="name">{{ h.name || `Hall #${h.id}` }}</strong>
          <small class="id">#{{ h.id }}</small>
        </div>
        <div class="meta">
          <span v-if="h.rows">Rows: {{ h.rows }}</span>
          <span v-if="h.seats_in_row">Seats/row: {{ h.seats_in_row }}</span>
          <span>
            Capacity:
            {{
              h.capacity != null
                ? h.capacity
                : ( (h.rows || 0) * (h.seats_in_row || 0) )
            }}
          </span>
        </div>
      </li>
    </ul>

    <!-- Paginação simples (DRF) -->
    <div v-if="paginated" class="pager">
      <button @click="goPrev" :disabled="!previous || loading">Prev</button>
      <button @click="goNext" :disabled="!next || loading">Next</button>
    </div>
  </section>
</template>

<script>
import { fetchCinemaHalls, initTokensFromStorage } from '@/api'

export default {
  name: 'CinemaHallListScreen',
  props: {
    isStaff: { type: Boolean, default: false }
  },
  data: () => ({
    active: false,
    halls: [],
    loading: false,
    errorText: '',
    // paginação (DRF)
    count: null,
    next: null,
    previous: null
  }),

  computed: {
    paginated () {
      return this.next !== null || this.previous !== null
    }
  },

  methods: {
    isMyHash () { return /^#\/cinema-halls/.test(location.hash) },

    async load (url = null) {
      this.loading = true
      this.errorText = ''

      try {
        // paginação: se vier next/previous absolutos do DRF
        if (url) {
          const headers = {}
          const token = localStorage.getItem('auth_access')
          if (token) headers['Authorization'] = `Bearer ${token}`

          const res = await fetch(url, { headers })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          this.applyData(data)
          return
        }

        const data = await fetchCinemaHalls({})
        this.applyData(data)
      } catch (err) {
        const s = err?.response?.status || err?.message
        this.errorText = err?.response?.data?.detail || `Failed to load halls${s ? ` (${s})` : ''}`
        console.error('[Halls] load failed:', s, err)
      } finally {
        this.loading = false
      }
    },

    applyData (data) {
      if (data && typeof data === 'object' && Array.isArray(data.results)) {
        this.halls = data.results
        this.count = data.count ?? this.halls.length
        this.next = data.next || null
        this.previous = data.previous || null
      } else if (Array.isArray(data)) {
        this.halls = data
        this.count = data.length
        this.next = null
        this.previous = null
      } else {
        this.halls = []
        this.count = 0
        this.next = null
        this.previous = null
      }
    },

    goNext () { if (this.next) this.load(this.next) },
    goPrev () { if (this.previous) this.load(this.previous) },

    hashHandler () {
      const was = this.active
      this.active = this.isMyHash()
      if (this.active && !was) this.load()
    }
  },

  created () {
    if (typeof initTokensFromStorage === 'function') initTokensFromStorage()
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
.hall-list { display:grid; gap:12px; padding: 12px; }
.head { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.actions { display:flex; align-items:center; gap:8px; }
.badge { background:#eef; color:#224; padding:2px 8px; border-radius:12px; font-size:12px; }
.muted { opacity:.7; }
.hint { opacity:.7; }
.err { color:#ff6b6b; }

.grid { list-style:none; padding:0; margin:0; display:grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:12px; }
.card { border:1px solid #eee; border-radius:12px; background:#fff; padding:12px; display:grid; gap:6px; }
.row1 { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.name { font-weight:600; }
.id { opacity:.6; }
.meta { display:flex; flex-wrap:wrap; gap:8px; font-size:13px; opacity:.9; }
.pager { display:flex; gap:8px; margin-top:12px; }
</style>
