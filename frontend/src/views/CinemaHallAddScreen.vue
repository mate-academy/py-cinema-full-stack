<template>
  <div v-if="active && isStaff" class="hall-container">
    <div class="header">Add a cinema hall</div>
    <div class="note">Please fill in the fields in details</div>

    <div class="form">
      <input-item
        label="Name"
        width="wide"
        v-model="name"
        placeholder="IMAX Alpha"
      />

      <div class="row">
        <input-item
          label="Number of rows"
          v-model="rows"
          placeholder="12"
        />
        <input-item
          label="Number of seats in row"
          v-model="seatsInRow"
          placeholder="22"
        />
      </div>
    </div>

    <action-button
      :label="loading ? 'Submitting…' : 'Submit'"
      @click="addHall"
      :disabled="loading || !isValid"
    />

    <p v-if="errorText" style="color:#ff6b6b;margin-top:10px">{{ errorText }}</p>
    <p v-if="successText" style="color:#43d17a;margin-top:10px">{{ successText }}</p>
  </div>
</template>

<script>
import api from '@/api';
import ActionButton from '../comps/ActionButton.vue';
import InputItem from '../comps/InputItem.vue';

export default {
  name: 'CinemaHallAddScreen',
  props: { isStaff: { type: Boolean, default: false } },
  components: { ActionButton, InputItem },

  data: () => ({
    active: false,
    loading: false,
    name: '',
    rows: '',
    seatsInRow: '',
    errorText: '',
    successText: ''
  }),

  computed: {
    token() { return localStorage.getItem('access'); },
    isValid() {
      const r = this.toInt(this.rows);
      const s = this.toInt(this.seatsInRow);
      return Boolean(this.name?.trim()) && r > 0 && s > 0;
    }
  },

  methods: {
    authHeader() { return this.token ? { Authorization: `Bearer ${this.token}` } : {}; },

    prettyErr(err) {
      const res = err?.response;
      if (!res) return err?.message || 'Network error';
      if (res.data && typeof res.data === 'object') {
        const first = Object.values(res.data)[0];
        if (Array.isArray(first)) return first[0];
        if (typeof first === 'string') return first;
      }
      return res.data?.detail || res.data?.error || `HTTP ${res.status}`;
    },

    toInt(v) {
      const m = String(v ?? '').match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    },

    async addHall() {
      if (!this.token) { location.hash = '#/sign-in'; return; }
      this.errorText = ''; this.successText = '';
      this.loading = true;

      const payload = {
        name: this.name?.trim(),
        rows: this.toInt(this.rows),
        seats_in_row: this.toInt(this.seatsInRow)
      };

      try {
        // ✅ endpoint correto com hífen e barra final
        await api.post('/api/cinema/cinema-halls/', payload, {
          headers: { ...this.authHeader(), 'Content-Type': 'application/json' }
        });
        this.successText = '✅ Cinema hall created!';
        setTimeout(() => { location.hash = '#/cinema-halls'; }, 800);
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('access'); localStorage.removeItem('refresh');
          location.hash = '#/sign-in';
          return;
        }
        this.errorText = this.prettyErr(err);
        // eslint-disable-next-line no-console
        console.error('[create hall] error:', err);
      } finally {
        this.loading = false;
      }
    },

    hashHandler() {
      // abre quando URL termina com #/cinema-halls?add=true
      this.active = Boolean(location.hash.match(/cinema-halls\?add=true$/));
    }
  },

  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
  },
  beforeDestroy() {
    window.removeEventListener('hashchange', this.hashHandler);
  }
};
</script>

<style scoped>
.hall-container {
  display: flex; flex-direction: column; align-items: center; gap: 24px;
}
.header { font-weight: 600; font-size: 50px; line-height: 61px; }
.note { font-size: 25px; line-height: 31px; }

.form { width: 100%; max-width: 900px; display: flex; flex-direction: column; gap: 24px; }
.row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; }
</style>
