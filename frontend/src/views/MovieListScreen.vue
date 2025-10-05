<template>
  <div v-if="active">
    <div class="multiselections">
      <custom-multiselect
        label="Select actors"
        :options="actors"
        @option-selected="handleActorSelection"
        @click="!actors.length && fetchActors()"
      />
      <custom-multiselect
        label="Select genres"
        :options="genres"
        @option-selected="handleGenreSelection"
        @click="!genres.length && fetchGenres()"
      />
    </div>

    <div class="movie-container">
      <movie-card
        v-for="movie in movies"
        :key="movie.id"
        v-bind="movie"
        :can-edit="isStaff"
        @upload-poster="handleUploadPoster"
        @click="handleMovieDetailsClick"
      />
    </div>

    <!-- Paginação -->
    <div class="pager">
      <button class="pager-btn" @click="prevPage" :disabled="offset === 0 || loading">
        ‹ Prev
      </button>
      <span class="pager-info">
        <span v-if="totalCount > 0">
          {{ pageFrom }}–{{ pageTo }} de {{ totalCount }}
        </span>
        &nbsp; | &nbsp; limit:
        <select v-model.number="limit" @change="resetAndFetch" :disabled="loading">
          <option :value="3">3</option>
          <option :value="6">6</option>
          <option :value="9">9</option>
          <option :value="12">12</option>
        </select>
      </span>
      <button
        class="pager-btn"
        @click="nextPage"
        :disabled="offset + limit >= totalCount || loading"
      >
        Next ›
      </button>
    </div>

    <add-btn v-if="isStaff" @click="handleMovieCreate" />

    <p v-if="errorText" style="color:#ff6b6b;margin-top:12px">{{ errorText }}</p>
  </div>
</template>

<script>
import debounce from 'lodash.debounce';
import CustomMultiselect from '../comps/CustomMultiselect.vue';
import MovieCard from '../comps/MovieCard.vue';
import AddBtn from '../comps/AddBtn.vue';

export default {
  name: 'MovieListScreen',
  props: { isStaff: { type: Boolean, default: false } },
  components: { CustomMultiselect, MovieCard, AddBtn },

  data: () => ({
    active: false,
    loading: false,
    movies: [],
    actors: [],
    genres: [],
    selectedActorIds: [],
    selectedGenreIds: [],
    errorText: '',
    // paginação
    limit: 6,
    offset: 0,
    totalCount: 0
  }),

  computed: {
    token () { return localStorage.getItem('access'); },
    pageFrom () { return this.totalCount ? this.offset + 1 : 0; },
    pageTo () {
      const to = this.offset + this.movies.length;
      return to > this.totalCount ? this.totalCount : to;
    }
  },

  methods: {
    /* ---------- Helpers ---------- */
    baseUrl () {
      const env = (import.meta.env && import.meta.env.VITE_API_URL) || '';
      const base = env && env.trim() ? env.trim() : 'http://127.0.0.1:8080';
      return new URL('/', base).origin;
    },
    buildUrl (path) { return new URL(path, this.baseUrl()).toString(); },
    authHeader () { return this.token ? { Authorization: `Bearer ${this.token}` } : {}; },
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

    /* ---------- Upload do pôster ---------- */
    async handleUploadPoster ({ id, file }) {
      if (!file || !id) return;
      if (!this.token) { location.hash = '#/sign-in'; return; }
      try {
        const form = new FormData();
        form.append('image', file);
        const url = this.buildUrl(`/api/cinema/movies/${id}/upload-image/`);
        await this.axios.post(url, form, { headers: { ...this.authHeader() } });
        await this.fetchMovies();
      } catch (err) {
        console.error('[upload poster] error:', err);
        this.errorText = this.prettyErr(err);
      }
    },

    /* ---------- Fetchers ---------- */
    async fetchActors () {
      if (!this.token) { location.hash = '#/sign-in'; return; }
      this.errorText = '';
      try {
        const url = this.buildUrl('/api/cinema/actors/');
        const { data } = await this.axios.get(url, { headers: this.authHeader() });
        this.actors = data.map(({ id, first_name: firstName, last_name: lastName, full_name: fullName }) => ({
          id,
          name: fullName || `${firstName || ''} ${lastName || ''}`.trim()
        }));
      } catch (err) {
        console.error('[actors] error:', err);
        this.errorText = this.prettyErr(err);
      }
    },

    async fetchGenres () {
      if (!this.token) { location.hash = '#/sign-in'; return; }
      this.errorText = '';
      try {
        const url = this.buildUrl('/api/cinema/genres/');
        const { data } = await this.axios.get(url, { headers: this.authHeader() });
        this.genres = Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('[genres] error:', err);
        this.errorText = this.prettyErr(err);
      }
    },

    async fetchMovies () {
      if (!this.token) { location.hash = '#/sign-in'; return; }
      this.errorText = '';
      this.loading = true;

      const params = {};
      if (this.selectedActorIds.length) params.actors = this.selectedActorIds.join(',');
      if (this.selectedGenreIds.length) params.genres = this.selectedGenreIds.join(',');
      params.limit = this.limit;
      params.offset = this.offset;

      try {
        const url = this.buildUrl('/api/cinema/movies/');
        const { data } = await this.axios.get(url, { headers: this.authHeader(), params });

        // ✅ Aceita array (sem paginação) OU objeto {count, results}
        if (Array.isArray(data)) {
          this.movies = data;
          this.totalCount = data.length;
        } else {
          this.movies = Array.isArray(data?.results) ? data.results : [];
          this.totalCount = typeof data?.count === 'number' ? data.count : this.movies.length;
        }
      } catch (err) {
        console.error('[movies] error:', err);
        if (err?.response?.status === 401) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          location.hash = '#/sign-in';
        }
        this.movies = [];
        this.totalCount = 0;
        this.errorText = this.prettyErr(err);
      } finally {
        this.loading = false;
      }
    },

    /* ---------- Debounced filters ---------- */
    dispatchActorSelection: debounce(function () {
      this.offset = 0;
      this.fetchMovies();
    }, 500),

    dispatchGenreSelection: debounce(function () {
      this.offset = 0;
      this.fetchMovies();
    }, 500),

    /* ---------- UI handlers ---------- */
    handleActorSelection (id) {
      this.selectedActorIds = this.selectedActorIds.includes(id)
        ? this.selectedActorIds.filter(actorId => actorId !== id)
        : [...this.selectedActorIds, id];
      this.dispatchActorSelection();
    },

    handleGenreSelection (id) {
      this.selectedGenreIds = this.selectedGenreIds.includes(id)
        ? this.selectedGenreIds.filter(genreId => genreId !== id)
        : [...this.selectedGenreIds, id];
      this.dispatchGenreSelection();
    },

    // paginação
    nextPage () {
      if (this.offset + this.limit >= this.totalCount) return;
      this.offset += this.limit;
      this.fetchMovies();
    },
    prevPage () {
      this.offset = Math.max(0, this.offset - this.limit);
      this.fetchMovies();
    },
    resetAndFetch () {
      this.offset = 0;
      this.fetchMovies();
    },

    hashHandler () {
      this.active = Boolean(
        !location.hash ||
        /#\/movies$/.test(location.hash) ||
        /#\/movies\/(\d+)$/.test(location.hash) ||
        /\/$/.test(location.hash)
      );
    },

    handleMovieDetailsClick (id) { location.hash = `#/movies/${id}`; },
    handleMovieCreate () { location.hash = '#/movies?add=true'; }
  },

  mounted () {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
  },

  watch: {
    active (val) { if (val) this.fetchMovies(); }
  },

  beforeDestroy () { window.removeEventListener('hashchange', this.hashHandler); }
};
</script>

<style scoped>
.multiselections {
  display: flex;
  gap: 100px;
}

.movie-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 40px;
  row-gap: 60px;
  margin-top: 60px;
}

/* Paginação moderna e integrada ao tema escuro */
.pager {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  margin: 32px 0 20px;
}

.pager-btn {
  color: #f9f9f9;
  border: 1px solid #444;
  background: linear-gradient(180deg, #1a1a1a, #111);
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.25s ease;
  cursor: pointer;
}

.pager-btn:hover:not([disabled]) {
  background: #f9f9f9;
  color: #111;
  border-color: #f9f9f9;
  transform: translateY(-1px);
}

.pager-btn[disabled] {
  opacity: 0.4;
  cursor: not-allowed;
  background: #222;
  border-color: #333;
}

.pager-info {
  opacity: 0.8;
  display: flex;
  gap: 6px;
  align-items: center;
  color: #ccc;
  font-size: 0.95rem;
}

.pager-info select {
  background: #111;
  color: #f9f9f9;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 3px 8px;
  outline: none;
  transition: all 0.2s ease;
}

.pager-info select:hover { border-color: #888; }
</style>
