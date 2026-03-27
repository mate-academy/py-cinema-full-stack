<template>
  <div class="input-wrapper">
    <div v-if="label" class="label">{{ label }}</div>
    <div
      :class="[
        'input-field',
        width,
        { 'invalid': !valid }
      ]"
    >
      <input
        :value="modelValue"
        @input="handleInput"
        :placeholder="placeholder"
        :type="type"
        :pattern="pattern"
        ref="inputEl"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'InputItem',
  // Декларуємо еміти для Vue 3
  emits: ['update:modelValue'],
  props: {
    // Vue 3 стандарт для v-model
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    pattern: {
      type: String,
      default: null
    },
    type: {
      type: String,
      default: 'text'
    },
    width: {
      type: String,
      default: 'normal',
      validator: (val) => ['narrow', 'normal', 'wide'].includes(val)
    }
  },
  data: () => ({
    valid: true
  }),
  methods: {
    handleInput(evt) {
      const val = evt.target.value;
      // Оновлюємо батьківський компонент
      this.$emit('update:modelValue', val);

      // Валідація через HTML5 pattern API
      if (this.pattern && val) {
        this.$nextTick(() => {
          this.valid = this.$refs.inputEl.checkValidity();
        });
      } else {
        this.valid = true;
      }
    }
  },
  watch: {
    // Якщо значення очищується ззовні, скидаємо валідність
    modelValue(newVal) {
      if (!newVal) this.valid = true;
    }
  }
};
</script>

<style scoped>
.input-wrapper {
  width: auto;
}

.label {
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  margin-bottom: 8px;
  user-select: none;
  color: var(--main-font);
}

.input-field {
  height: 50px;
  background-color: var(--secondary-bg);
  display: flex;
  align-items: center;
  border-radius: 10px;
  padding: 0 15px;
  width: 400px; /* normal */
  border: 1px solid transparent;
  transition: border-color 0.2s, background-color 0.2s;
}

.input-field.wide {
  width: 570px;
}
.input-field.narrow {
  width: 255px;
}

.input-field.invalid {
  border: 1px solid var(--red);
  background-color: rgba(255, 0, 0, 0.1);
}

.input-field input {
  color: var(--main-font);
  border: none;
  width: 100%;
  height: 100%;
  background-color: transparent;
  font-size: 16px;
  outline: none;
}

input::placeholder {
  color: var(--input-placeholder);
}

.input-field:focus-within {
  border-color: var(--border);
}

/* Адаптивність для малих екранів */
@media (max-width: 600px) {
  .input-field, .input-field.wide, .input-field.narrow {
    width: 100%;
  }
}
</style>
