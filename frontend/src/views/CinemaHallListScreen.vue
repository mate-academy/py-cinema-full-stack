<template>
  <div v-if="active && isStaff" class="cinema-halls">
    <div class="label">Cinema Halls</div>
    <div class="hall-container">
      <div v-if="halls.length === 0" class="no-data">
        No cinema halls found.
      </div>

      <div v-for="hall in halls" class="hall" :key="hall.id">
        <div class="name">{{ hall.name }}</div>
        <div class="size">Rows: {{ hall.rows }} | Seats in row: {{ hall.seats_in_row }}</div>
        <div class="capacity">Total Capacity: {{ hall.capacity }}</div>
      </div>
    </div>
    <add-btn @click="handleHallCreate"></add-btn>
  </div>
</template>

<script>
import AddBtn from '../comps/AddBtn.vue';
// Перевірте шлях до API (імовірно @/api/cinema/cinemaHalls)
import { getCinemaHalls } from '@/api/cinema/cinemaHalls';

export default {
  name: 'CinemaHallListScreen',
  props: {
    isStaff: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    active: false,
    halls: []
  }),
  computed: {
    token() {
      return localStorage.getItem('access');
    }
  },
  methods: {
    async fetchHalls() {
      if (!this.token) return;
      try {
        const { data } = await getCinemaHalls(this.token);
        // Обробка пагінації Django (results) або простого масиву
        this.halls = Array.isArray(data) ? data : (data.results || []);
      } catch (err) {
        console.error('Fetch halls error:', err.response?.data || err);
      }
    },
    handleHallCreate() {
      window.location.hash = '#/cinema-halls?add=true';
    },
    hashHandler() {
      // Більш точна перевірка хешу
      this.active = window.location.hash.endsWith('cinema-halls');
    }
  },
  watch: {
    active(newVal) {
      if (newVal) {
        this.fetchHalls();
      }
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
    if (this.active) this.fetchHalls();
  },
  // Vue 3 використовує unmounted
  unmounted() {
    window.removeEventListener('hashchange', this.hashHandler);
  },
  components: {
    AddBtn
  }
};
</script>

<style scoped>
.cinema-halls {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
}
.label {
  font-weight: 600;
  font-size: 40px;
}
.hall-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
}
.hall {
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}
.name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}
.size, .capacity {
  font-size: 16px;
  color: #ccc;
}
.no-data {
  font-style: italic;
  color: #888;
}
</style>
