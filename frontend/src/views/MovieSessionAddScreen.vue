<template>
  <div v-if="active && isStaff" class="movie-session-container">
    <div class="header">Add a movie session</div>
    <div class="note">Please fill in the fields in details</div>
    <div class="container">
      <custom-select
        label="Movie"
        :options="movieOptions"
        @option-selected="handleMovieSelection"
      ></custom-select>

      <custom-select
        label="Cinema Hall"
        :options="cinemaHallOptions"
        @option-selected="handleHallSelection"
      ></custom-select>

      <div class="date-container">
        <date-picker v-model="date"></date-picker>
        <time-picker v-model="time"></time-picker>
      </div>
    </div>
    <action-button
      label="Submit"
      @click="addMovieSession"
      :disabled="!selectedHallId || !selectedMovieId"
    ></action-button>
  </div>
</template>

<script>
import DatePicker from '../comps/DatePicker.vue';
import ActionButton from '../comps/ActionButton.vue';
import TimePicker from '../comps/TimePicker.vue';
import CustomSelect from '../comps/CustomSelect.vue';

export default {
  name: 'AddMovieSessionScreen',
  props: {
    isStaff: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    active: false,
    movies: [],
    cinemaHalls: [],
    date: new Date(),
    time: new Date(),
    selectedMovieId: null,
    selectedHallId: null
  }),
  computed: {
    movieOptions() {
      return this.movies.map(movie => ({
        name: movie.title,
        id: movie.id
      }));
    },
    cinemaHallOptions() {
      return this.cinemaHalls.map(hall => ({
        name: hall.name,
        id: hall.id
      }));
    }
  },
  methods: {
    hashHandler() {
      this.active = Boolean(window.location.hash.includes('movie-sessions') && window.location.hash.includes('add=true'));
    },
    async fetchData() {
      try {
        const [moviesRes, hallsRes] = await Promise.all([
          this.axios.get('/cinema/movies/'),
          this.axios.get('/cinema/cinema-halls/')
        ]);

        this.movies = Array.isArray(moviesRes.data) ? moviesRes.data : (moviesRes.data.results || []);
        this.cinemaHalls = Array.isArray(hallsRes.data) ? hallsRes.data : (hallsRes.data.results || []);
      } catch (err) {
        console.error('Error fetching data for session:', err);
      }
    },
    async addMovieSession() {
      const finalDateTime = new Date(this.date);
      const timeObj = new Date(this.time);

      finalDateTime.setHours(timeObj.getHours());
      finalDateTime.setMinutes(timeObj.getMinutes());
      finalDateTime.setSeconds(0);

      try {
        await this.axios.post('/cinema/movie-sessions/', {
          movie: this.selectedMovieId,
          cinema_hall: this.selectedHallId,
          show_time: finalDateTime.toISOString()
        });

        this.$router.push('/movie-sessions');
      } catch (err) {
        console.error('Failed to create session:', err);
        alert('Помилка при створенні сеансу');
      }
    },
    handleMovieSelection(movieId) {
      this.selectedMovieId = movieId;
    },
    handleHallSelection(hallId) {
      this.selectedHallId = hallId;
    }
  },
  watch: {
    active(newVal) {
      if (newVal) this.fetchData();
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
    if (this.active) this.fetchData();
  },
  unmounted() {
    window.removeEventListener('hashchange', this.hashHandler);
  },
  components: {
    DatePicker,
    ActionButton,
    TimePicker,
    CustomSelect
  }
};
</script>

<style scoped>
.movie-session-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
.header {
  font-weight: 600;
  font-size: 40px;
}
.note {
  font-size: 18px;
  color: #666;
}
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.date-container {
  display: flex;
  gap: 20px;
}
</style>
