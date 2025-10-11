<template>
  <div class="buy-card">
    <div class="row">
      <div class="title">Buy Tickets</div>
      <button class="x" @click="$emit('close')">×</button>
    </div>

    <div class="muted">Session #{{ sessionId }} — {{ movieTitle }}</div>

    <div class="field">
      <label>Row</label>
      <input type="number" v-model.number="row" min="1" />
    </div>
    <div class="field">
      <label>Seat</label>
      <input type="number" v-model.number="seat" min="1" />
    </div>

    <div class="field">
      <button class="add" @click="addTicket">Add seat</button>
    </div>

    <div v-if="tickets.length" class="chips">
      <span v-for="(t, i) in tickets" :key="i" class="chip">
        R{{ t.row }}-S{{ t.seat }}
        <button class="chipx" @click="remove(i)">×</button>
      </span>
    </div>

    <div class="error" v-if="error">{{ error }}</div>

    <div class="actions">
      <button class="primary" :disabled="!tickets.length || loading" @click="buy">
        {{ loading ? "Processing..." : "Confirm" }}
      </button>
      <button class="ghost" @click="$emit('close')">Cancel</button>
    </div>
  </div>
</template>

<script>
import { createOrder } from "@/api";

export default {
  name: "BuyTickets",
  props: {
    sessionId: { type: Number, required: true },
    movieTitle: { type: String, default: "" },
  },
  data: () => ({
    row: null,
    seat: null,
    tickets: [],
    loading: false,
    error: "",
  }),
  methods: {
    addTicket() {
      this.error = "";
      if (!this.row || !this.seat) {
        this.error = "Informe row e seat.";
        return;
      }
      this.tickets.push({
        row: Number(this.row),
        seat: Number(this.seat),
        movie_session: this.sessionId,
      });
      this.row = null;
      this.seat = null;
    },
    remove(i) {
      this.tickets.splice(i, 1);
    },
    async buy() {
      this.loading = true;
      this.error = "";
      try {
        const order = await createOrder(this.tickets);
        this.$emit("success", order);
        this.$emit("close");
      } catch (e) {
        this.error = "Não foi possível criar o pedido. Verifique lugares já tomados.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.buy-card { background:#111; color:#fff; border:1px solid #333; border-radius:16px; padding:14px; width:320px; }
.row { display:flex; justify-content:space-between; align-items:center; }
.title { font-weight:700; font-size:18px; }
.x { background:transparent; border:0; color:#bbb; font-size:20px; cursor:pointer; }
.muted { opacity:.75; font-size:12px; margin:6px 0 12px; }
.field { display:flex; gap:8px; align-items:center; margin:8px 0; }
.field label { width:56px; opacity:.9; }
.field input { flex:1; background:#0c0c0c; color:#fff; border:1px solid #333; border-radius:10px; padding:6px 8px; }
.add { background:#1f2937; border:1px solid #334155; color:#e5e7eb; border-radius:10px; padding:6px 10px; cursor:pointer; }
.chips { display:flex; flex-wrap:wrap; gap:6px; margin:8px 0; }
.chip { background:#222; border:1px solid #333; border-radius:999px; padding:4px 8px; font-size:12px; display:inline-flex; align-items:center; gap:6px; }
.chipx { background:transparent; border:0; color:#bbb; cursor:pointer; }
.error { color:#ef4444; margin-top:8px; }
.actions { display:flex; gap:8px; justify-content:flex-end; margin-top:12px; }
.primary { background:#ef4444; border:1px solid #ef4444; color:#fff; border-radius:10px; padding:6px 12px; cursor:pointer; }
.ghost { background:transparent; border:1px solid #333; color:#e5e7eb; border-radius:10px; padding:6px 12px; cursor:pointer; }
</style>
