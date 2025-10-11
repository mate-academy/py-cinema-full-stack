<template>
  <div class="wrap" v-if="loaded">
    <div class="topbar">
      <button class="back" @click="$router.back()">← Back</button>
      <div class="title">
        <div class="movie">{{ movieTitle }}</div>
        <div class="meta">
          <span class="pill">{{ fmtDateTime(session.show_time) }}</span>
          <span class="pill">{{ hallName }} · {{ rows }}×{{ seatsInRow }} (cap {{ capacity }})</span>
        </div>
      </div>
      <div class="spacer"></div>
    </div>

    <!-- TELA -->
    <div class="screen">SCREEN</div>

    <!-- MAPA CURVADO -->
    <div class="stage">
      <div v-for="r in rows" :key="'row-'+r" class="seat-row" :style="rowStyle(r)">
        <button
          v-for="s in seatsInRow"
          :key="`r${r}-s${s}`"
          class="seat"
          :class="seatClass(r, s)"
          :disabled="isTaken(r, s)"
          @click="toggleSeat(r, s)"
          :title="`Row ${r} · Seat ${s}`"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <!-- LEGENDA -->
    <div class="legend">
      <span class="dot available"></span> Available
      <span class="dot selected"></span> Selected
      <span class="dot taken"></span> Taken
    </div>

    <!-- AÇÕES -->
    <div class="actions">
      <div class="summary">
        <span v-if="selectedSeats.length">
          {{ selectedSeats.length }} seat(s) — total {{ money(selectedSeats.length * unitPrice) }}
        </span>
        <span v-else class="muted">Select seats to continue.</span>
      </div>
      <button class="buy" :disabled="!selectedSeats.length || buying" @click="buy">
        {{ buying ? 'Processing…' : 'Buy' }}
      </button>
    </div>

    <div class="error" v-if="errorText">{{ errorText }}</div>
  </div>

  <div class="wrap" v-else>
    <div class="loading">Loading session…</div>
  </div>
</template>

<script>
import { fetchMovieSessionDetail, createOrder } from "@/api";

export default {
  name: "MovieSessionDetailScreen",
  data: () => ({
    id: null,
    session: null,
    takenSet: new Set(),
    selectedSeats: [],
    buying: false,
    errorText: "",
    loaded: false,
    unitPrice: Number((import.meta.env && import.meta.env.VITE_TICKET_PRICE) || 20),
  }),
  computed: {
    rows() { return this.session?.cinema_hall?.rows || 0; },
    seatsInRow() { return this.session?.cinema_hall?.seats_in_row || 0; },
    capacity() { return this.rows * this.seatsInRow; },
    movieTitle() { return this.session?.movie?.title || "—"; },
    hallName() { return this.session?.cinema_hall?.name || "—"; },
  },
  methods: {
    async load() {
      this.errorText = "";
      try {
        const data = await fetchMovieSessionDetail(this.id);
        this.session = data;

        const set = new Set();
        for (const t of data?.taken_places || []) {
          const r = Number(t?.row), s = Number(t?.seat);
          if (Number.isFinite(r) && Number.isFinite(s)) set.add(`${r}-${s}`);
        }
        this.takenSet = set;
        this.loaded = true;
      } catch (e) {
        this.errorText = this.prettyErr(e);
      }
    },
    prettyErr(err) {
      const res = err?.response;
      if (!res) return err?.message || "Network error";
      if (res.data && typeof res.data === "object") {
        const first = Object.values(res.data)[0];
        if (Array.isArray(first)) return first[0];
        if (typeof first === "string") return first;
      }
      return res.data?.detail || res.data?.error || `HTTP ${res.status}`;
    },
    isTaken(r, s) { return this.takenSet.has(`${r}-${s}`); },
    isSelected(r, s) { return this.selectedSeats.some(it => it.row === r && it.seat === s); },
    toggleSeat(r, s) {
      if (this.isTaken(r, s)) return;
      const i = this.selectedSeats.findIndex(it => it.row === r && it.seat === s);
      if (i >= 0) this.selectedSeats.splice(i, 1);
      else this.selectedSeats.push({ row: r, seat: s });
    },
    seatClass(r, s) { return { taken: this.isTaken(r, s), selected: this.isSelected(r, s) }; },
    rowStyle(r) {
      // curva/afunilamento com perspectiva
      const total = this.rows || 1;
      const t = (r - 1) / Math.max(1, total - 1); // 0..1
      const rotate = 18 + t * 22;                 // 18° → 40°
      const scale = 1 - t * 0.18;                 // 1 → 0.82
      const translateZ = 40 + t * 80;             // 40 → 120
      return { transform: `translateZ(${translateZ}px) rotateX(${rotate}deg) scale(${scale})` };
    },
    fmtDateTime(iso) {
      const d = new Date(String(iso).replace(" ", "T"));
      return isNaN(d) ? iso : d.toLocaleString();
    },
    money(n) {
      const num = Number(n);
      return Number.isFinite(num) ? num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";
    },
    async buy() {
      if (!this.selectedSeats.length) return;
      this.buying = true; this.errorText = "";
      try {
        const tickets = this.selectedSeats.map(t => ({
          row: t.row, seat: t.seat, movie_session: this.id,
        }));
        const order = await createOrder(tickets);
        this.selectedSeats = [];
        await this.load();
        alert(`Order #${order.id} criado com ${order.tickets.length} ticket(s).`);
      } catch (e) {
        this.errorText = this.prettyErr(e);
      } finally {
        this.buying = false;
      }
    },
  },
  created() {
    this.id = Number(this.$route?.params?.id);
    this.load();
  },
};
</script>

<style scoped>
.wrap { color:#fff; padding:16px; }
.topbar { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.back { background:#111; color:#fff; border:1px solid #333; border-radius:10px; padding:6px 10px; cursor:pointer; }
.title { display:flex; flex-direction:column; gap:4px; }
.movie { font-weight:800; font-size:20px; }
.meta { display:flex; gap:8px; flex-wrap:wrap; }
.pill { border:1px solid #333; border-radius:999px; padding:2px 8px; font-size:12px; opacity:.9; }
.spacer { flex:1; }

.screen {
  margin: 14px auto 18px;
  width: min(780px, 92%);
  height: 22px;
  border-radius: 0 0 18px 18px;
  background:
    radial-gradient(120px 16px at 50% -6px, rgba(255,255,255,.22), rgba(255,255,255,0)),
    linear-gradient(to bottom, #e5e5e5 0%, #bbb 100%);
  color:#111; font-weight:700; letter-spacing: 2px;
  text-align:center; line-height:22px;
  box-shadow: 0 8px 24px rgba(255,255,255,.08);
}

.stage { perspective: 700px; transform-style: preserve-3d; margin: 0 auto; width: min(920px, 96%); padding: 12px 8px 20px; background: radial-gradient(60% 100% at 50% 10%, rgba(255,255,255,.04), rgba(0,0,0,0)); border-radius: 20px; border:1px solid #222; }
.seat-row { display:flex; justify-content:center; gap: 10px; transform-origin: center top; transition: transform .15s ease; margin: 6px 0; }
.seat { width: 30px; height: 30px; border-radius: 6px; border:1px solid #293044; background: linear-gradient(#0e1420, #121a2b); color:#cdd3e3; font-size: 12px; cursor: pointer; box-shadow: inset 0 -2px 0 rgba(255,255,255,.03), 0 2px 4px rgba(0,0,0,.3); transition: transform .06s ease, background .2s ease, border-color .2s ease, color .2s ease; }
.seat:hover { transform: translateY(-1px); }
.seat.selected { border-color:#22c55e; background: linear-gradient(#0c2414, #0f301a); color:#dcfce7; }
.seat.taken { border-color:#5b0f0f; background: linear-gradient(#2a0e0e, #2f1212); color:#fca5a5; cursor:not-allowed; opacity:.85; }

.legend { display:flex; align-items:center; gap:14px; margin: 12px auto; width: min(780px, 92%); opacity:.95; }
.dot { display:inline-block; width:12px; height:12px; border-radius:50%; margin-right:6px; vertical-align:middle; }
.available { background: #1e293b; border:1px solid #334155; }
.selected  { background: #166534; border:1px solid #22c55e; }
.taken     { background: #7f1d1d; border:1px solid #b91c1c; }

.actions { display:flex; align-items:center; gap:10px; justify-content:space-between; margin: 10px auto 0; width: min(780px, 92%); }
.summary { font-weight:600; }
.summary .muted { opacity:.7; font-weight:400; }
.buy { background:#ef4444; border:1px solid #ef4444; color:#fff; border-radius:10px; padding:8px 14px; cursor:pointer; }
.buy:disabled { opacity:.6; cursor:not-allowed; }

.loading { text-align:center; opacity:.85; }
.error { margin-top:10px; color:#fca5a5; text-align:center; }
</style>
