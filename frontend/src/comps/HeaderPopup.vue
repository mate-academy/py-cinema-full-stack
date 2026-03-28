<template>
  <div class="header-popup">
    <div class="popup-item" @click="$emit('openProfile')">Profile</div>
    <div class="popup-item" @click="$emit('openOrders')">Orders</div>
  </div>
</template>

<script>
export default {
  name: 'HeaderPopup',
  // Явне оголошення емітів для Vue 3
  emits: ['openProfile', 'openOrders']
};
</script>

<style scoped>
.header-popup {
  width: 150px; /* Задав фіксовану або мінімальну ширину, щоб не залежати від контейнера */
  background-color: var(--secondary-bg);
  position: absolute;
  top: calc(100% + 10px); /* Невеликий відступ від імені користувача */
  right: 0;
  border-radius: 8px;
  z-index: 100;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  overflow: hidden; /* Щоб закруглення кутів працювало для внутрішніх div */
}

.popup-item {
  color: var(--main-font);
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  text-align: left;
}

.popup-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.popup-item:first-child {
  border-bottom: 1px solid var(--border);
}
</style>
