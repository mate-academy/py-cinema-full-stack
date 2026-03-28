<template>
  <div v-if="active && isStaff" class="hall-container">
    <div class="header">Add a cinema hall</div>
    <div class="note">Please fill in the fields in details</div>
    <div class="container">
      <input-item label="Name" v-model="name" width="wide"></input-item>
      <div class="info-container">
        <input-item
          label="Number of rows"
          v-model="countRows"
          width="narrow"
          type="number"
        ></input-item>
        <input-item
          label="Number of seats in row"
          v-model="countSeatsInRow"
          width="narrow"
          type="number"
        ></input-item>
      </div>
    </div>
    <action-button
      label="Submit"
      @click="addCinemaHall"
      :disabled="!name || !countRows || !countSeatsInRow"
    ></action-button>
  </div>
</template>

<script>
import ActionButton from '../comps/ActionButton.vue';
import InputItem from '../comps/InputItem.vue';

export default {
  name: 'AddCinemaHallScreen',
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
    countSeatsInRow: 1
  }),
  methods: {
    hashHandler() {
      this.active = Boolean(window.location.hash.includes('cinema-halls') && window.location.hash.includes('add=true'));
    },
    async addCinemaHall() {
      try {
        await this.axios.post('/cinema/cinema-halls/', {
          name: this.name,
          rows: Number(this.countRows),
          seats_in_row: Number(this.countSeatsInRow)
        });

        this.name = '';
        this.countRows = 1;
        this.countSeatsInRow = 1;

        this.$router.push('/cinema-halls');
      } catch (err) {
        console.error('Failed to add hall:', err);
        alert('Помилка при створенні залу.');
      }
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
  },
  unmounted() {
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
  padding: 40px 20px;
}
.header {
  font-weight: 600;
  font-size: 50px;
  line-height: 61px;
  text-align: center;
}
.note {
  font-size: 25px;
  line-height: 31px;
  color: #888;
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
  width: 100%;
}

@media (max-width: 600px) {
  .info-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .header {
    font-size: 32px;
  }
}
</style>
