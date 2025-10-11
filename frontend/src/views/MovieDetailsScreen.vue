<template>
  <div v-if="active" class="modal-wrapper" @click="handleClick">
    <movie-modal
      :movie="movie"
      @close-movie-details="handleMovieDetailsClose"
      ref="modal"
    />
  </div>
</template>

<script>
import api from '@/api';
import MovieModal from '../comps/MovieModal.vue';

export default {
  name: 'MovieDetailsScreen',
  components: { MovieModal },

  data: () => ({
    active: false,
    movie: {}
  }),

  computed: {
    token() {
      return localStorage.getItem('access');
    }
  },

  methods: {
    handleClick(evt) {
      if (evt.target !== this.$el) return;
      this.handleMovieDetailsClose();
    },

    hashHandler() {
      const match = location.hash.match(/#\/movies\/(\d+)/);
      if (!match) {
        this.active = false;
        this.movie = {};
        return;
      }
      const [, id] = match;
      if (!id) {
        this.active = false;
        return;
      }
      this.active = true;
      this.fetchMovie(id);
    },

    authHeader() {
      return this.token ? { Authorization: `Bearer ${this.token}` } : {};
    },

    prettyErr(err) {
      const res = err?.response;
      if (!res) return err?.message || 'Network error';
      if (res.data && typeof res.data === 'object') {
        const first = Object.values(res.data)[0];
        if (Array.isArray(first)) return first[0];
        if (typeof first === 'string') return first;
      }
      return res.data?.detail || res.data?.error || `HTTP ${res.status}`;
    },

    async fetchMovie(id) {
      try {
        const { data: movie } = await api.get(
          `/api/cinema/movies/${id}/`,
          { headers: this.authHeader() }
        );
        this.movie = movie || {};
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[movie details] error:', this.prettyErr(err));
      }
    },

    handleMovieDetailsClose() {
      location.hash = '#/movies';
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
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(210, 210, 210, 0.1);
  backdrop-filter: blur(7.5px);
  z-index: 1;
  padding: 80px 145px !important;
}
</style>
