<template>
  <div
    :class="['multiselect', shownOptions && 'active']"
    @click="toggleOptions"
  >
    <div class="label">{{ label }}</div>
    <div class="selected">
      <div class="selected-container">
        <span v-if="selectedOption?.id">{{ selectedOption.name }}</span>
      </div>
      <div :class="['arrow', shownOptions && 'toggled']">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 7l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
    <div v-if="shownOptions" class="options-container" @click.stop>
      <div
        v-for="option in options"
        :key="option.id"
        class="option"
        @click="handleOptionSelect(option)"
      >
        <span>{{ option.name }}</span>
        <checkbox-item
          :modelValue="selectedOption?.id === option.id"
          @update:modelValue="handleOptionSelect(option)"
        ></checkbox-item>
      </div>
    </div>
  </div>
</template>

<script>
import CheckboxItem from './CheckboxItem.vue';

export default {
  name: 'CustomSelect',
  emits: ['option-selected'],
  props: {
    label: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    modelValue: {
      type: [Object, Number, String],
      default: () => ({})
    }
  },
  data: () => ({
    selectedOption: {},
    shownOptions: false
  }),
  watch: {
    modelValue: {
      handler(val) {
        if (!val || (typeof val === 'object' && !val.id)) {
          this.selectedOption = {};
        } else if (typeof val === 'object') {
          this.selectedOption = val;
        } else {
          this.selectedOption = this.options.find(o => o.id === val) || {};
        }
      },
      immediate: true
    }
  },
  methods: {
    toggleOptions() {
      this.shownOptions = !this.shownOptions;
    },
    handleOptionSelect(option) {
      let valueToEmit = null;
      if (option.id === this.selectedOption?.id) {
        this.selectedOption = {};
      } else {
        this.selectedOption = option;
        valueToEmit = option.id;
      }

      this.shownOptions = false;
      this.$emit('option-selected', valueToEmit);
    }
  },
  components: { CheckboxItem }
};
</script>

<style scoped>
.multiselect {
  width: 100%;
  position: relative;
  cursor: pointer;
  z-index: 1;
}
.active {
  z-index: 10;
}

.label {
  color: var(--main-font);
  font-size: 18px;
  line-height: 22px;
  margin-bottom: 8px;
  font-weight: 600;
}

.selected {
  min-height: 50px;
  background-color: var(--secondary-bg);
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.active .selected {
  border-color: var(--border);
}

.selected-container {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.selected-container > * {
  font-weight: 600;
  font-size: 14px;
}

.arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.arrow.toggled {
  transform: rotate(180deg);
}

.options-container {
  width: 100%;
  max-height: 190px;
  overflow-y: auto;
  background-color: var(--secondary-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-top: 5px;
  position: absolute;
  left: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.options-container::-webkit-scrollbar {
  width: 0;
}

.option {
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  transition: background-color 0.2s;
}

.option:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
