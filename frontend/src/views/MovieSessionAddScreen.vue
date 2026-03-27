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

// Перевірте шляхи імпорту згідно з вашою структурою api/cinema/...
import { getMovies } from '@/api/cinema/movies';
import { createMovieSession } from '@/api/cinema/movieSessions';
import { getCinemaHalls } from '@/api/cinema/cinemaHalls';

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
    },
    token() {
      return localStorage.getItem('access');
    }
  },
  methods: {
    hashHandler() {
      // Екранування зворотної косої риски для коректної роботи регулярного виразу
      this.active = Boolean(window.location.hash.match('movie-sessions\\?add=true'));
    },
    async fetchData() {
      if (!this.token) return;
      try {
        const [moviesRes, hallsRes] = await Promise.all([
          getMovies(this.token),
          getCinemaHalls(this.token)
        ]);

        // Обробка пагінації (results), якщо вона є на бекенді
        this.movies = Array.isArray(moviesRes.data) ? moviesRes.data : (moviesRes.data.results || []);
        this.cinemaHalls = Array.isArray(hallsRes.data) ? hallsRes.data : (hallsRes.data.results || []);
      } catch (err) {
        console.error('Error fetching data for session:', err.response?.data || err);
      }
    },
    async addMovieSession() {
      // Формуємо фінальну дату та час
      const finalDateTime = new Date(this.date);
      const timeObj = new Date(this.time);

      finalDateTime.setHours(timeObj.getHours());
      finalDateTime.setMinutes(timeObj.getMinutes());
      finalDateTime.setSeconds(0);

      try {
        await createMovieSession(this.token, {
          movie: this.selectedMovieId,
          cinema_hall: this.selectedHallId,
          show_time: finalDateTime.toISOString()
        });
        // Повертаємося до списку сеансів
        window.location.hash = '#/movie-sessions';
      } catch (err) {
        console.error('Failed to create session:', err.response?.data || err);
        alert('Error: ' + JSON.stringify(err.response?.data || 'Server error'));
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
      if (newVal) {
        this.fetchData();
      }
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
