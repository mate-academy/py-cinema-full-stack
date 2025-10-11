<template>
  <section v-show="active" class="genre-list">
    <div class="head">
      <h1>Genres</h1>
      <div class="actions">
        <button @click="load" :disabled="loading">Reload</button>
        <span v-if="count !== null" class="muted">Total: {{ count }}</span>
      </div>
    </div>

    <div v-if="loading" class="hint">Loading…</div>
    <p v-if="errorText" class="err">{{ errorText }}</p>

    <ul v-if="!loading && genres.length" class="grid">
      <li v-for="g in genres" :key="g.id" class="card">
        <div class="row1">
          <strong class="name">{{ g.name }}</strong>
          <small class="id">#{{ g.id }}</small>
        </div>
      </li>
    </ul>

    <div v-if="paginated" class="pager">
      <button @click="goPrev" :disabled="!previous || loading">Prev</button>
      <button @click="goNext" :disabled="!next || loading">Next</button>
    </div>
  </section>
</template>

<script>
import { fetchGenres, initTokensFromStorage } from '@/api';

export default {
  name: 'GenreListScreen',
  data: () => ({
    active: false,
    genres: [],
    loading: false,
    errorText: '',
    count: null,
    next: null,
    previous: null,
  }),
  computed: {
    paginated () { return this.next !== null || this.previous !== null; }
  },
  methods: {
    isMyHash () { return /^#\/genres/.test(location.hash); },
    async load (url = null) {
      this.loading = true; this.errorText = '';
      try {
        if (url) {
          const headers = {};
          const token = localStorage.getItem('auth_access');
          if (token) headers.Authorization = `Bearer ${token}`;
          const r = await fetch(url, { headers });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          this.applyData(await r.json());
          return;
        }
        const data = await fetchGenres({});
        this.applyData(data);
      } catch (err) {
        const s = err?.response?.status || err?.message;
        this.errorText = err?.response?.data?.detail || `Failed to load genres${s ? ` (${s})` : ''}`;
        console.error('[Genres] load failed:', s, err);
      } finally { this.loading = false; }
    },
    applyData (data) {
      if (data && Array.isArray(data.results)) {
        this.genres = data.results; this.count = data.count ?? this.genres.length;
        this.next = data.next || null; this.previous = data.previous || null;
      } else if (Array.isArray(data)) {
        this.genres = data; this.count = data.length; this.next = null; this.previous = null;
      } else {
        this.genres = []; this.count = 0; this.next = null; this.previous = null;
      }
    },
    goNext () { if (this.next) this.load(this.next); },
    goPrev () { if (this.previous) this.load(this.previous); },
    hashHandler () {
      const was = this.active;
      this.active = this.isMyHash();
      if (this.active && !was) this.load();
    },
  },
  created () { if (typeof initTokensFromStorage === 'function') initTokensFromStorage(); },
  mounted () { window.addEventListener('hashchange', this.hashHandler); this.hashHandler(); },
  beforeDestroy () { window.removeEventListener('hashchange', this.hashHandler); }
};
</script>

<style scoped>
.genre-list { display:grid; gap:12px; padding:12px; }
.head { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.actions { display:flex; align-items:center; gap:8px; }
.muted { opacity:.7; }
.hint { opacity:.7; }
.err { color:#ff6b6b; }
.grid { list-style:none; padding:0; margin:0; display:grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap:12px; }
.card { border:1px solid #eee; border-radius:12px; background:#fff; padding:12px; display:grid; gap:6px; }
.row1 { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.name { font-weight:600; }
.id { opacity:.6; }
.pager { display:flex; gap:8px; margin-top:12px; }
</style>
