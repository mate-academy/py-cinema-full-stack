<template>
  <div v-if="active" class="movie-sessions">
    <date-picker @change="handleDateSelection" v-model="date"></date-picker>

    <div class="movie-container" v-if="movieSessionsGroupedByTime.length">
      <movie-card
        v-for="(session, index) in movieSessionsGroupedByTime"
        :key="index"
        :id="session.id"
        :title="session.movie_title"
        :image="session.movie_image"
        :times="session.times"
        @open-details="handleMovieSessionDetails"
      ></movie-card>
    </div>

    <div v-else class="no-sessions">No movie sessions for selected date.</div>

    <add-btn
      v-if="isStaff"
      @click="handleMovieCreate">
    </add-btn>
  </div>
</template>

<script>
import MovieCard from '../comps/MovieCard.vue';
import AddBtn from '../comps/AddBtn.vue';
import DatePicker from '../comps/DatePicker.vue';
import moment from 'moment';
// Перевірте шлях до API!
import { getMovieSessions } from '@/api/cinema/movieSessions';

export default {
  name: 'MovieSessionListScreen',
  props: {
    isStaff: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    active: false,
    movieSessions: [],
    date: moment().format('YYYY-MM-DD')
  }),
  computed: {
    movieSessionsGroupedByTime() {
      // Групуємо без мутації оригінального масиву movieSessions
      return this.movieSessions.reduce((acc, item) => {
        const movieIndex = acc.findIndex(s => s.movie_title === item.movie_title);
        if (movieIndex > -1) {
          acc[movieIndex].times.push(item.show_time);
        } else {
          acc.push({
            ...item,
            times: [item.show_time]
          });
        }
        return acc;
      }, []);
    },
    token() {
      return localStorage.getItem('access');
    }
  },
  methods: {
    hashHandler() {
      this.active = Boolean(window.location.hash.match('movie-sessions$'));
    },
    handleMovieSessionDetails(sessionId) {
      window.location.hash = `#/movie-sessions/${sessionId}`;
    },
    handleMovieCreate() {
      window.location.hash = '#/movie-sessions?add=true';
    },
    handleDateSelection(newDate) {
      this.date = moment(newDate).format('YYYY-MM-DD');
      this.fetchMovieSessionsByDate();
    },
    async fetchMovieSessionsByDate() {
      if (!this.active) return;
      try {
        const { data } = await getMovieSessions(this.token, { date: this.date });
        // Обробка пагінації Django (results)
        this.movieSessions = Array.isArray(data) ? data : (data.results || []);
      } catch (err) {
        console.error('Fetch sessions error:', err.response?.data || err);
      }
    }
  },
  watch: {
    active(isNowActive) {
      if (isNowActive) {
        this.fetchMovieSessionsByDate();
      }
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
    if (this.active) this.fetchMovieSessionsByDate();
  },
  unmounted() {
    window.removeEventListener('hashchange', this.hashHandler);
  },
  components: {
    MovieCard,
    AddBtn,
    DatePicker
  }
};
</script>

<style scoped>
.movie-sessions {
  display: flex;
  flex-direction: column;
  gap: 60px;
  padding: 20px;
}
.movie-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  column-gap: 40px;
  row-gap: 60px;
}
.no-sessions {
  font-size: 18px;
  text-align: center;
  color: #888;
}
</style>
