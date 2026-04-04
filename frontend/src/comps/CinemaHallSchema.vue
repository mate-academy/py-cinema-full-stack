<template>
  <div class="hall-schema">
    <div class='border'></div>
    <div class="screen">Screen</div>
    <div class="schema">
      <div>
        <div v-for="index in numOfRows" :key="`row-${index}`" class="rows">{{index + 1}}</div>
      </div>
      <div class="container">
        <div v-for="colIndex in numOfCols" class="col">
          <div
          v-for="rowIndex in numOfRows"
          :key="`seat-${colIndex}-${rowIndex}`"
          :class="[
          'seat',
          takenSeats.find(seat => seat.row === rowIndex + 1 && seat.seat === colIndex + 1) && 'booked',
          chosenSeats.find(seat => seat.row === rowIndex + 1 && seat.seat === colIndex +  1) && 'reserved'
          ]"
          @click="chooseSeat(colIndex, rowIndex)"></div>
        </div>
      </div>
      <div>
        <div v-for="index in numOfRows" :key="`row-${index}`" class="rows">{{index + 1}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import range from 'lodash.range';

export default {
  props: {
    takenSeats: {
      type: Array,
      default: () => []
    },
    cinemaHall: {
      type: Object,
      default: () => {}
    }
  },
  data: () => ({
    chosenSeats: []
  }),
  computed: {
    numOfRows () {
      return range(this.cinemaHall.rows);
    },

    numOfCols () {
      return range(this.cinemaHall.seats_in_row);
    }
  },
  methods: {
    chooseSeat (colIndex, rowIndex) {
      const seatIsChosen = this.chosenSeats.find(seat => seat.row === rowIndex + 1 && seat.seat === colIndex + 1);
      if (seatIsChosen) {
        this.chosenSeats = this.chosenSeats.filter(seat => seat.row !== rowIndex + 1 || seat.seat !== colIndex + 1);
      } else {
        this.chosenSeats.push({
          row: rowIndex + 1,
          seat: colIndex + 1
        });
      }
      this.$emit('choose-seat', this.chosenSeats);
    }
  },
  watch: {
    takenSeats: {
      handler () {
        this.chosenSeats = [];
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.hall-schema {
  display: flex;
  flex-direction: column;
}

.schema {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.rows {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  line-height: 25px;
}

.container {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.border {
  grid-column: 1 / -1;
  width: 100%;
  height: 60px;
  border: solid 2px var(--main-font);
  border-color: var(--main-font) transparent transparent transparent;
  border-radius: 90%/100px 100px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  position: relative;
}

.screen {
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translate(-50%);
  font-size: 25px;
  line-height: 30px;
  background-color: var(--main-bg);
}

.seat {
  width: 25px;
  height: 25px;
  border-radius: 5px;
  background-color: #400;
  cursor: pointer;
}
.seat.booked {
  background-color: var(--border);
  pointer-events: none;
}
.seat.reserved {
  background-color: var(--main-font);
}
</style>
