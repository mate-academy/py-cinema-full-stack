<template>
  <div
    :class="['multiselect', shownOptions && 'active']"
    @click="showOptions"
    @mousedown.prevent>
    <div class="label">{{label}}</div>
    <div class="selected">
      <div class="selected-container">
        <span v-for="(option, index) in selectedOptions" :key="index">{{option.name}}</span>
      </div>
      <div :class="['arrow', shownOptions && 'toggled']" @click="showOptions" @mousedown.prevent>
        <svg width="20" height="20" viewbox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <use href="/assets/icons/arrow.svg#arrow"></use>
        </svg>
      </div>
    </div>
    <div v-if="shownOptions" class="options-container">
      <div v-for="(option, index) in options" :key="index" class="option">
        <span>{{option.name}}</span>
        <checkbox-item
          @input="handleOptionSelect(option)"
          :checked="!!selectedOptions.find(selected => selected.id === option.id)"
        ></checkbox-item>
      </div>
    </div>
  </div>
</template>

<script>
import CheckboxItem from './CheckboxItem.vue';

export default {
  data: () => ({
    selectedOptions: [],
    shownOptions: false
  }),
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
  methods: {
    showOptions () {
      this.$emit('click');
      this.shownOptions = !this.shownOptions;
    },
    handleOptionSelect (option) {
      const selected = this.selectedOptions.find(opt => opt.id === option.id);
      if (selected) {
        this.selectedOptions = [...this.selectedOptions.filter(opt => opt.id !== option.id)];
      } else {
        this.selectedOptions.push(option);
      }

      this.$emit('option-selected', option.id);
    }
  },
  components: { CheckboxItem }
};
</script>

<style scoped>
.multiselect {
  width: 100%;
  z-index: 1;
}
.active {
  z-index: 2;
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
  cursor: pointer;
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

</style>
