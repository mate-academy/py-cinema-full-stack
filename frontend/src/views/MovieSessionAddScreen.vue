<template>
  <div v-if="active && isStaff" class="movie-session-container">
    <div class="header">Add a movie session</div>
    <div class="note">Please fill in the fields in details</div>

    <div class="container">
      <custom-select
        label="Movie"
        :options="movieOptions"
        @option-selected="handleMovieSelection"
      />
      <custom-select
        label="Cinema Hall"
        :options="hallOptions"
        @option-selected="handleHallSelection"
      />

      <div class="date-container">
        <date-picker v-model="date" />
        <time-picker v-model="time" />
      </div>
    </div>

    <action-button
      :label="loading ? 'Submitting…' : 'Submit'"
      @click="addMovieSession"
      :disabled="loading || !selectedHallId || !selectedMovieId || !date || !time"
    />

    <p v-if="errorText" style="color:#ff6b6b;margin-top:10px">{{ errorText }}</p>
    <p v-if="successText" style="color:#43d17a;margin-top:10px">{{ successText }}</p>
  </div>
</template>

<script>
import DatePicker from '../comps/DatePicker.vue';
import ActionButton from '../comps/ActionButton.vue';
import TimePicker from '../comps/TimePicker.vue';
import CustomSelect from '../comps/CustomSelect.vue';

export default {
  name: 'MovieSessionAddScreen',
  props: { isStaff: { type: Boolean, default: false } },
  components: { DatePicker, ActionButton, TimePicker, CustomSelect },

  data: () => ({
    active: false,
    loading: false,
    movies: [],
    halls: [],
    date: new Date(),
    time: new Date(),
    selectedMovieId: null,
    selectedHallId: null,
    errorText: '',
    successText: ''
  }),

  computed: {
    token () { return localStorage.getItem('access'); },

    movieOptions () {
      return (this.movies || []).map(m => ({ id: m.id, name: m.title }));
    },
    hallOptions () {
      return (this.halls || []).map(h => ({ id: h.id, name: h.name }));
    }
  },

  methods: {
    authHeader () { return this.token ? { Authorization: `Bearer ${this.token}` } : {}; },

    prettyErr (err) {
      const res = err?.response;
      if (!res) return err?.message || 'Network error';
      if (res.data && typeof res.data === 'object') {
        const first = Object.values(res.data)[0];
        if (Array.isArray(first)) return first[0];
        if (typeof first === 'string') return first;
      }
      return res.data?.detail || res.data?.error || `HTTP ${res.status}`;
    },

    hashHandler () {
      this.active = Boolean(location.hash.match(/movie-sessions\?add=true$/));
    },

    async fetchMovies () {
      try {
        const { data } = await this.axios.get('/api/cinema/movies/', {
          headers: this.authHeader(),
          params: { limit: 1000, offset: 0 }
        });
        this.movies = Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('[sessions] fetchMovies error:', err);
        this.errorText = this.prettyErr(err);
      }
    },

    async fetchCinemaHalls () {
      try {
        const { data } = await this.axios.get('/api/cinema/cinema-halls/', {
          headers: this.authHeader()
        });
        this.halls = Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('[sessions] fetchCinemaHalls error:', err);
        this.errorText = this.prettyErr(err);
      }
    },

    // Junta a data e a hora e retorna "YYYY-MM-DDTHH:mm:00" (local, sem 'Z')
    toLocalNaiveISO (dateObj, timeObj) {
      const d = new Date(dateObj);
      const t = new Date(timeObj);
      d.setHours(t.getHours(), t.getMinutes(), 0, 0);
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
    },

    async addMovieSession () {
      if (!this.token) { location.hash = '#/sign-in'; return; }
      if (!this.selectedMovieId || !this.selectedHallId || !this.date || !this.time) return;

      this.loading = true;
      this.errorText = ''; this.successText = '';

      const showTime = this.toLocalNaiveISO(this.date, this.time);
      const payload = {
        movie: this.selectedMovieId,
        cinema_hall: this.selectedHallId,
        show_time: showTime
      };

      try {
        await this.axios.post('/api/cinema/movie-sessions/', payload, {
          headers: { ...this.authHeader(), 'Content-Type': 'application/json' }
        });
        this.successText = '✅ Movie session created!';
        setTimeout(() => { location.hash = '#/movie-sessions'; }, 800);
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('access'); localStorage.removeItem('refresh');
          location.hash = '#/sign-in';
          return;
        }
        this.errorText = this.prettyErr(err);
        console.error('[sessions] create error:', err);
      } finally {
        this.loading = false;
      }
    },

    handleMovieSelection (movieId) { this.selectedMovieId = movieId; },
    handleHallSelection (hallId) { this.selectedHallId = hallId; },

    resetForm () {
      this.selectedMovieId = null;
      this.selectedHallId = null;
      this.date = new Date();
      this.time = new Date();
      this.errorText = '';
      this.successText = '';
    }
  },

  watch: {
    active (val) {
      if (val) {
        this.resetForm();
        this.fetchMovies();
        this.fetchCinemaHalls();
      }
    }
  },

  mounted () {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
  },
  beforeDestroy () {
    window.removeEventListener('hashchange', this.hashHandler);
  }
};
</script>

<style scoped>
.movie-session-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.header {
  font-weight: 600;
  font-size: 50px;
  line-height: 61px;
}

.note {
  font-size: 25px;
  line-height: 31px;
}

.container {
  width: 100%;
  max-width: 570px;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 24px;
  margin-bottom: 60px;
}

.date-container {
  display: flex;
  gap: 60px;
  width: 100%;
}

.date-container > * {
  width: 255px;
}
</style>
