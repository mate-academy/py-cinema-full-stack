<template>
  <div class="hall-schema">
    <div class="border">
      <div class="screen">Screen</div>
    </div>
    <div class="schema">
      <div class="row-numbers">
        <div v-for="n in cinemaHall.rows" :key="`row-l-${n}`" class="row-number">{{ n }}</div>
      </div>

      <div class="container">
        <div v-for="colIndex in cinemaHall.seats_in_row" :key="`col-${colIndex}`" class="col">
          <div
            v-for="rowIndex in cinemaHall.rows"
            :key="`seat-${colIndex}-${rowIndex}`"
            :class="[
              'seat',
              isSeatTaken(rowIndex, colIndex) && 'booked',
              isSeatChosen(rowIndex, colIndex) && 'reserved'
            ]"
            @click="chooseSeat(colIndex, rowIndex)"
          ></div>
        </div>
      </div>

      <div class="row-numbers">
        <div v-for="n in cinemaHall.rows" :key="`row-r-${n}`" class="row-number">{{ n }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CinemaHallSchema',
  emits: ['choose-seat'],
  props: {
    takenSeats: {
      type: Array,
      default: () => []
    },
    cinemaHall: {
      type: Object,
      default: () => ({ rows: 0, seats_in_row: 0 })
    }
  },
  data: () => ({
    chosenSeats: []
  }),
  methods: {
    isSeatTaken(row, seat) {
      return this.takenSeats.some(s => s.row === row && s.seat === seat);
    },
    isSeatChosen(row, seat) {
      return this.chosenSeats.some(s => s.row === row && s.seat === seat);
    },
    chooseSeat(colIndex, rowIndex) {
      const row = rowIndex;
      const seat = colIndex;

      if (this.isSeatTaken(row, seat)) return;

      const index = this.chosenSeats.findIndex(s => s.row === row && s.seat === seat);

      if (index !== -1) {
        this.chosenSeats.splice(index, 1);
      } else {
        this.chosenSeats.push({ row, seat });
      }

      this.$emit('choose-seat', [...this.chosenSeats]);
    }
  },
  watch: {
    takenSeats: {
      handler() {
        this.chosenSeats = [];
      },
      immediate: true,
      deep: true
    }
  }
};
</script>

<style scoped>
.hall-schema {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  user-select: none;
}

.border {
  width: 80%;
  height: 40px;
  border-top: 4px solid var(--main-font);
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  margin-bottom: 40px;
  position: relative;
  display: flex;
  justify-content: center;
}

.screen {
  position: absolute;
  top: -15px;
  background-color: var(--main-bg);
  padding: 0 20px;
  font-size: 20px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--main-font);
}

.schema {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.container {
  display: flex;
  gap: 10px;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row-numbers {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row-number {
  height: 25px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.seat {
  width: 25px;
  height: 25px;
  border-radius: 6px;
  background-color: #331a1a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.seat:hover:not(.booked) {
  transform: scale(1.1);
  background-color: #552222;
}

.seat.booked {
  background-color: #222;
  cursor: not-allowed;
  opacity: 0.3;
}

.seat.reserved {
  background-color: var(--red);
  box-shadow: 0 0 10px var(--red);
}
</style>
