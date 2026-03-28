<template>
  <footer class="footer">
    <p>Cinema Shop © {{ currentYear }} Created by Mate Academy</p>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  }
};
</script>

<style scoped>
.footer {
  width: 100%;
  font-size: 14px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center; /* Центрування по вертикалі всередині рядка */
  padding: 20px 0;
  color: var(--main-font);
  opacity: 0.6;
  grid-row: 3; /* Відповідає вашій сітці в App.vue */
}

p {
  margin: 0;
}
</style>
