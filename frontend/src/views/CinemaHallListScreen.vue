<template>
  <div v-if="active" class="wrapper">
    <div class="title">Cinema Halls</div>

    <div v-if="loading" class="info">Loading…</div>
    <div v-else-if="errorText" class="error">{{ errorText }}</div>

    <div v-else class="grid">
      <div v-for="h in halls" :key="h.id" class="card">
        <div class="name">{{ h.name }}</div>
        <div class="line">Size: {{ h.rows }} x {{ h.seats_in_row }}</div>
        <div class="line">Capacity: {{ h.capacity ?? (h.rows * h.seats_in_row) }}</div>
      </div>

      <div v-if="!halls.length" class="empty">No halls found.</div>
    </div>

    <add-btn v-if="isStaff" @click="openAdd" />
  </div>
</template>

<script>
import AddBtn from '../comps/AddBtn.vue';

export default {
  name: 'CinemaHallListScreen',
  props: { isStaff: { type: Boolean, default: false } },
  components: { AddBtn },

  data: () => ({
    active: false,
    loading: false,
    halls: [],
    errorText: ''
  }),

  computed: {
    token () { return localStorage.getItem('access'); }
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

    async fetchHalls () {
      if (!this.token) { location.hash = '#/sign-in'; return; }
      this.loading = true; this.errorText = '';
      try {
        // ✅ rota com hífen e barra final
        const { data } = await this.axios.get('/api/cinema/cinema-halls/', {
          headers: this.authHeader()
        });
        this.halls = Array.isArray(data) ? data : (data?.results || []);
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('access'); localStorage.removeItem('refresh');
          location.hash = '#/sign-in'; return;
        }
        this.errorText = this.prettyErr(err);
        this.halls = [];
        console.error('[cinema-halls] error:', err);
      } finally {
        this.loading = false;
      }
    },

    openAdd () { location.hash = '#/cinema-halls?add=true'; },

    hashHandler () {
      this.active = Boolean(/#\/cinema-halls$/.test(location.hash));
    }
  },

  watch: {
    active (val) { if (val) this.fetchHalls(); }
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
.wrapper { display: flex; flex-direction: column; gap: 24px; }
.title { font-size: 44px; font-weight: 700; text-align: center; }
.info, .error, .empty { text-align: center; opacity: .9; }
.error { color: #ff6b6b; }

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
}

.card {
  background: #141414;
  border: 1px solid #282828;
  border-radius: 16px;
  padding: 22px;
  text-align: center;
}
.name { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
.line { opacity: .9; margin-top: 8px; }
</style>
