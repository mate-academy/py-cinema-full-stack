<template>
  <div v-if="active" class="modal-wrapper" @click="handleClick">
    <movie-modal :movie="movie" @close-movie-details="handleMovieDetailsClose" ref="modal"></movie-modal>
  </div>
</template>

<script>
import MovieModal from '../comps/MovieModal.vue';

export default {
  data: () => ({
    active: false,
    movie: {},
    actorsMap: {},
    genresMap: {}
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
      this.loadData(id);
    },

    async fetchActors () {
      try {
        const { data: actors } = await this.axios.get(`${import.meta.env.VITE_API_URL}/api/cinema/actors`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });

        if (Array.isArray(actors)) {
          const map = {};
          actors.forEach(actor => {
            const firstName = actor.first_name || actor.firstName || '';
            const lastName = actor.last_name || actor.lastName || '';
            map[actor.id] = actor.name || `${firstName} ${lastName}`.trim();
          });
          this.actorsMap = map;
        }
      } catch (err) {
        console.error(err?.response?.data || err);
      }
    },

    async fetchGenres () {
      try {
        const { data: genres } = await this.axios.get(`${import.meta.env.VITE_API_URL}/api/cinema/genres`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });

        if (Array.isArray(genres)) {
          const map = {};
          genres.forEach(genre => {
            map[genre.id] = genre.name || genre.title;
          });
          this.genresMap = map;
        }
      } catch (err) {
        console.error(err?.response?.data || err);
      }
    },

    async fetchMovie (id) {
      try {
        const { data: movie } = await this.axios.get(`${import.meta.env.VITE_API_URL}/api/cinema/movies/${id}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });

        // Обробляємо випадок, якщо актори прийшли у вигляді масиву ID
        const processedActors = Array.isArray(movie.actors)
          ? movie.actors.map(actor => {
            if (typeof actor === 'number' || typeof actor === 'string') {
              return this.actorsMap[actor] || `Actor #${actor}`;
            }
            return actor;
          })
          : [];

        // Обробляємо випадок, якщо жанри прийшли у вигляді масиву ID
        const processedGenres = Array.isArray(movie.genres)
          ? movie.genres.map(genre => {
            if (typeof genre === 'number' || typeof genre === 'string') {
              return this.genresMap[genre] || `Genre #${genre}`;
            }
            return genre;
          })
          : [];

        this.movie = {
          ...movie,
          actors: processedActors,
          genres: processedGenres
        };
      } catch (err) {
        console.error(err?.response?.data || err);
      }
    },

    async loadData (id) {
      if (!Object.keys(this.actorsMap).length || !Object.keys(this.genresMap).length) {
        await Promise.all([this.fetchActors(), this.fetchGenres()]);
      }
      await this.fetchMovie(id);
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
  z-index: 100;
  padding: 80px 145px !important;
}
</style>
