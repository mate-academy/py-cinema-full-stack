<template>
  <div v-if="active" class="wrapper">
    <div class="filters">
      <div class="title">Movie Sessions</div>
      <div class="date-filter">
        <label>Select date</label>
        <date-picker v-model="date" @change="handleDateChange" />
      </div>
    </div>

    <div v-if="loading" class="info">Loading sessions…</div>
    <div v-else-if="errorText" class="error">{{ errorText }}</div>

    <div v-else class="grid">
      <div
        v-for="s in sessions"
        :key="s.id"
        class="card"
        @click="goToDetails(s.id)"
      >
        <div class="poster">
          <img
            v-if="s.movie_image"
            :src="absoluteMedia(s.movie_image)"
            alt="poster"
          />
          <div v-else class="no-image">No Image</div>
        </div>
        <div class="content">
          <div class="movie">{{ s.movie_title }}</div>
          <div class="meta">
            <span class="pill">{{ formatTime(s.show_time) }}</span>
            <span class="pill">{{ s.cinema_hall_name }}</span>
            <span class="pill">
              {{ s.tickets_available }} / {{ s.cinema_hall_capacity }} seats
            </span>
          </div>
        </div>
      </div>

      <div v-if="!sessions.length && !loading" class="empty">
        No movie sessions for selected date.
      </div>
    </div>

    <add-btn v-if="isStaff" @click="openAdd" />
  </div>
</template>

<script>
import DatePicker from '../comps/DatePicker.vue';
import AddBtn from '../comps/AddBtn.vue';

export default {
  name: 'MovieSessionListScreen',
  props: { isStaff: { type: Boolean, default: false } },
  components: { DatePicker, AddBtn },

  data: () => ({
    active: false,
    loading: false,
    sessions: [],
    date: new Date(),
    errorText: ''
  }),

  computed: {
    token () { return localStorage.getItem('access'); }
  },

  methods: {
    baseUrl () {
      const env = (import.meta.env && import.meta.env.VITE_API_URL) || '';
      const base = env && env.trim() ? env.trim() : 'http://127.0.0.1:8080';
      return new URL('/', base).origin;
    },
    buildUrl (path) { return new URL(path, this.baseUrl()).toString(); },
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

    // Date -> 'YYYY-MM-DD'
    toApiDate (d) {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    },

    // 'YYYY-MM-DDTHH:mm:ss' -> 'HH:mm'
    formatTime (isoLocal) {
      const match = String(isoLocal).match(/T(\d{2}):(\d{2})/);
      return match ? `${match[1]}:${match[2]}` : '—';
    },

    absoluteMedia (pathOrUrl) {
      if (!pathOrUrl) return '';
      try { return new URL(pathOrUrl).toString(); }
      catch { return this.buildUrl(pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`); }
    },

    async fetchSessions () {
      if (!this.token) { location.hash = '#/sign-in'; return; }
      this.loading = true;
      this.errorText = '';

      try {
        const url = this.buildUrl('/api/cinema/movie-sessions/');
        const { data } = await this.axios.get(url, {
          headers: this.authHeader(),
          params: { date: this.toApiDate(this.date) }
        });
        this.sessions = Array.isArray(data) ? data : (data?.results || []);
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('access'); localStorage.removeItem('refresh');
          location.hash = '#/sign-in';
          return;
        }
        this.errorText = this.prettyErr(err);
        this.sessions = [];
      } finally {
        this.loading = false;
      }
    },

    handleDateChange () {
      this.fetchSessions();
    },

    openAdd () {
      location.hash = '#/movie-sessions?add=true';
    },

    // ✅ Navega para a tela de detalhes (onde está o botão "Make order")
    goToDetails (id) {
      location.hash = `#/movie-sessions/${id}`;
    },

    hashHandler () {
      this.active = Boolean(
        !location.hash ||
        /#\/movie-sessions$/.test(location.hash) ||
        /\/$/.test(location.hash)
      );
    }
  },

  watch: {
    active (val) {
      if (val) this.fetchSessions();
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

<style scoped>
.wrapper { display: flex; flex-direction: column; gap: 16px; }
.filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.title { font-size: 44px; font-weight: 700; }
.date-filter { display: flex; flex-direction: column; gap: 8px; min-width: 280px; }

.info, .error, .empty { text-align: center; margin-top: 24px; opacity: .9; }
.error { color: #ff6b6b; }

.grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 36px;
}

.card {
  background: #121212;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;            /* 👈 clicável */
  transition: transform .2s ease, box-shadow .2s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0,0,0,.35);
}

.poster {
  width: 100%;
  aspect-ratio: 16/9;
  background: #0f0f0f;
  display: grid;
  place-items: center;
}
.poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.no-image { color: #777; font-size: 14px; }

.content { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.movie { font-weight: 600; font-size: 18px; }

.meta { display: flex; flex-wrap: wrap; gap: 8px; }
.pill {
  font-size: 13px;
  border: 1px solid #3a3a3a;
  background: #181818;
  border-radius: 999px;
  padding: 6px 10px;
  color: #ddd;
}
</style>
