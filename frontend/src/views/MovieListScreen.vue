<template>
  <div v-if="active" class="movie-list-screen">
    <AddBtn v-if="isStaff" @click="handleMovieCreate" />

    <div class="filters">
      <CustomMultiselect
        :options="actors"
        :selected="selectedActorIds"
        @select="handleActorSelection"
        label="Актори"
      />

      <CustomMultiselect
        :options="genres"
        :selected="selectedGenreIds"
        @select="handleGenreSelection"
        label="Жанри"
      />
    </div>

    <div class="movies">
      <MovieCard
        v-for="movie in movies"
        :key="movie.id"
        :movie="movie"
        @click="handleMovieDetailsClick(movie.id)"
      />
      <div v-if="movies.length === 0" class="no-movies">
        Фільмів не знайдено за обраними параметрами.
      </div>
    </div>
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
  methods: {
    async fetchActors() {
      try {
        const { data } = await this.axios.get('/cinema/actors/');
        const actorsData = Array.isArray(data) ? data : (data.results || []);
        this.actors = actorsData.map(actor => ({
          id: actor.id,
          name: `${actor.first_name} ${actor.last_name}`
        }));
      } catch (err) {
        console.error('Actors fetch error:', err);
      }
    },
    async fetchGenres() {
      try {
        const { data } = await this.axios.get('/cinema/genres/');
        this.genres = Array.isArray(data) ? data : (data.results || []);
      } catch (err) {
        console.error('Genres fetch error:', err);
      }
    },
    async fetchMovies() {
      const params = {};
      if (this.selectedActorIds.length) params.actors = this.selectedActorIds.join(',');
      if (this.selectedGenreIds.length) params.genres = this.selectedGenreIds.join(',');

      try {
        const { data } = await this.axios.get('/cinema/movies/', { params });
        this.movies = Array.isArray(data) ? data : (data.results || []);
      } catch (err) {
        console.error('Movies fetch error:', err);
      }
    },
    debouncedFetchMovies: debounce(function() {
      this.fetchMovies();
    }, 500),

    handleActorSelection(id) {
      const index = this.selectedActorIds.indexOf(id);
      if (index > -1) {
        this.selectedActorIds.splice(index, 1);
      } else {
        this.selectedActorIds.push(id);
      }
      this.debouncedFetchMovies();
    },
    handleGenreSelection(id) {
      const index = this.selectedGenreIds.indexOf(id);
      if (index > -1) {
        this.selectedGenreIds.splice(index, 1);
      } else {
        this.selectedGenreIds.push(id);
      }
      this.debouncedFetchMovies();
    },
    hashHandler() {
      const hash = window.location.hash;
      this.active = Boolean(!hash || hash === '#/' || hash.includes('movies'));
    },
    handleMovieDetailsClick(id) {
      this.$router.push(`/movies/${id}`);
    },
    handleMovieCreate() {
      this.$router.push('/movies/add');
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
    this.fetchActors();
    this.fetchGenres();
    if (this.active) this.fetchMovies();
  },
  unmounted() {
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
.movie-list-screen {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px;
}
.filters {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.movies {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}
.no-movies {
  grid-column: 1 / -1;
  text-align: center;
  font-size: 18px;
  color: #888;
}
</style>
