<template>
  <div v-if="active && isStaff" class="cinema-halls">
    <div class="label">Cinema Halls</div>
    <div class="hall-container">
      <div v-for="hall in halls" class="hall" :key="hall.id">
        <div class="name">{{hall.name}}</div>
        <div class="size">Size: {{hall.rows}} x {{hall.seats_in_row}}</div>
        <div>Capacity: {{hall.capacity}}</div>
      </div>
    </div>
    <add-btn @click="handleHallCreate"></add-btn>
  </div>
</template>

<script>
import AddBtn from '../comps/AddBtn.vue';
import { getCinemaHalls } from '@/api/cinema/cinema_halls';

export default {
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
    token () {
      return localStorage.getItem('access');
    }
  },
  methods: {
    async fetchHalls () {
      try {
        const { data } = await getCinemaHalls(this.token);
        this.halls = data;
      } catch (err) {
        console.error(err.response?.data || err);
      }
    },
    handleHallCreate () {
      location.hash = '#/cinema-halls?add=true';
    },
    hashHandler () {
      this.active = Boolean(location.hash.match('cinema-halls$'));
    }
  },
  watch: {
    active () {
      if (this.active) {
        this.fetchHalls();
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
    AddBtn
  }
};
</script>
