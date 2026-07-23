<template>
  <div
    ref="multiselectRef"
    :class="['multiselect', { active: shownOptions }]"
    @click="toggleOptions"
    @mousedown.prevent
  >
    <div class="label">{{ label }}</div>
    <div class="selected">
      <div class="selected-container">
        <span
          v-for="option in selectedOptions"
          :key="option.id"
        >{{ option.name }}</span>
      </div>
      <div :class="['arrow', { toggled: shownOptions }]">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <use href="/assets/icons/arrow.svg#arrow"></use>
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
          class="checkbox-disabled-events"
          :checked="isOptionSelected(option.id)"
        ></checkbox-item>
      </div>
    </div>
  </div>
</template>

<script>
import CheckboxItem from './CheckboxItem.vue';

export default {
  name: 'CustomMultiselect',
  components: { CheckboxItem },
  props: {
    label: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    selectedOptions: [],
    shownOptions: false
  }),
  methods: {
    toggleOptions () {
      this.shownOptions = !this.shownOptions;
    },

    isOptionSelected (id) {
      return this.selectedOptions.some(opt => opt.id === id);
    },

    handleOptionSelect (option) {
      const isSelected = this.isOptionSelected(option.id);

      if (isSelected) {
        this.selectedOptions = this.selectedOptions.filter(opt => opt.id !== option.id);
      } else {
        this.selectedOptions.push(option);
      }

      this.$emit('option-selected', option.id);
    },

    clickOutsideHandler (evt) {
      if (this.shownOptions && this.$refs.multiselectRef && !this.$refs.multiselectRef.contains(evt.target)) {
        this.shownOptions = false;
      }
    }
  },
  mounted () {
    document.addEventListener('click', this.clickOutsideHandler);
  },
  beforeDestroy () {
    document.removeEventListener('click', this.clickOutsideHandler);
  }
};
</script>

<style scoped>
.multiselect {
  width: 100%;
  position: relative;
  z-index: 1;
  cursor: pointer;
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
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding: 16px 12px;
  position: relative;
  border: 1px solid transparent;
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
  line-height: 17px;
}

.arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
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
  margin-top: 12px;
  position: absolute;
  left: 0;
  top: 100%;
  z-index: 20;
}

.options-container::-webkit-scrollbar {
  display: none;
}

.option {
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 0 23px;
  border-radius: 10px;
  cursor: pointer;
}

.option:hover {
  background-color: #400000;
}

/* Вимикаємо обробку подій миші на чекбоксі, щоб подію обробляв тільки .option */
.checkbox-disabled-events {
  pointer-events: none;
}
</style>
