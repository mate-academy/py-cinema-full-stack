<template>
  <div>
    <div class="label">Select date</div>
    <v-date-picker
      v-model="internalDate"
      class="picker"
      is-dark
      :min-date="new Date()"
      :max-date="maxDate"
    >
      <template #default="{ inputValue, inputEvents }">
        <div class="picker-container">
          <input
            :value="inputValue"
            v-on="inputEvents"
            readonly
          />
          <div class="btn-picker">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M3 8h14M7 3v2M13 3v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
      </template>
    </v-date-picker>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'DatePicker',
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: [Date, String],
      default: () => new Date()
    }
  },
  computed: {
    maxDate() {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    },
    internalDate: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', moment(value).format('YYYY-MM-DD'));
      }
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
  display: flex;
  align-items: center;
}

.picker-container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
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
  background-color: transparent;
  border: none;
  color: var(--main-font);
  outline: none;
  user-select: none;
  cursor: pointer;
}

.btn-picker {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 15px;
  right: 15px;
  pointer-events: none;
  color: var(--main-font);
}
</style>
