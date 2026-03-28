<template>
  <div
    :class="[
      'action-button',
      type === 'outlined' ? 'outlined' : 'filled',
      width,
      { 'disabled': disabled }
    ]"
    @click="handleClick"
  >
    {{ label }}
  </div>
</template>

<script>
export default {
  name: 'ActionButton',
  emits: ['click'],
  props: {
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'filled',
      validator: (val) => ['filled', 'outlined'].includes(val)
    },
    width: {
      type: String,
      default: 'wide',
      validator: (val) => ['small', 'normal', 'wide'].includes(val)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick(event) {
      if (!this.disabled) {
        this.$emit('click', event);
      }
    }
  }
};
</script>

<style scoped>
.action-button {
  cursor: pointer;
  width: 400px; /* Default 'wide' */
  height: 50px;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  user-select: none;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.filled {
  background-color: var(--red);
  color: #ffffff;
}

.outlined {
  background: transparent;
  border-color: var(--red);
  color: var(--red);
}

.small {
  width: 146px;
  height: 40px;
  font-size: 16px;
}

.normal {
  width: 300px;
}

.disabled {
  cursor: not-allowed;
  opacity: 0.5;
  filter: grayscale(1);
  pointer-events: none;
}

.action-button:hover:not(.disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.action-button:active:not(.disabled) {
  transform: translateY(0);
}
</style>
