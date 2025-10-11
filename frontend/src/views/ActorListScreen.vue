<template>
  <section v-show="active" class="actor-list">
    <div class="head">
      <h1>Actors</h1>
      <div class="actions">
        <button @click="load" :disabled="loading">Reload</button>
        <span v-if="count !== null" class="muted">Total: {{ count }}</span>
      </div>
    </div>

    <div v-if="loading" class="hint">Loading…</div>
    <p v-if="errorText" class="err">{{ errorText }}</p>

    <ul v-if="!loading && actors.length" class="grid">
      <li v-for="a in actors" :key="a.id" class="card">
        <div class="row1">
          <strong class="name">{{ a.full_name || (a.first_name + ' ' + a.last_name) }}</strong>
          <small class="id">#{{ a.id }}</small>
        </div>
        <div class="meta">
          <span v-if="a.first_name">First: {{ a.first_name }}</span>
          <span v-if="a.last_name">Last: {{ a.last_name }}</span>
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
import { fetchActors, initTokensFromStorage } from '@/api';

export default {
  name: 'ActorListScreen',
  data: () => ({
    active: false,
    actors: [],
    loading: false,
    errorText: '',
    count: null,
    next: null,
    previous: null
  }),
  computed: {
    paginated () { return this.next !== null || this.previous !== null; }
  },
  methods: {
    isMyHash () { return /^#\/actors/.test(location.hash); },
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
        const data = await fetchActors({});
        this.applyData(data);
      } catch (err) {
        const s = err?.response?.status || err?.message;
        this.errorText = err?.response?.data?.detail || `Failed to load actors${s ? ` (${s})` : ''}`;
        console.error('[Actors] load failed:', s, err);
      } finally { this.loading = false; }
    },
    applyData (data) {
      if (data && Array.isArray(data.results)) {
        this.actors = data.results; this.count = data.count ?? this.actors.length;
        this.next = data.next || null; this.previous = data.previous || null;
      } else if (Array.isArray(data)) {
        this.actors = data; this.count = data.length; this.next = null; this.previous = null;
      } else {
        this.actors = []; this.count = 0; this.next = null; this.previous = null;
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
.actor-list { display:grid; gap:12px; padding:12px; }
.head { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.actions { display:flex; align-items:center; gap:8px; }
.muted { opacity:.7; }
.hint { opacity:.7; }
.err { color:#ff6b6b; }
.grid { list-style:none; padding:0; margin:0; display:grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap:12px; }
.card { border:1px solid #eee; border-radius:12px; background:#fff; padding:12px; display:grid; gap:6px; }
.row1 { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.name { font-weight:600; }
.id { opacity:.6; }
.meta { display:flex; flex-wrap:wrap; gap:8px; font-size:13px; opacity:.9; }
.pager { display:flex; gap:8px; margin-top:12px; }
</style>
