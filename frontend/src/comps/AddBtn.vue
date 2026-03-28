<template>
  <div class="add" @click="$emit('click')">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'AddBtn',
  emits: ['click']
};
</script>

<style scoped>
.add {
  width: 50px;
  height: 50px;
  background-color: var(--secondary-bg);
  border: 2px solid var(--red);
  box-shadow: 0px 2px 10px rgba(255, 42, 42, 0.4);
  position: fixed;
  z-index: 10;
  bottom: 50px; /* Трохи підняв для кращого вигляду на малих екранах */
  right: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--red);
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.add:hover {
  background-color: var(--red);
  color: white;
  transform: scale(1.1);
}

.add:active {
  transform: scale(0.95);
}

@media (max-width: 600px) {
  .add {
    bottom: 20px;
    right: 20px;
  }
}
</style>
