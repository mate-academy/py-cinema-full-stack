<template>
  <div
    :class="['checkbox-item', checked && 'checked']"
    @click="toggleInput"
    @mousedown.prevent>
      <svg v-if="checked" width="19" height="9" viewbox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <use href="/assets/icons/check.svg#check"></use>
      </svg>
  </div>
</template>

<script>
export default {
  props: {
    checked: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    toggleInput () {
      this.$emit('input', !this.checked);
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
}

.checkbox-item.checked {
  border: 1px solid var(--red);
  background-color: var(--red);
}

svg {
  transform: translate(2px);
}
</style>
