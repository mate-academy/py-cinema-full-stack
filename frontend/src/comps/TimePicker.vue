<template>
  <div class="time-picker-wrapper">
    <div class="label">Select time range</div>
    <v-date-picker
      v-model="internalTime"
      mode="time"
      is-dark
      is24hr
      :rules="timeRules"
      :minute-increment="5"
    >
      <template #default="{ inputValue, inputEvents }">
        <div class="picker-input-container">
          <input
            :value="inputValue"
            v-on="inputEvents"
            readonly
            class="time-input"
          />
          <div class="btn-picker">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2"/>
              <path d="M10 5V10L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
      </template>
    </v-date-picker>
  </div>
</template>

<script>
export default {
  name: 'TimePicker',
  // Декларуємо еміти для Vue 3
  emits: ['update:modelValue'],
  props: {
    // Vue 3 використовує modelValue замість value
    modelValue: {
      type: [Date, String],
      default: () => new Date()
    }
  },
  computed: {
    // Синтаксис V-Calendar 3.x для обмеження годин
    timeRules() {
      return {
        hours: { min: 10, max: 22 },
      };
    },
    internalTime: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  }
};
</script>

<style scoped>
.time-picker-wrapper {
  width: 100%;
}

.picker-input-container {
  border-radius: 10px;
  height: 50px;
  background-color: var(--secondary-bg);
  width: 100%;
  padding: 0 15px;
  border: 1px solid transparent;
  position: relative;
  display: flex;
  align-items: center;
  transition: border-color 0.2s;
}

.picker-input-container:focus-within {
  border-color: var(--border);
}

.label {
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  margin-bottom: 8px;
  color: var(--main-font);
}

.time-input {
  height: 100%;
  width: 100%;
  background: transparent;
  border: none;
  color: var(--main-font);
  outline: none;
  cursor: pointer;
  font-size: 16px;
}

.btn-picker {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--main-font);
  pointer-events: none;
}
</style>
