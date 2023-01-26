<template>
  <div>
    <div class="label">Select time range</div>
    <v-date-picker mode="time" class="picker" v-model="time" is-dark is24hr :validHours="validHours" :minute-increment="5">
      <template v-slot="{ inputValue, togglePopover }">
        <input
          :value="inputValue"
          @click="togglePopover()"
          readonly
        />
        <div class="btn-picker">
          <svg width="20" height="20" viewbox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <use href="/assets/icons/clock.svg#clock"></use>
          </svg>
        </div>
      </template>
    </v-date-picker>
  </div>
</template>

<script>
export default {
  data: () => ({
    time: new Date()
  }),
  computed: {
    validHours () {
      return { min: 10, max: 22 };
    }
  },
  watch: {
    time (value) {
      this.$emit('input', value);
    }
  }
};
</script>

<style scoped>
.picker {
  border-radius: 10px;
  height: 50px;
  background-color: var(--secondary-bg);
  width: 100%;
  padding: 0 10px;
  border: 1px solid transparent;
  position: relative;
  display: block;
}
.picker:focus-within {
  border-color: var(--border);
}

.label {
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  margin-bottom: 8px;
}

input {
  height: 100%;
  width: 100%;
  background-color: var(--secondary-bg);
  border: none;
  color: var(--main-font);
  outline: none;
  user-select: none;
}

.btn-picker {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 15px;
  right: 15px;
  pointer-events: none;
}
</style>
