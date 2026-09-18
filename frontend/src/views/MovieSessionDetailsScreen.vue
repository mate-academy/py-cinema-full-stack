<template>
  <div v-if="active && !loading" class="session-details">
    <div class="movie-card" :style="movieCardStyle"></div>
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
      <div v-if="chosenSeats.length" class="selection-summary">
        Selected seats: {{ chosenSeats.map(seat => `row ${seat.row}, seat ${seat.seat}`).join('; ') }}
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <action-button label="Make order" @click="makeOrder" :disabled="!chosenSeats.length || !user"></action-button>
    </div>
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
    chosenSeats: [],
    error: ''
  }),
  computed: {
    movieCardStyle () {
      const image = this.movieSession.movie.image || '/assets/movie-placeholder.svg';
      return {
        'background-image': `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%), url("${image}")`
      };
    },

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
      try {
        this.loading = true;
        const { data: session } = await this.axios.get(`/api/cinema/movie_sessions/${id}/`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });

        this.movieSession = session;
        this.loading = false;
      } catch (err) {
        this.error = this.getErrorMessage(err, 'Unable to load this session.');
        this.loading = false;
      }
    },

    chooseSeat (seats) {
      this.chosenSeats = seats;
    },

    async makeOrder () {
      this.error = '';
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

      try {
        await this.axios.post('/api/cinema/orders/', { tickets }, config);
        await this.fetchMovieSession(this.movieSession.id);
        this.chosenSeats = [];
      } catch (err) {
        this.error = this.getErrorMessage(err, 'Unable to create the order. The seats may have just been booked.');
      }
    },

    getErrorMessage (err, fallback) {
      const data = err.response && err.response.data;
      if (!data) return fallback;
      if (typeof data === 'string') return data;
      return Object.values(data).flat().join(' ') || fallback;
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

.movie-card {
  width: 100%;
  height: 470px;
  background-repeat: no-repeat;
  background-size: cover;
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

.selection-summary {
  font-size: 18px;
  color: var(--main-font);
}

.error {
  color: var(--red);
  text-align: center;
}
</style>
