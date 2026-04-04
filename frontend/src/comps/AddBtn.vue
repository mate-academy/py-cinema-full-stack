<template>
  <div class="add" @click="$emit('click')" @mousedown.prevent>
    <svg width="24" height="24" viewbox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <use href="/assets/icons/plus.svg#plus"></use>
    </svg>
  </div>
</template>

<script>
export default {

};
</script>

<style scoped>
.add {
  width: 50px;
  height: 50px;
  background-color: var(--secondary-bg);
  border: 2px solid var(--red);
  filter: drop-shadow(0px 2px 10px rgba(255, 42, 42, 0.8));
  position: fixed;
  z-index: 1;
  bottom: 100px;
  right: 100px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--red);
  cursor: pointer;
}
</style>
