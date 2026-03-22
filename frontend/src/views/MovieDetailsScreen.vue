<template>
  <div v-if="active" class="modal-wrapper" @click="handleClick">
    <movie-modal :movie="movie" @close-movie-details="handleMovieDetailsClose" ref="modal"></movie-modal>
  </div>
</template>

<script>
import MovieModal from '../comps/MovieModal.vue';
import { getMovieDetails } from '@/api/cinema/movies';

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
    handleClick (evt) {
      if (evt.target !== this.$el) return;
      this.handleMovieDetailsClose();
    },
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
        const { data } = await getMovieDetails(this.token, id);
        this.movie = data;
      } catch (err) {
        console.error(err.response?.data || err);
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
  background: rgba(210, 210, 210, 0.1);
  backdrop-filter: blur(7.5px);
  z-index: 1;
  padding: 80px 145px !important;
}
</style>
