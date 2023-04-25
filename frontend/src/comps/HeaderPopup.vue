<template>
  <div class="header-popup">
    <div @click="$emit('openProfile')">Profile</div>
    <div @click="$emit('openOrders')">Orders</div>
  </div>
</template>

<script>
export default {

};
</script>

<style scoped>
.header-popup {
  width: 100%;
  background-color: var(--secondary-bg);
  position: absolute;
  top: 100%;
  border-radius: 6px;
  z-index: 2;
}

.header-popup > * {
  color: var(--main-font);
  padding: 14px 10px;
  cursor: pointer;
}
</style>
