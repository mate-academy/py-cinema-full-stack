<template>
  <div
  :class="['action-button',
    type === 'outlined' && 'outlined',
    width === 'small' && 'small',
    width === 'normal' && 'normal',
    disabled && 'disabled'
  ]"
  @click="$emit('click')"
  >{{label}}</div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'filled',
      validator: (val) => [
        'filled',
        'outlined'
      ].includes(val)
    },
    width: {
      type: String,
      default: 'wide',
      validator: (val) => [
        'small',
        'normal',
        'wide'
      ].includes(val)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.action-button {
  cursor: pointer;
  width: 400px;
  height: 50px;
  background-color: var(--red);
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  user-select: none;
}

.small {
  width: 146px;
  height: 40px;
  font-size: 16px;
  line-height: 20px;
}

.normal {
  width: 300px;
}

.outlined {
  background: none;
  border: 2px solid var(--red);
}

:not(.outlined).disabled {
  pointer-events: none;
  background-color: var(--border);
}
</style>
