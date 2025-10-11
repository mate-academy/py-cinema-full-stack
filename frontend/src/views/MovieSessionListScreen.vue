<template>
  <div v-if="active" class="p-4">
    <h1 class="header">Movie Sessions</h1>

    <div class="filters">
      <input type="date" v-model="date" @change="fetch" />
      <input type="number" v-model.number="movieId" placeholder="Movie ID" @keyup.enter="fetch" />
      <button @click="fetch">Reload</button>
    </div>

    <div v-if="loading" class="note">Loading sessions…</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="grid">
      <div v-for="s in sessions" :key="s.id" class="card">
        <img v-if="s.movie_image" :src="s.movie_image" class="poster" />
        <div class="title">{{ s.movie_title }}</div>
        <div class="sub">{{ fmtDateTime(s.show_time) }}</div>
        <div class="muted">
          {{ s.cinema_hall_name }} · cap {{ s.cinema_hall_capacity }} ·
          <b>{{ s.tickets_available }}</b> available
        </div>

        <div class="actions">
          <!-- Navegação via router-link -->
          <router-link
            class="ghost"
            :to="{ name: 'movie-session-detail', params: { id: s.id } }"
          >
            View seats
          </router-link>

          <button class="primary" @click="openBuy(s)">Quick Buy</button>
        </div>
      </div>
    </div>

    <!-- Modal simples (opcional, quick buy) -->
    <div v-if="buyOpen && selected" class="overlay" @click.self="closeBuy">
      <buy-tickets
        :session-id="selected.id"
        :movie-title="selected.movie_title"
        @close="closeBuy"
        @success="onBought"
      />
    </div>
  </div>
</template>

<script>
import { fetchMovieSessions } from "@/api";
import BuyTickets from "@/comps/BuyTickets.vue";

export default {
  name: "MovieSessionListScreen",
  components: { BuyTickets },
  props: { active: { type: Boolean, default: true } },
  data: () => ({
    date: "",
    movieId: null,
    loading: false,
    error: "",
    sessions: [],
    buyOpen: false,
    selected: null,
  }),
  mounted() { this.fetch(); },
  methods: {
    async fetch() {
      this.loading = true; this.error = "";
      try {
        const params = {};
        if (this.date) params.date = this.date;
        if (this.movieId) params.movie = this.movieId;
        const data = await fetchMovieSessions(params);
        this.sessions = data.results || [];
      } catch (e) {
        this.error = "Failed to load sessions.";
      } finally {
        this.loading = false;
      }
    },
    fmtDateTime(iso) {
      const d = new Date(iso);
      return isNaN(d) ? iso : d.toLocaleString();
    },
    openBuy(s) {
      this.selected = s;
      this.buyOpen = true;
    },
    closeBuy() {
      this.buyOpen = false;
      this.selected = null;
    },
    onBought(order) {
      alert(`Order #${order.id} criado com ${order.tickets.length} ticket(s).`);
      this.fetch();
    },
  },
};
</script>

<style scoped>
.header { font-size: 22px; font-weight: 700; margin-bottom: 12px; color:#fff; }
.filters { display:flex; gap:8px; align-items:center; margin-bottom:12px; }
.note { opacity: .75; color:#ddd; }
.error { color:#fca5a5; }
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:16px; }
.card { background:#111; color:#fff; border:1px solid #333; border-radius:14px; padding:10px; }
.poster { width:100%; height:220px; object-fit:cover; border-radius:10px; margin-bottom:8px; background:#0c0c0c; }
.title { font-weight:700; }
.sub { font-size:12px; opacity:.85; }
.muted { font-size:12px; opacity:.7; margin-top:4px; }
.actions { margin-top:10px; display:flex; justify-content:flex-end; gap:8px; }

/* Botões */
.primary { background:#ef4444; border:1px solid #ef4444; color:#fff; border-radius:10px; padding:6px 12px; cursor:pointer; }

/* router-link estilizado como "ghost button" */
.ghost {
  display:inline-block;
  background:transparent;
  border:1px solid #333;
  color:#e5e7eb;
  border-radius:10px;
  padding:6px 12px;
  text-decoration:none;
  cursor:pointer;
}
.ghost:visited { color:#e5e7eb; }

.overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:1000; }
</style>
