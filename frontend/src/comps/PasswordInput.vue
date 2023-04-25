<template>
  <div>
    <div class="label">Password</div>
    <div :class="['input-field', !valid && 'invalid']">
      <input
        v-model="value"
        placeholder="Password"
        :type="type"
        :minlength="type === 'password' && 5"
        ref="inputEl"
        @input="$emit('input', value)"/>
      <svg
        v-if="type === 'text'"
        @mousedown.prevent
        @click="changeInputType"
        class="eye"
        width="20" height="20" viewbox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <use href="/assets/icons/eye.svg#eye"></use>
      </svg>
      <svg
        v-if="type === 'password'"
        @mousedown.prevent
        @click="changeInputType"
        class="eye"
        width="20" height="20" viewbox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <use href="/assets/icons/eye_crossed.svg#eye"></use>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    value: '',
    type: 'password',
    valid: true
  }),
  methods: {
    changeInputType () {
      if (this.type === 'password') {
        this.type = 'text';
        return;
      }
      this.type = 'password';
    }
  },
  watch: {
    value (val) {
      if (!val) return;

      this.valid = this.$refs.inputEl.checkValidity();
    }
  }
};
</script>

<style scoped>
.label {
  font-weight: 600;
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

.input-field input {
  color: var(--main-font);
  border: none;
  background-color: var(--secondary-bg);
  width: 100%;
}

input:focus-visible {
  outline: none;
}

input::placeholder {
  color: var(--input-placeholder);
  letter-spacing: initial;
}

input[type='password'] {
  letter-spacing: 4px;
}

.input-field.invalid,
.input-field.invalid:focus-within {
  border: 1px solid var(--red);
  background-color: #400000;
}

.input-field.invalid input {
  background: #400000;
}

.input-field:focus-within {
  border: 1px solid var(--border);
}

.eye {
  cursor: pointer;
}
</style>
