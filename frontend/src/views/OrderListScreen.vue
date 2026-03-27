<template>
  <div class="order-list" v-if="active">
    <div class="header">My Orders</div>
    <div class="orders">
      <div v-if="orders.length === 0" class="no-orders">
        You don't have any orders yet.
      </div>

      <div
        v-for="order in orders"
        :key="order.id"
        class="order-card"
      >
        <div class="order-info">
          <div><strong>Movie:</strong> {{ order.movie_title || 'N/A' }}</div>
          <div><strong>Session:</strong> {{ formatDateTime(order.session_time) }}</div>
          <div><strong>Seats:</strong> {{ Array.isArray(order.seats) ? order.seats.join(', ') : order.seats }}</div>
          <div :class="['status', order.status?.toLowerCase()]">
            <strong>Status:</strong> {{ order.status }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Перевірте шлях! Судячи з вашої структури папок, він може бути:
// import { getOrders } from '@/api/cinema/orders';
import { getOrders } from '@/api/cinema/orders';

export default {
  name: 'OrderListScreen',
  data: () => ({
    active: false,
    orders: []
  }),
  computed: {
    token() {
      return localStorage.getItem('access');
    }
  },
  methods: {
    hashHandler() {
      this.active = Boolean(window.location.hash.match('my-orders$'));
    },
    async fetchOrders() {
      if (!this.token) return;
      try {
        const { data } = await getOrders(this.token);
        // Якщо Django повертає пагінацію, дані будуть у data.results
        this.orders = Array.isArray(data) ? data : (data.results || []);
      } catch (err) {
        console.error('Fetch orders error:', err.response?.data || err);
      }
    },
    formatDateTime(value) {
      if (!value) return 'N/A';
      return new Date(value).toLocaleString();
    }
  },
  watch: {
    // Якщо хеш змінився на "мої замовлення", оновлюємо список
    active(newVal) {
      if (newVal) this.fetchOrders();
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
    this.fetchOrders();
  },
  // У Vue 3 замість beforeDestroy використовуємо unmounted
  unmounted() {
    window.removeEventListener('hashchange', this.hashHandler);
  }
};
</script>

<style scoped>
.order-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
}
.header {
  font-weight: 600;
  font-size: 50px;
  line-height: 61px;
}
.orders {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 80%;
}
.order-card {
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
}
.order-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.no-orders {
  font-style: italic;
  color: #888;
}
.status.paid { color: #4caf50; }
.status.pending { color: #ff9800; }
</style>
