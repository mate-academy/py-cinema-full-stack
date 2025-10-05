<template>
  <div v-if="active" class="wrapper">
    <div class="title">My Orders</div>

    <div v-if="loading" class="info">Loading orders…</div>
    <div v-else-if="errorText" class="error">{{ errorText }}</div>

    <div v-else>
      <div v-if="!orders.length" class="empty">You have no orders yet.</div>

      <div class="orders">
        <div v-for="o in orders" :key="o.id" class="order-card">
          <div class="order-head">
            <span class="order-id">#{{ o.id }}</span>

            <div class="order-head-right">
              <span class="order-total">
                {{ money(totalFor(o)) }}
                <small class="muted" v-if="o.tickets?.length">
                  ({{ o.tickets.length }} × {{ money(unitPriceFor(o)) }})
                </small>
              </span>

              <button
                class="cancel-btn"
                :disabled="!canCancel(o) || cancellingId === o.id"
                @click.stop="cancelOrder(o)"
                v-if="o.tickets && o.tickets.length"
                title="Cancel this order"
              >
                {{ cancellingId === o.id ? 'Cancelling…' : 'Cancel' }}
              </button>

              <span class="order-date">{{ formatDateTime(o.created_at) }}</span>
            </div>
          </div>

          <div class="tickets">
            <div v-for="t in (o.tickets || [])" :key="t.id" class="ticket">
              <div class="poster">
                <img
                  v-if="t.movie_session && t.movie_session.movie_image"
                  :src="absoluteMedia(t.movie_session.movie_image)"
                  alt="poster"
                />
                <div v-else class="placeholder">No Image</div>
              </div>

              <div class="t-content">
                <div class="movie">{{ t.movie_session?.movie_title || '—' }}</div>
                <div class="meta">
                  <span class="pill">{{ formatTime(t.movie_session?.show_time) }}</span>
                  <span class="pill">{{ t.movie_session?.cinema_hall_name }}</span>
                  <span class="pill">Row {{ t.row }}, Seat {{ t.seat }}</span>
                </div>
              </div>
            </div>
          </div>
        </div> <!-- order-card -->
      </div> <!-- orders -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderListScreen',

  data: () => ({
    active: false,
    loading: false,
    orders: [],
    errorText: '',
    cancellingId: null,
    fallbackPrice: Number(import.meta.env.VITE_TICKET_PRICE || 20)
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

    absoluteMedia (pathOrUrl) {
      if (!pathOrUrl) return '';
      try { return new URL(pathOrUrl).toString(); }
      catch { return this.buildUrl(pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`); }
    },

    // 'YYYY-MM-DDTHH:mm:ss' -> 'HH:mm'
    formatTime (isoLocal) {
      const m = String(isoLocal || '').match(/T(\d{2}):(\d{2})/);
      return m ? `${m[1]}:${m[2]}` : '—';
    },

    // 'YYYY-MM-DDTHH:mm:ss' -> 'YYYY/MM/DD HH:mm'
    formatDateTime (isoLocal) {
      if (!isoLocal) return '—';
      const d = new Date(String(isoLocal).replace(' ', 'T'));
      const pad = (n) => String(n).padStart(2, '0');
      const y = d.getFullYear();
      const m = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hh = pad(d.getHours());
      const mm = pad(d.getMinutes());
      return `${y}/${m}/${day} ${hh}:${mm}`;
    },

    // Usa BE se vier (string "20.00"), senão fallback .env
    unitPriceFor (order) {
      const be = Number(order?.unit_price);
      return Number.isFinite(be) ? be : this.fallbackPrice;
    },
    // Usa BE se vier (string "40.00"), senão qty × fallback
    totalFor (order) {
      const be = Number(order?.total);
      if (Number.isFinite(be)) return be;
      const qty = Array.isArray(order?.tickets) ? order.tickets.length : 0;
      return qty * this.fallbackPrice;
    },
    money (n) {
      if (Number.isNaN(Number(n))) return '—';
      return Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },

    // Pega o menor show_time dentre os tickets do pedido
    earliestShowTime (order) {
      const times = (order?.tickets || [])
        .map(t => t?.movie_session?.show_time)
        .filter(Boolean)
        .map(s => new Date(String(s).replace(' ', 'T')).getTime());
      return times.length ? Math.min(...times) : null;
    },
    canCancel (order) {
      const ts = this.earliestShowTime(order);
      if (!ts) return false;
      return ts > Date.now(); // somente antes do início
    },

    async cancelOrder (order) {
      if (!this.token) { location.hash = '#/sign-in'; return; }
      if (!this.canCancel(order)) return;
      const ok = window.confirm('Do you really want to cancel this order? Seats will be released.');
      if (!ok) return;

      this.cancellingId = order.id;
      this.errorText = '';
      try {
        const url = this.buildUrl(`/api/cinema/orders/${order.id}/`);
        await this.axios.delete(url, { headers: this.authHeader() });
        await this.fetchOrders();
      } catch (err) {
        this.errorText = this.prettyErr(err);
      } finally {
        this.cancellingId = null;
      }
    },

    async fetchOrders () {
      if (!this.token) { location.hash = '#/sign-in'; return; }
      this.loading = true;
      this.errorText = '';
      try {
        const url = this.buildUrl('/api/cinema/orders/');
        const { data } = await this.axios.get(url, { headers: this.authHeader() });
        this.orders = Array.isArray(data) ? data : (data?.results || []);
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('access'); localStorage.removeItem('refresh');
          location.hash = '#/sign-in';
          return;
        }
        this.errorText = this.prettyErr(err);
        this.orders = [];
      } finally {
        this.loading = false;
      }
    },

    hashHandler () {
      this.active = /#\/orders(?:$|\?)/.test(location.hash);
      if (this.active) this.fetchOrders();
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
.title { font-size: 44px; font-weight: 700; }
.info, .error, .empty { text-align: center; margin-top: 24px; opacity: .9; }
.error { color: #ff6b6b; }

.orders { display: grid; gap: 18px; margin-top: 12px; }
.order-card {
  border: 1px solid #2a2a2a;
  background: #121212;
  border-radius: 14px;
  padding: 14px;
}
.order-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px; font-weight: 600;
}
.order-id { opacity: .9; }
.order-head-right { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.order-total { font-weight: 700; }
.order-total .muted { opacity: .7; font-weight: 400; font-size: 12px; }
.order-date { opacity: .7; font-size: 14px; }

.cancel-btn {
  border: 1px solid #ff4d4d;
