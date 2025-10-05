<template>
  <div v-if="active && isStaff" class="movie-container">
    <div class="header">Add a movie</div>
    <div class="note">Please fill in the fields in details</div>

    <div class="container">
      <input-item label="Title" width="wide" v-model="title" />
      <input-item label="Duration" width="wide" v-model="duration" placeholder="142" />

      <custom-multiselect
        label="Actors"
        :options="actors"
        @option-selected="handleActorSelection"
        @click="!actors.length && fetchActors()"
      />

      <custom-multiselect
        label="Genres"
        :options="genres"
        @option-selected="handleGenreSelection"
        @click="!genres.length && fetchGenres()"
      />

      <image-uploader class="image-uploader" @upload="handleImageUpload" />

      <div class="description">
        <div class="label">Description</div>
        <div class="textarea-field">
          <textarea v-model="description"></textarea>
        </div>
      </div>
    </div>

    <action-button
      :label="loading ? 'Submitting…' : 'Submit'"
      @click="addMovie"
      :disabled="loading || !title || !duration || !description || !selectedActorIds.length || !selectedGenreIds.length"
    />

    <p v-if="errorText" style="color:#ff6b6b;margin-top:10px">{{ errorText }}</p>
    <p v-if="successText" style="color:#43d17a;margin-top:10px">{{ successText }}</p>
  </div>
</template>

<script>
import ActionButton from '../comps/ActionButton.vue';
import CustomMultiselect from '../comps/CustomMultiselect.vue';
import InputItem from '../comps/InputItem.vue';
import ImageUploader from '../comps/ImageUploader.vue';

export default {
  name: 'MovieAddScreen',
  props: { isStaff: { type: Boolean, default: false } },
  components: { InputItem, CustomMultiselect, ActionButton, ImageUploader },

  data: () => ({
    active: false,
    loading: false,
    title: '',
    duration: '',
    description: '',
    actors: [],
    genres: [],
    selectedActorIds: [],
    selectedGenreIds: [],
    image: null,
    errorText: '',
    successText: ''
  }),

  computed: {
    token() { return localStorage.getItem('access'); }
  },

  methods: {
    /* ---------- Helpers ---------- */
    baseUrl() {
      const env = (import.meta.env && import.meta.env.VITE_API_URL) || '';
      const base = env && env.trim() ? env.trim() : 'http://127.0.0.1:8080';
      return new URL('/', base).origin;
    },
    buildUrl(path) { return new URL(path, this.baseUrl()).toString(); },
    authHeader() { return this.token ? { Authorization: `Bearer ${this.token}` } : {}; },
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
    normalizeDuration(value) {
      if (typeof value === 'number') return value;
      if (!value) return null;
      const onlyDigits = String(value).match(/\d+/)?.[0];
      return onlyDigits ? parseInt(onlyDigits, 10) : null;
    },

    /* ---------- Fetchers ---------- */
    async fetchActors() {
      try {
        const url = this.buildUrl('/api/cinema/actors/');
        const { data } = await this.axios.get(url, { headers: this.authHeader() });
        this.actors = (data || []).map(({ id, first_name, last_name, full_name }) => ({
          id,
          name: full_name || `${first_name || ''} ${last_name || ''}`.trim()
        }));
      } catch (err) { console.error('[MovieAdd] fetchActors error:', err); }
    },
    async fetchGenres() {
      try {
        const url = this.buildUrl('/api/cinema/genres/');
        const { data } = await this.axios.get(url, { headers: this.authHeader() });
        this.genres = Array.isArray(data) ? data : [];
      } catch (err) { console.error('[MovieAdd] fetchGenres error:', err); }
    },

    /* ---------- Actions ---------- */
    async addMovie() {
      if (this.loading) return;
      if (!this.token) { location.hash = '#/sign-in'; return; }
      this.errorText = ''; this.successText = ''; this.loading = true;

      const duration = this.normalizeDuration(this.duration);
      const body = {
        title: this.title?.trim(),
        duration,
        description: this.description || '',
        actors: this.selectedActorIds,
        genres: this.selectedGenreIds
      };

      try {
        // 1) Cria o filme (JSON)
        const createUrl = this.buildUrl('/api/cinema/movies/');
        const { data: movie } = await this.axios.post(createUrl, body, {
          headers: { ...this.authHeader(), 'Content-Type': 'application/json' }
        });

        // 2) Se imagem -> upload via multipart (deixe o browser setar o boundary)
        if (this.image && movie?.id) {
          const form = new FormData();
          form.append('image', this.image);
          const uploadUrl = this.buildUrl(`/api/cinema/movies/${movie.id}/upload-image/`);

          const cfg = { headers: { ...this.authHeader() } };
          delete cfg.headers['Content-Type']; // <- importante!

          await this.axios.post(uploadUrl, form, cfg);
        }

        this.successText = '✅ Movie created successfully!';
        setTimeout(() => { location.hash = '#/movies'; }, 1000);
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('access'); localStorage.removeItem('refresh');
          location.hash = '#/sign-in';
        }
        this.errorText = this.prettyErr(err);
        console.error('[MovieAdd] POST error:', err);
      } finally {
        this.loading = false;
      }
    },

    handleActorSelection(id) {
      this.selectedActorIds = this.selectedActorIds.includes(id)
        ? this.selectedActorIds.filter(a => a !== id)
        : [...this.selectedActorIds, id];
    },
    handleGenreSelection(id) {
      this.selectedGenreIds = this.selectedGenreIds.includes(id)
        ? this.selectedGenreIds.filter(g => g !== id)
        : [...this.selectedGenreIds, id];
    },
    handleImageUpload(file) { this.image = file; },

    hashHandler() {
      this.active = Boolean(location.hash.match(/movies\?add=true$/));
    }
  },

  watch: {
    active(val) {
      if (val) {
        // limpa o formulário ao entrar
        this.title = '';
        this.duration = '';
        this.description = '';
        this.selectedActorIds = [];
        this.selectedGenreIds = [];
        this.image = null;
        this.errorText = '';
        this.successText = '';
        // carrega selects
        this.fetchActors();
        this.fetchGenres();
      }
    }
  },

  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
  },
  beforeDestroy() {
    window.removeEventListener('hashchange', this.hashHandler);
  }
};
</script>

<style scoped>
.movie-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}
.header { font-weight: 600; font-size: 50px; line-height: 61px; }
.note { font-size: 25px; line-height: 31px; }

.container {
  width: 100%;
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  grid-template-columns: repeat(2, 1fr);
  column-gap: 100px;
  row-gap: 24px;
  margin-bottom: 36px;
}
.image-uploader { grid-column: 2; grid-row: 1; }

.description {
  grid-column: 2;
  grid-row: 2 / span 4;
  display: flex;
  flex-direction: column;
}
.description .label {
  font-weight: 600; font-size: 18px; line-height: 22px; margin-bottom: 8px;
}
.textarea-field {
  height: 100%; max-height: 300px; background-color: var(--secondary-bg);
  border-radius: 10px;
}
.textarea-field:focus-within { border: 1px solid var(--border); }

textarea {
  border-radius: 10px; background-color: inherit; height: 100%; width: 100%;
  resize: none; border: none; padding: 10px; font-size: 14px; color: var(--main-font);
}
textarea:focus-visible { outline: none; }
</style>
