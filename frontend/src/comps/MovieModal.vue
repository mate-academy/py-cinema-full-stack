<template>
  <div class="modal-content">
    <div class="header">Movie Details</div>

    <div class="cross" @click="$emit('close-movie-details')">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <div class="info-container">
      <div class="image-wrapper" v-if="movie.image">
        <img :src="movie.image" :alt="movie.title" />
      </div>

      <div class="info">
        <h2 class="movie-title">{{ movie.title || 'Loading...' }}</h2>

        <div class="container" v-if="movie.actors?.length">
          <span class="label">Actors:</span>
          <div class="items-list">
            <span v-for="actor in movie.actors" :key="actor.id" class="item">
              {{ actor.first_name }} {{ actor.last_name }}
            </span>
          </div>
        </div>

        <div class="container" v-if="movie.genres?.length">
          <span class="label">Genres:</span>
          <div class="items-list">
            <span v-for="genre in movie.genres" :key="genre.id" class="item">
              {{ genre.name }}
            </span>
          </div>
        </div>

        <div class="description">
          <p>{{ movie.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MovieModal',
  // Декларуємо еміти для Vue 3
  emits: ['close-movie-details'],
  props: {
    movie: {
      type: Object,
      // Використовуємо функцію для дефолтного об'єкта
      default: () => ({
        title: '',
        actors: [],
        genres: [],
        description: '',
        image: null
      })
    }
  }
};
</script>

<style scoped>
.modal-content {
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  background: #111111;
  padding: 40px 60px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  position: relative;
  border-radius: 12px;
  color: var(--main-font);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.header {
  font-weight: 600;
  font-size: 40px;
  line-height: 1.2;
}

.info-container {
  display: flex;
  gap: 40px;
  overflow-y: auto;
}

.image-wrapper {
  flex-shrink: 0;
}

img {
  width: 320px;
  height: 480px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-grow: 1;
}

.movie-title {
  font-size: 32px;
  margin: 0;
  color: #fff;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.label {
  font-weight: 600;
  font-size: 16px;
  color: #888;
}

.item {
  font-size: 13px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
}

.description {
  font-size: 16px;
  line-height: 1.6;
  color: #ccc;
  margin-top: 10px;
}

.cross {
  position: absolute;
  top: 30px;
  right: 30px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  color: #fff;
}

.cross:hover {
  opacity: 1;
}

/* Адаптивність */
@media (max-width: 850px) {
  .info-container {
    flex-direction: column;
    align-items: center;
  }
  img {
    width: 100%;
    max-width: 300px;
    height: auto;
  }
  .modal-content {
    padding: 30px;
  }
}
</style>
