<template>
  <div class="page-container">
    <h1><!-- Description text --></h1>

    <div class="content-block">
      <div class="image-container">
        <img
          src="@/assets/theater.jpg"
          alt=""
          class="theater-image"
        >
      </div>

      <div class="text-content">
        <h2><!-- Title --></h2>
        <p>
          <!-- Descriptive paragraph -->
        </p>

        <h2><!-- Features title --></h2>
        <ul class="feature-list">
          <li><!-- Feature 1 --></li>
          <li><!-- Feature 2 --></li>
          <li><!-- Feature 3 --></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutView',
  metaInfo: {
    title: ''
  }
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.content-block {
  display: flex;
  gap: 3rem;
}

.image-container {
  flex: 1;
}

.theater-image {
  width: 100%;
  border-radius: 8px;
}

.text-content {
  flex: 1;
}

.feature-list {
  padding-left: 1.5rem;
}

@media (max-width: 768px) {
  .content-block {
    flex-direction: column;
  }
}
</style>
