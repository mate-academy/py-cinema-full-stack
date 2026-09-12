<template>
    <div v-if="active && isStaff" class="hall-container">
    <div class="header">Add a cinema hall</div>
    <div class="note">Please fill in the fields in details</div>
    <div class="container">
      <input-item label="Name" v-model="name" width="wide"></input-item>
      <div class="info-container">
        <input-item label="Number of rows" v-model="countRows" width="narrow"></input-item>
        <input-item label="Number of seats in row" v-model="countSeatsInRow" width="narrow"></input-item>
      </div>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <action-button label="Submit" @click="addCinemaHall" :disabled="!isValid"></action-button>
  </div>
</template>

<script>
import axios from 'axios';

import ActionButton from '../comps/ActionButton.vue';
import InputItem from '../comps/InputItem.vue';

export default {
  props: {
    isStaff: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    active: false,
    name: '',
    countRows: 1,
    countSeatsInRow: 1,
    error: ''
  }),
  computed: {
    token () {
      return localStorage.getItem('access');
    },

    isValid () {
      return Boolean(
        this.name.trim() &&
        Number.isInteger(Number(this.countRows)) && Number(this.countRows) > 0 &&
        Number.isInteger(Number(this.countSeatsInRow)) && Number(this.countSeatsInRow) > 0
      );
    }
  },
  methods: {
    hashHandler () {
      this.active = Boolean(location.hash.match('cinema-halls\\?add=true'));
    },

    async addCinemaHall () {
      this.error = '';
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        };

        await axios.post(
          '/api/cinema/cinema_halls/',
          {
            name: this.name,
            rows: Number(this.countRows),
            seats_in_row: Number(this.countSeatsInRow)
          },
          config
        );

        location.hash = '#/cinema-halls';
      } catch (err) {
        this.error = this.getErrorMessage(err, 'Unable to create the cinema hall.');
      }
    },

    getErrorMessage (err, fallback) {
      const data = err.response && err.response.data;
      if (!data) return fallback;
      if (typeof data === 'string') return data;
      return Object.values(data).flat().join(' ') || fallback;
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
    ActionButton,
    InputItem
  }
};
</script>

<style scoped>
.hall-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.header {
  font-weight: 600;
  font-size: 50px;
  line-height: 61px;
}

.note {
  font-size: 25px;
  line-height: 31px;
}

.container {
  width: 100%;
  max-width: 570px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-bottom: 36px;
}

.info-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 60px;
}

.error {
  color: var(--red);
}
</style>
