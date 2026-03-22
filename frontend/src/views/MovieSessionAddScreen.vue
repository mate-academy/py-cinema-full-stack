<template>
  <div v-if="active && isStaff" class="movie-session-container">
    <div class="header">Add a movie session</div>
    <div class="note">Please fill in the fields in details</div>
    <div class="container">
      <custom-select label="Movie" :options="movieOptions" @option-selected="handleMovieSelection"></custom-select>
      <custom-select label="Cinema Hall" :options="cinemaHalls" @option-selected="handleHallSelection"></custom-select>
      <div class="date-container">
        <date-picker v-model="date"></date-picker>
        <time-picker v-model="time"></time-picker>
      </div>
    </div>
    <action-button label="Submit" @click="addMovieSession" :disabled="!selectedHallId || !selectedMovieId"></action-button>
  </div>
</template>

<script>
import DatePicker from '../comps/DatePicker.vue';
import ActionButton from '../comps/ActionButton.vue';
import TimePicker from '../comps/TimePicker.vue';
import CustomSelect from '../comps/CustomSelect.vue';

import { getMovies } from '@/api/cinema/movies';
import { createMovieSession } from '@/api/cinema/movie_sessions';
import axios from 'axios';

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
    cinemaHalls: [],
    date: new Date(),
    time: new Date(),
    selectedMovieId: null,
    selectedHallId: null
  }),
  computed: {
    movieOptions () {
      return this.movies.map(movie => ({
        name: movie.title,
        id: movie.id
      }));
    },
    token () {
      return localStorage.getItem('access');
    }
  },
  methods: {
    hashHandler () {
      this.active = Boolean(location.hash.match('movie-sessions\\?add=true'));
    },
    async fetchMovies () {
      try {
        const { data } = await getMovies(this.token);
        this.movies = data;
      } catch (err) {
        console.error(err.response?.data || err);
      }
    },
    async fetchCinemaHalls () {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/cinema_halls/`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.cinemaHalls = data;
      } catch (err) {
        console.error(err.response?.data || err);
      }
    },
    async addMovieSession () {
      const showTime = new Date(this.date);
      showTime.setHours(this.time.getHours());
      showTime.setMinutes(this.time.getMinutes());

      try {
        await createMovieSession(this.token, {
          movie: this.selectedMovieId,
          cinema_hall: this.selectedHallId,
          show_time: showTime.toISOString()
        });
        location.hash = '#/movie-sessions';
      } catch (err) {
        console.error(err.response?.data || err);
      }
    },
    handleMovieSelection (movieId) {
      this.selectedMovieId = movieId;
    },
    handleHallSelection (hallId) {
      this.selectedHallId = hallId;
    }
  },
  watch: {
    active () {
      if (this.active) {
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
  },
  components: {
    DatePicker,
    ActionButton,
    TimePicker,
    CustomSelect
  }
};
</script>
