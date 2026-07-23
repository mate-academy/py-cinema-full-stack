<template>
  <div class="modal">
    <div class="header">Movie Details</div>
    <div class="cross" @click="$emit('close-movie-details')">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <use href="/assets/icons/cross.svg#cross"></use>
      </svg>
    </div>
    <div class="info-container">
      <img :src="movie.image" :class="[!movie.image && 'absent']" alt="Movie Poster" />
      <div class="info">
        <div class="movie-title">{{ movie.title }}</div>

        <!-- Списока акторів -->
        <div class="container">
          <span class="label">Actors:</span>
          <template v-if="formattedActors.length">
            <span
              v-for="(actor, index) in formattedActors"
              :key="index"
              class="item"
            >
              {{ actor }}
            </span>
          </template>
          <span v-else class="empty-text">No actors specified</span>
        </div>

        <!-- Список жанрів -->
        <div class="container">
          <span class="label">Genres:</span>
          <template v-if="formattedGenres.length">
            <span
              v-for="(genre, index) in formattedGenres"
              :key="index"
              class="item"
            >
              {{ genre }}
            </span>
          </template>
          <span v-else class="empty-text">No genres specified</span>
        </div>

        <div class="description">{{ movie.description }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MovieModal',
  props: {
    movie: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    formattedActors () {
      if (!Array.isArray(this.movie?.actors)) return [];

      return this.movie.actors.map(actor => {
        if (typeof actor === 'string') return actor;
        if (typeof actor === 'object' && actor !== null) {
          if (actor.name) return actor.name;
          const firstName = actor.first_name || actor.firstName || '';
          const lastName = actor.last_name || actor.lastName || '';
          return `${firstName} ${lastName}`.trim() || 'Unknown Actor';
        }
        return String(actor);
      });
    },

    formattedGenres () {
      if (!Array.isArray(this.movie?.genres)) return [];

      return this.movie.genres.map(genre => {
        if (typeof genre === 'string') return genre;
        if (typeof genre === 'object' && genre !== null) {
          return genre.name || genre.title || 'Unknown Genre';
        }
        return String(genre);
      });
    }
  }
};
</script>

<style scoped>
.modal {
  width: 100%;
  height: 100%;
  background: #111111;
  padding: 65px 75px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  position: relative;
}

.header {
  font-weight: 600;
  font-size: 50px;
  line-height: 60px;
}

.container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.label {
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
}

.item {
  font-size: 14px;
  background-color: rgba(102, 102, 102, 0.8);
  padding: 3px 8px;
  border-radius: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-text {
  font-size: 14px;
  color: #888888;
  font-style: italic;
}

.description {
  font-size: 14px;
  line-height: 20px;
}

.info-container {
  height: 100%;
  display: flex;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

img {
  background-size: cover;
  max-height: 510px;
  max-width: 440px;
  margin-right: 40px;
  object-fit: cover;
}

img.absent {
  display: none;
}

.movie-title {
  font-weight: 600;
  font-size: 25px;
  line-height: 30px;
}

.cross {
  position: absolute;
  top: 40px;
  right: 40px;
  cursor: pointer;
}
</style>
