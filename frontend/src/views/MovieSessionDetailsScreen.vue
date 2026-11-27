<template>
  <div v-if="active" class="session-details">
    <div v-if="loading">Loading session...</div>
    <div v-else-if="error" class="error">{{error}}</div>
    <template v-else-if="movieSession.movie">
    <div class="movie-card">
      <img v-if="movieSession.movie.image && !imageFailed" :src="movieSession.movie.image" alt="" @error="imageFailed = true"/>
      <div v-if="!movieSession.movie.image || imageFailed" class="poster-placeholder">Cinema Shop</div>
    </div>
    <div class="container">
      <div class="info">
        <span>{{movieSession.movie.title}}</span>
        <span>Date: {{formattedDate}}</span>
        <span>Time: {{formattedTime}}</span>
        <span>Cinema Hall: {{movieSession.cinema_hall.name}}</span>
      </div>
      <cinema-hall-schema
      :takenSeats="movieSession.taken_places"
      :cinemaHall="movieSession.cinema_hall"
      @choose-seat="chooseSeat"></cinema-hall-schema>
      <action-button label="Make order" @click="makeOrder" :disabled="submitting || !chosenSeats.length || !user"></action-button>
      <p v-if="orderError" class="error">{{orderError}}</p>
    </div>
    </template>
  </div>
</template>

<script>
import moment from 'moment';

import CinemaHallSchema from '../comps/CinemaHallSchema.vue';
import ActionButton from '../comps/ActionButton.vue';
export default {
  props: {
    user: {
      type: Object,
      default: null
    }
  },
  data: () => ({
    active: false,
    movieSession: {},
    loading: false,
    submitting: false,
    error: '',
    orderError: '',
    imageFailed: false,
    chosenSeats: []
  }),
  computed: {
    formattedTime () {
      return moment(this.movieSession.show_time).format('HH:mm');
    },
    formattedDate () {
      return moment(this.movieSession.show_time).format('YYYY/MM/DD');
    },
    token () {
      return localStorage.getItem('access');
    }
  },
  methods: {
    async hashHandler () {
      const match = location.hash.match(/#\/movie-sessions\/(\d+)/);
      if (!match) {
        this.active = false;
        this.movieSession = {};
        this.chosenSeats = [];
        return;
      };

      const [, id] = match;
      if (!id) {
        this.active = false;
        return;
      }

      this.active = true;
      await this.fetchMovieSession(id);
    },

    async fetchMovieSession (id) {
      this.loading = true;
      this.error = '';
      try {
        const { data: session } = await this.axios.get(`${import.meta.env.VITE_API_URL}/api/cinema/movie_sessions/${id}/`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });

        this.imageFailed = false;
        this.movieSession = session;
      } catch (err) {
        this.error = 'Cannot load this movie session. Please try again.';
        console.error(err.response?.data || err);
      } finally {
        this.loading = false;
      }
    },

    chooseSeat (seats) {
      this.chosenSeats = seats;
    },

    async makeOrder () {
      const tickets = this.chosenSeats.map(seat => ({
        ...seat,
        movie_session: this.movieSession.id
      }));
      const config = {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      };

      if (this.submitting || !tickets.length) return;
      this.submitting = true;
      this.orderError = '';
      try {
        await this.axios.post(`${import.meta.env.VITE_API_URL}/api/cinema/orders/`, { tickets }, config);
        this.chosenSeats = [];
        location.hash = '#/my-orders';
      } catch (err) {
        this.orderError = 'Could not book the selected seats. They may already be taken.';
        console.error(err.response?.data || err);
        await this.fetchMovieSession(this.movieSession.id);
      } finally {
        this.submitting = false;
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
    CinemaHallSchema,
    ActionButton
  }
};
</script>

<style scoped>
.session-details {
  display: grid;
  grid-template-columns: 350px 1fr;
  column-gap: 60px;
}

.poster-placeholder {
  margin-top: 200px;
  color: #aaa;
  text-align: center;
  font-size: 20px;
}

.error {
  color: #ff7373;
}

.movie-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-card {
  width: 100%;
  height: 470px;
  background-repeat: no-repeat;
  background-size: cover;
  background-color: #252525;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info > span:first-of-type {
  font-size: 25px;
  font-weight: 700;
  line-height: 30px;
}

.info > span:not(:first-of-type) {
  font-size: 18px;
  line-height: 22px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 50px;
}
</style>
