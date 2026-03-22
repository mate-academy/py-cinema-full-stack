<script>
import debounce from 'lodash.debounce';
import CustomMultiselect from '../comps/CustomMultiselect.vue';
import MovieCard from '../comps/MovieCard.vue';
import AddBtn from '../comps/AddBtn.vue';
import { getMovies } from '@/api/cinema/movies';
import { getActors } from '@/api/cinema/actors';
import { getGenres } from '@/api/cinema/genres';

export default {
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
        const { data } = await getActors(this.token);
        this.actors = data.map(({ id, first_name: firstName, last_name: lastName }) => ({
          id,
          name: `${firstName} ${lastName}`
        }));
      } catch (err) {
        console.error(err);
      }
    },
    async fetchGenres () {
      try {
        const { data } = await getGenres(this.token);
        this.genres = data;
      } catch (err) {
        console.error(err);
      }
    },
    async fetchMovies () {
      const params = {};
      if (this.selectedActorIds.length) params.actors = this.selectedActorIds.join();
      if (this.selectedGenreIds.length) params.genres = this.selectedGenreIds.join();
      try {
        const { data } = await getMovies(this.token, params);
        this.movies = data;
      } catch (err) {
        console.error(err);
      }
    },
    dispatchActorSelection: debounce(function () {
      this.fetchMovies();
    }, 1000),
    dispatchGenreSelection: debounce(function () {
      this.fetchMovies();
    }, 1000),
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
      this.active = Boolean(
        !location.hash || location.hash.match('movies$') ||
        location.hash.match(/#\/movies\/(\d+)/) || location.hash.match('/$')
      );
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
