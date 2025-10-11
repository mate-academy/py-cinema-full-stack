<template>
  <div class="wrapper">
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
                <small class="muted" v-if="o.tickets && o.tickets.length">
                  ({{ o.tickets.length }} × {{ money(unitPriceFor(o)) }})
                </small>
              </span>

              <button
                class="cancel-btn"
                :disabled="!canCancel(o) || cancellingId === o.id"
                @click.stop="onCancel(o)"
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
                <div class="movie">
                  {{ (t.movie_session && t.movie_session.movie_title) || '—' }}
                </div>
                <div class="meta">
                  <span class="pill">{{ formatTime(t.movie_session && t.movie_session.show_time) }}</span>
                  <span class="pill">{{ t.movie_session && t.movie_session.cinema_hall_name }}</span>
                  <span class="pill">Row {{ t.row }}, Seat {{ t.seat }}</span>
                </div>
              </div>
            </div>
          </div>
        </div> <!-- order-card -->
      </div> <!-- orders -->

      <div class="pagination" v-if="next || previous">
        <button :disabled="!previous" @click="go(previous)">Prev</button>
        <button :disabled="!next" @click="go(next)">Next</button>
      </div>
    </div>
  </div>
</template>

<script>
import api, { getOrders, cancelOrder as cancelOrderApi } from "@/api";

export default {
  name: "OrderListScreen",

  data: () => ({
    loading: false,
    orders: [],
    errorText: "",
    cancellingId: null,
    next: null,
    previous: null,
    // fallback para quando o backend não enviar unit_price/total (você pode trocar a moeda se quiser)
    fallbackPrice: Number((import.meta.env && import.meta.env.VITE_TICKET_PRICE) || 20),
  }),

  mounted() {
    this.fetchOrders();
  },

  methods: {
    prettyErr(err) {
      const res = err && err.response;
      if (!res) return (err && err.message) || "Network error";
      if (res.data && typeof res.data === "object") {
        const first = Object.values(res.data)[0];
        if (Array.isArray(first)) return first[0];
        if (typeof first === "string") return first;
      }
      return res.data?.detail || res.data?.error || `HTTP ${res.status}`;
    },

    absoluteMedia(pathOrUrl) {
      if (!pathOrUrl) return "";
      try {
        return new URL(pathOrUrl).toString(); // já absoluta
      } catch {
        // relativo do backend (ex.: /media/...)
        const base = api?.defaults?.baseURL || "/";
        const rel = String(pathOrUrl).startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
        return new URL(rel, base || window.location.origin).toString();
      }
    },

    // 'YYYY-MM-DDTHH:mm:ss' -> 'HH:mm'
    formatTime(isoLocal) {
      const s = String(isoLocal || "");
      const m = s.match(/T(\d{2}):(\d{2})/);
      return m ? `${m[1]}:${m[2]}` : "—";
    },

    // 'YYYY-MM-DDTHH:mm:ss' -> 'YYYY/MM/DD HH:mm'
    formatDateTime(isoLocal) {
      if (!isoLocal) return "—";
      const d = new Date(String(isoLocal).replace(" ", "T"));
      const pad = (n) => String(n).padStart(2, "0");
      const y = d.getFullYear();
      const m = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hh = pad(d.getHours());
      const mm = pad(d.getMinutes());
      return `${y}/${m}/${day} ${hh}:${mm}`;
    },

    // Usa BE se vier (string "20.00"), senão fallback
    unitPriceFor(order) {
      const be = Number(order && order.unit_price);
      return Number.isFinite(be) ? be : this.fallbackPrice;
    },

    // Usa BE se vier (string "40.00"), senão qty × fallback
    totalFor(order) {
      const be = Number(order && order.total);
      if (Number.isFinite(be)) return be;
      const qty = Array.isArray(order && order.tickets) ? order.tickets.length : 0;
      return qty * this.fallbackPrice;
    },

    money(n) {
      const num = Number(n);
      if (!Number.isFinite(num)) return "—";
      // Ajuste a moeda se quiser. Mantive BRL como no seu código.
      return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    },

    // Pega o menor show_time dentre os tickets do pedido
    earliestShowTime(order) {
      const times = (order?.tickets || [])
        .map((t) => t && t.movie_session && t.movie_session.show_time)
        .filter(Boolean)
        .map((s) => new Date(String(s).replace(" ", "T")).getTime());
      return times.length ? Math.min(...times) : null;
    },

    canCancel(order) {
      const ts = this.earliestShowTime(order);
      if (!ts) return false;
      return ts > Date.now(); // somente antes da sessão
    },

    async onCancel(order) {
      if (!this.canCancel(order)) return;
      const ok = window.confirm("Do you really want to cancel this order? Seats will be released.");
      if (!ok) return;

      this.cancellingId = order.id;
      this.errorText = "";
      try {
        await cancelOrderApi(order.id);
        await this.fetchOrders();
      } catch (err) {
        this.errorText = this.prettyErr(err);
      } finally {
        this.cancellingId = null;
      }
    },

    async fetchOrders(url) {
      this.loading = true;
      this.errorText = "";
      try {
        let data;
        if (url) {
          // DRF next/previous podem ser absolutos — usamos a instância axios para manter cabeçalhos/interceptores
          const res = await api.get(url);
          data = res.data;
        } else {
          data = await getOrders(); // helper do api
        }
        this.orders = Array.isArray(data) ? data : (data?.results || []);
        this.next = data?.next || null;
        this.previous = data?.previous || null;
      } catch (err) {
        this.errorText = this.prettyErr(err);
        this.orders = [];
        this.next = this.previous = null;
      } finally {
        this.loading = false;
      }
    },

    go(url) {
      if (url) this.fetchOrders(url);
    },
  },
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
  background: transparent;
  color: #ff4d4d;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 14px;
  cursor: pointer;
}
.cancel-btn[disabled] { opacity: .5; cursor: not-allowed; }
.cancel-btn:not([disabled]):hover { background: rgba(255, 77, 77, .12); }

.tickets { display: grid; gap: 10px; }
.ticket { display: grid; grid-template-columns: 70px 1fr; gap: 10px; align-items: center; }

.poster { width: 70px; height: 90px; background: #0e0e0e; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.poster img { width: 100%; height: 100%; object-fit: cover; }
.placeholder { font-size: 12px; opacity: .7; }

.t-content { display: flex; flex-direction: column; gap: 6px; }
.movie { font-weight: 600; }
.meta { display: flex; gap: 6px; flex-wrap: wrap; }
.pill {
  border: 1px solid #2a2a2a;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
  opacity: .9;
}

.pagination { margin-top: 12px; display: flex; gap: 8px; justify-content: center; }
.pagination button {
  border: 1px solid #333;
  background: #111;
  color: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
}
.pagination button:disabled { opacity: .5; cursor: not-allowed; }
</style>
