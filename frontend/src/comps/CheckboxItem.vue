<template>
  <div
    :class="['checkbox-item', modelValue && 'checked']"
    @click="toggleInput"
  >
    <svg v-if="modelValue" width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 4.5L4.5 8L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'CheckboxItem',
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    toggleInput() {
      this.$emit('update:modelValue', !this.modelValue);
    }
  }
};
</script>

<style scoped>
.checkbox-item {
  height: 20px;
  width: 20px;
  border: 1px solid var(--main-font);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox-item.checked {
  border: 1px solid var(--red);
  background-color: var(--red);
}

.checkbox-item:hover {
  opacity: 0.8;
}

svg {
  display: block;
}
</style>
