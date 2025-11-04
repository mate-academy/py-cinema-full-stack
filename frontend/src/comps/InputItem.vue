<template>
  <div>
    <div class="label">{{label}}</div>
    <div :class="['input-field', width === 'normal' ? '' : width === 'wide' ? 'wide' : 'narrow']">
      <input
      v-model="value"
      @input="$emit('input', value)"
      :placeholder="placeholder"
      type="text"
      ref="inputEl"/>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    value: ''
  }),
  props: {
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: 'normal',
      validator: (val) => [
        'narrow',
        'normal',
        'wide'
      ].includes(val)
    },
    initialValue: null
  },
  watch: {
    initialValue: {
      handler (val) {
        this.value = val;
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.label {
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  margin-bottom: 8px;
  user-select: none;
}

.input-field {
  height: 50px;
  background-color: var(--secondary-bg);
  display: flex;
  align-items: center;
  border-radius: 10px;
  padding: 16px 12px;
  width: 400px;
}

.input-field.wide {
  width: 570px;
}
.input-field.narrow {
  width: 255px;
}

.input-field input {
  color: var(--main-font);
  border: none;
  width: 100%;
  background-color: var(--secondary-bg);
}

input:focus-visible {
  outline: none;
}

input::placeholder {
  color: var(--input-placeholder);
}

.input-field:focus-within {
  border: 1px solid var(--border);
}
</style>
