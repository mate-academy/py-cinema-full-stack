<template>
  <div v-if="active" class="modal-wrapper" @click.self="handleMovieDetailsClose">
    <div class="movie-details-window">
      <div class="content-wrapper">
        <movie-modal
          :movie="movie"
          @close-movie-details="handleMovieDetailsClose"
          ref="modal">
        </movie-modal>
      </div>
    </div>
  </div>
</template>

<script>
import MovieModal from '../comps/MovieModal.vue';
export default {
  data: () => ({
    active: false,
    movie: {}
  }),
  computed: {
    token () {
      return localStorage.getItem('access');
    }
  },
  methods: {
    hashHandler () {
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

    async fetchMovie (id) {
      try {
        const { data: movie } = await this.axios.get(`${import.meta.env.VITE_API_URL}/api/cinema/movies/${id}/`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });

        this.movie = movie;
      } catch (err) {
        console.error(err.response.data);
      }
    },

    handleMovieDetailsClose () {
      location.hash = '#/movies';
    }
  },
  mounted () {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
  },
  beforeDestroy () {
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
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 40px;
}

.movie-details-window {
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 8px;
  position: relative;
}
</style>
