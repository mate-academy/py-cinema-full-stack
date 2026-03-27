<template>
  <div
    :class="['multiselect', shownOptions && 'active']"
    @click="toggleOptions"
  >
    <div class="label">{{ label }}</div>
    <div class="selected">
      <div class="selected-container">
        <span v-for="option in selectedOptions" :key="option.id" class="selected-item">
          {{ option.name }}
        </span>
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
          :modelValue="!!selectedOptions.find(selected => selected.id === option.id)"
          @update:modelValue="handleOptionSelect(option)"
        ></checkbox-item>
      </div>
    </div>
  </div>
</template>

<script>
import CheckboxItem from './CheckboxItem.vue';

export default {
  name: 'CustomMultiselect',
  emits: ['option-selected', 'click'],
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
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    selectedOptions: [],
    shownOptions: false
  }),
  watch: {
    modelValue: {
      handler(val) {
        if (!val || !val.length) {
          this.selectedOptions = [];
        } else {
          // Синхронізація об'єктів на основі ID з пропса
          this.selectedOptions = this.options.filter(opt =>
            val.includes(opt.id) || val.some(v => v.id === opt.id)
          );
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    toggleOptions() {
      this.$emit('click');
      this.shownOptions = !this.shownOptions;
    },
    handleOptionSelect(option) {
      const index = this.selectedOptions.findIndex(opt => opt.id === option.id);

      if (index !== -1) {
        this.selectedOptions.splice(index, 1);
      } else {
        this.selectedOptions.push(option);
      }

      this.$emit('option-selected', this.selectedOptions.map(opt => opt.id));
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
  padding: 10px 15px;
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

.selected-item {
  font-weight: 600;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  margin-left: 10px;
}

.arrow.toggled {
  transform: rotate(180deg);
}

.options-container {
  width: 100%;
  max-height: 250px;
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
  width: 4px;
}
.options-container::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 10px;
}

.option {
  min-height: 45px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 15px;
  transition: background-color 0.2s;
}

.option:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
