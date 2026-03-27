<template>
  <div v-if="active && isStaff" class="movie-list-screen">
    <AddBtn @click="handleMovieCreate" />

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
// Перевірте шляхи до API згідно з вашою структурою api/cinema/
import { getMovies } from '@/api/cinema/movies';
import { getActors } from '@/api/cinema/actors';
import { getGenres } from '@/api/cinema/genres';

export default {
  name: 'MovieListScreen',
  props: {
    isStaff: {
      type: Boolean,
      default: true
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
    token() {
      return localStorage.getItem('access');
    }
  },
  methods: {
    async fetchActors() {
      try {
        const { data } = await getActors(this.token);
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
        const { data } = await getGenres(this.token);
        this.genres = Array.isArray(data) ? data : (data.results || []);
      } catch (err) {
        console.error('Genres fetch error:', err);
      }
    },
    async fetchMovies() {
      const params = {};
      // Django REST Framework часто очікує фільтри через кому (actors=1,2,3)
      if (this.selectedActorIds.length) params.actors = this.selectedActorIds.join(',');
      if (this.selectedGenreIds.length) params.genres = this.selectedGenreIds.join(',');

      try {
        const { data } = await getMovies(this.token, params);
        // Обробка пагінації: якщо є results — беремо їх, якщо ні — весь масив
        this.movies = Array.isArray(data) ? data : (data.results || []);
      } catch (err) {
        console.error('Movies fetch error:', err);
      }
    },
    // Оновлений дебаунс для Vue 3
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
      // Більш чітке правило для головної сторінки фільмів
      this.active = Boolean(
        !hash ||
        hash === '#/' ||
        hash.includes('movies')
      );
    },
    handleMovieDetailsClick(id) {
      window.location.hash = `#/movies/${id}`;
    },
    handleMovieCreate() {
      window.location.hash = '#/movies?add=true';
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
    this.fetchActors();
    this.fetchGenres();
    if (this.active) this.fetchMovies();
  },
  watch: {
    active(newVal) {
      if (newVal) this.fetchMovies();
    }
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
