<template>
  <div v-if="active" class="modal-wrapper" @mousedown.self="handleMovieDetailsClose">
    <movie-modal
      :movie="movie"
      @close-movie-details="handleMovieDetailsClose"
      ref="modal"
    ></movie-modal>
  </div>
</template>

<script>
import MovieModal from '../comps/MovieModal.vue';

export default {
  name: 'MovieDetailsScreen',
  data: () => ({
    active: false,
    movie: {}
  }),
  methods: {
    hashHandler() {
      const match = window.location.hash.match(/#\/movies\/(\d+)/);
      if (!match) {
        this.active = false;
        this.movie = {};
        return;
      }

      const id = match[1];
      this.active = true;
      this.fetchMovie(id);
    },
    async fetchMovie(id) {
      if (!id) return;
      try {
        const { data } = await this.axios.get(`/cinema/movies/${id}/`);
        this.movie = data;
      } catch (err) {
        console.error('Failed to fetch movie details:', err);
        if (err.response?.status === 404) this.handleMovieDetailsClose();
      }
    },
    handleMovieDetailsClose() {
      window.location.hash = '#/movies';
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
  },
  unmounted() {
    window.removeEventListener('hashchange', this.hashHandler);
  },
  components: { MovieModal }
};
</script>

<style scoped>
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  box-sizing: border-box;
}
</style>
