<template>
  <div v-if="active">
    <div class="multi-selections">
      <custom-multiselect
        label="Select actors"
        :options="actors"
        @option-selected="handleActorSelection"
      ></custom-multiselect>
      <custom-multiselect
        label="Select genres"
        :options="genres"
        @option-selected="handleGenreSelection"
      ></custom-multiselect>
    </div>
    <div class="movie-container">
      <movie-card
        v-for="movie in movies"
        :key="movie.id"
        v-bind="movie"
        @click="handleMovieDetailsClick"
      ></movie-card>
    </div>
    <add-btn
      v-if="isStaff"
      @click.native="handleMovieCreate"
    ></add-btn>
  </div>
</template>

<script>
import debounce from 'lodash.debounce';

import CustomMultiselect from '../comps/CustomMultiselect.vue';
import MovieCard from '../comps/MovieCard.vue';
import AddBtn from '../comps/AddBtn.vue';

export default {
  name: 'MovieListScreen',
  props: {
    isStaff: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    active: false,
    movies: [],
    actors: [],
    genres: [],
    selectedActorIds: [],
    selectedGenreIds: []
  }),
  computed: {
    token () {
      return localStorage.getItem('access');
    }
  },
  methods: {
    async fetchActors () {
      try {
        const { data: actors } = await this.axios.get(`${import.meta.env.VITE_API_URL}/api/cinema/actors`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });

        if (Array.isArray(actors)) {
          this.actors = actors
            .filter(actor => actor && typeof actor === 'object')
            .map(actor => {
              const firstName = actor.first_name || actor.firstName || '';
              const lastName = actor.last_name || actor.lastName || '';
              const fullName = `${firstName} ${lastName}`.trim();

              return {
                id: actor.id,
                name: fullName || 'Unknown Actor'
              };
            });
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
        this.genres = Array.isArray(genres) ? genres : [];
      } catch (err) {
        console.error(err?.response?.data || err);
      }
    },

    async fetchMovies () {
      const params = {};
      if (this.selectedActorIds.length) params.actors = this.selectedActorIds.join();
      if (this.selectedGenreIds.length) params.genres = this.selectedGenreIds.join();

      try {
        const { data: movies } = await this.axios.get(`${import.meta.env.VITE_API_URL}/api/cinema/movies`, {
          headers: { Authorization: `Bearer ${this.token}` },
          params
        });

        this.movies = Array.isArray(movies) ? movies : [];
      } catch (err) {
        console.error(err?.response?.data || err);
      }
    },

    dispatchActorSelection: debounce(function () {
      this.fetchMovies();
    }, 300),

    dispatchGenreSelection: debounce(function () {
      this.fetchMovies();
    }, 300),

    handleActorSelection (id) {
      if (this.selectedActorIds.includes(id)) {
        this.selectedActorIds = this.selectedActorIds.filter(actorId => actorId !== id);
      } else {
        this.selectedActorIds.push(id);
      }

      this.dispatchActorSelection();
    },

    handleGenreSelection (id) {
      if (this.selectedGenreIds.includes(id)) {
        this.selectedGenreIds = this.selectedGenreIds.filter(genreId => genreId !== id);
      } else {
        this.selectedGenreIds.push(id);
      }
      this.dispatchGenreSelection();
    },

    hashHandler () {
      const isAdding = location.hash.includes('add=true');
      const isDetails = Boolean(location.hash.match(/#\/movies\/\d+/));
      const isMoviePage = !location.hash || location.hash.includes('#/movies') || location.hash === '#/';
      this.active = isMoviePage && !isAdding && !isDetails;
    },

    handleMovieDetailsClick (id) {
      location.hash = `#/movies/${id}`;
    },

    handleMovieCreate () {
      location.hash = '#/movies?add=true';
    }
  },
  mounted () {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();

    this.fetchActors();
    this.fetchGenres();
    this.fetchMovies();
  },
  watch: {
    active () {
      if (this.active) {
        this.fetchMovies();
      }
    }
  },
  beforeDestroy () {
    window.removeEventListener('hashchange', this.hashHandler);
  },
  components: {
    CustomMultiselect,
    MovieCard,
    AddBtn
  }
};
</script>

<style scoped>
.multi-selections {
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
</style>
