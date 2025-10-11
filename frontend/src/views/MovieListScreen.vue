<template>
  <div class="screen">
    <div class="head">
      <h1>Movies</h1>
      <div class="actions">
        <button @click="reload" :disabled="loading">Reload</button>
        <span v-if="count !== null" class="count">Total: {{ count }}</span>
        <span v-if="isStaff" class="badge">Staff</span>
      </div>
    </div>

    <div v-if="error" class="alert">{{ error }}</div>
    <div v-else-if="loading" class="hint">Loading movies…</div>
    <div v-else>
      <div v-if="movies.length === 0" class="hint">No movies yet.</div>

      <ul class="grid">
        <li v-for="m in movies" :key="m.id" class="card">
          <div class="poster" v-if="imageUrl(m)">
            <img :src="imageUrl(m)" :alt="m.title">
          </div>
          <div class="info">
            <div class="title">{{ m.title }}</div>
            <div class="meta">
              <span v-if="m.duration">⏱ {{ m.duration }} min</span>
            </div>
            <div class="chips">
              <span v-for="g in (m.genres || [])" :key="'g'+g" class="chip">#{{ g }}</span>
              <span v-for="a in (m.actors || [])" :key="'a'+a" class="chip">@{{ a }}</span>
            </div>
          </div>
        </li>
      </ul>

      <!-- Paginação simples (se seu DRF vier paginado) -->
      <div v-if="paginated" class="pager">
        <button @click="goPrev" :disabled="!prev || loading">Prev</button>
        <button @click="goNext" :disabled="!next || loading">Next</button>
      </div>
    </div>
  </div>
</template>

<script>
// Usa seus helpers do index.js que você já adaptou
import { fetchMovies, getBaseUrl, initTokensFromStorage } from "@/api";

export default {
  name: "MovieListScreen",
  props: {
    isStaff: { type: Boolean, default: false },
  },
  data() {
    return {
      movies: [],
      count: null,
      next: null,
      prev: null,
      loading: false,
      error: null,
      baseUrl: (getBaseUrl && getBaseUrl()) || ""
    };
  },
  computed: {
    paginated() {
      // quando DRF usa {count,next,previous,results}
      return this.next !== null || this.prev !== null;
    },
  },
  created() {
    // Garante que tokens do localStorage estejam na memória do cliente axios
    if (typeof initTokensFromStorage === "function") {
      initTokensFromStorage();
    }
  },
  mounted() {
    this.reload();
  },
  methods: {
    async reload(url = null) {
      this.loading = true;
      this.error = null;
      try {
        // Se foi passado next/previous (URL absoluta do backend), chamamos via fetch nativo
        if (url) {
          const headers = {};
          // Reutiliza o access direto do localStorage no fallback de paginação
          const token = localStorage.getItem("auth_access");
          if (token) headers["Authorization"] = `Bearer ${token}`;
          const res = await fetch(url, { headers });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          this.applyData(data);
          return;
        }

        // Chamada normal via axios wrapper
        const data = await fetchMovies();
        this.applyData(data);
      } catch (e) {
        console.error(e);
        this.error = "Falha ao carregar filmes";
      } finally {
        this.loading = false;
      }
    },

    applyData(data) {
      // Lida com ambos formatos: paginado (DRF) e não paginado
      if (data && typeof data === "object" && Array.isArray(data.results)) {
        this.movies = data.results;
        this.count = data.count ?? this.movies.length;
        this.next = data.next || null;
        this.prev = data.previous || null;
      } else if (Array.isArray(data)) {
        this.movies = data;
        this.count = data.length;
        this.next = null;
        this.prev = null;
      } else {
        this.movies = [];
        this.count = 0;
        this.next = null;
        this.prev = null;
      }
    },

    goNext() {
      if (this.next) this.reload(this.next);
    },
    goPrev() {
      if (this.prev) this.reload(this.prev);
    },

    imageUrl(movie) {
      const img = movie && movie.image;
      if (!img) return "";
      // se já vier absoluta, retorna direto
      if (/^https?:\/\//i.test(img)) return img;
      // se vier relativa (/media/...), prefixa base do backend
      const base = (this.baseUrl || "").replace(/\/+$/, "");
      const path = String(img).replace(/^\/+/, "");
      return base ? `${base}/${path}` : `/${path}`;
    },
  },
};
</script>

<style scoped>
.screen { padding: 16px; }
.head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
.actions { display:flex; align-items:center; gap:8px; }
.count { opacity: .7; }
.badge { background:#eef; color:#224; padding:2px 8px; border-radius:12px; font-size:12px; }
.alert { background:#fee; color:#a00; padding:10px; border-radius:8px; }
.hint { opacity:.7; }
.grid { list-style:none; padding:0; margin:0; display:grid; grid-template-columns: repeat(auto-fill,minmax(220px,1fr)); gap:12px; }
.card { border:1px solid #eee; border-radius:12px; overflow:hidden; background:#fff; display:flex; gap:10px; }
.poster img { width:120px; height:160px; object-fit:cover; display:block; }
.info { padding:10px; flex:1; }
.title { font-weight:600; margin-bottom:6px; }
.meta { font-size:12px; opacity:.8; margin-bottom:6px; }
.chips { display:flex; flex-wrap:wrap; gap:6px; }
.chip { background:#f3f4f6; padding:2px 8px; border-radius:10px; font-size:12px; }
.pager { display:flex; gap:8px; margin-top:12px; }
</style>
