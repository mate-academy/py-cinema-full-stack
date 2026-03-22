<template>
  <div v-if="active" class="orders-container">
    <div class="header">My orders</div>
    <div class="container">
      <div v-for="order in response.results" class="order">
        <div class="created-info">
          <div>Id: {{order.id}}.</div>
          <div>Created at {{createdAt(order.created_at)}}</div>
        </div>
        <div v-for="ticket in order.tickets" class="ticket">
          <div
            class="movie-card"
            :style="{ 'background-image': 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%), url(' + ticket.movie_session.movie_image + ')' }"
          ></div>
          <div class="ticket-info">
            <div><span class="label">Movie:</span> {{ticket.movie_session.movie_title}}</div>
            <div><span class="label">Show time:</span> {{showTime(ticket.movie_session.show_time)}}</div>
            <div><span class="label">Row:</span> {{ticket.row}}</div>
            <div><span class="label">Seat:</span> {{ticket.seat}}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="btn-container">
      <div
        @click="fetchPrevious"
        :class="['move-btn previous', !response.previous && 'disabled']">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <use href="/assets/icons/left_arrow.svg#left"></use>
        </svg>
      </div>
      <div
        @click="fetchNext"
        :class="['move-btn next', !response.next && 'disabled']">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <use href="/assets/icons/right_arrow.svg#right"></use>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { getOrders } from '@/api/cinema/orders';
import axios from 'axios';

export default {
  data: () => ({
    active: false,
    response: []
  }),
  computed: {
    token () {
      return localStorage.getItem('access');
    }
  },
  methods: {
    hashHandler () {
      this.active = Boolean(location.hash.match('my-orders$'));
    },
    async fetchOrders () {
      try {
        const { data } = await getOrders(this.token);
        this.response = data;
      } catch (err) {
        console.error(err.response?.data || err);
      }
    },
    async fetchPrevious () {
      if (!this.response.previous) return;
      try {
        const { data } = await axios.get(this.response.previous, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.response = data;
      } catch (err) {
        console.error(err.response?.data || err);
      }
    },
    async fetchNext () {
      if (!this.response.next) return;
      try {
        const { data } = await axios.get(this.response.next, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.response = data;
      } catch (err) {
        console.error(err.response?.data || err);
      }
    },
    createdAt (time) {
      return moment(time).format('YYYY/MM/DD h:mm');
    },
    showTime (time) {
      return moment(time).format('YYYY/MM/DD h:mm');
    }
  },
  watch: {
    active (value) {
      if (value) this.fetchOrders();
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
