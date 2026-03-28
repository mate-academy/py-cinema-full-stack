<template>
  <div v-if="active && !loading && movieSession.id" class="session-details">
    <div
      class="movie-card"
      :style="{
        'background-image': `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%), url(${movieSession.movie?.image})`
      }"
    ></div>
    <div class="container">
      <div class="info">
        <span>{{ movieSession.movie?.title }}</span>
        <span>Date: {{ formattedDate }}</span>
        <span>Time: {{ formattedTime }}</span>
        <span>Cinema Hall: {{ movieSession.cinema_hall?.name }}</span>
      </div>

      <cinema-hall-schema
        :takenSeats="movieSession.taken_places || []"
        :cinemaHall="movieSession.cinema_hall || {}"
        @choose-seat="chooseSeat"
      ></cinema-hall-schema>

      <action-button
        label="Make order"
        @click="makeOrder"
        :disabled="!chosenSeats.length || !user"
      ></action-button>
    </div>
  </div>

  <div v-else-if="loading" class="loader">Loading session details...</div>
</template>

<script>
import moment from 'moment';
import CinemaHallSchema from '../comps/CinemaHallSchema.vue';
import ActionButton from '../comps/ActionButton.vue';

export default {
  name: 'MovieSessionDetailsScreen',
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
    chosenSeats: []
  }),
  computed: {
    formattedTime() {
      return this.movieSession.show_time ? moment(this.movieSession.show_time).format('HH:mm') : '';
    },
    formattedDate() {
      return this.movieSession.show_time ? moment(this.movieSession.show_time).format('YYYY/MM/DD') : '';
    }
  },
  methods: {
    async hashHandler() {
      const match = window.location.hash.match(/#\/movie-sessions\/(\d+)/);
      if (!match) {
        this.active = false;
        this.movieSession = {};
        return;
      }

      const id = match[1];
      this.active = true;
      await this.fetchMovieSession(id);
    },
    async fetchMovieSession(id) {
      try {
        this.loading = true;
        const { data } = await this.axios.get(`/cinema/movie-sessions/${id}/`);
        this.movieSession = data;
      } catch (err) {
        console.error('Error fetching session:', err);
      } finally {
        this.loading = false;
      }
    },
    chooseSeat(seats) {
      this.chosenSeats = seats;
    },
    async makeOrder() {
      try {
        const tickets = this.chosenSeats.map(seat => ({
          row: seat.row,
          seat: seat.seat,
          movie_session: this.movieSession.id
        }));

        await this.axios.post('/cinema/orders/', { tickets });
        await this.fetchMovieSession(this.movieSession.id);
        this.chosenSeats = [];
        alert('Order placed successfully!');
      } catch (err) {
        console.error('Order error:', err);
        alert('Failed to place order.');
      }
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
  },
  unmounted() {
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
  padding: 20px;
}
.movie-card {
  width: 100%;
  height: 470px;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 8px;
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
.loader {
  text-align: center;
  margin-top: 50px;
  font-size: 20px;
}
</style>
