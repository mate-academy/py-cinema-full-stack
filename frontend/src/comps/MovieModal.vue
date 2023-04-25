<template>
  <div class="modal">
    <div class="header">Movie Details</div>
    <div class="cross" @click="$emit('close-movie-details')">
      <svg width="20" height="20" viewbox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <use href="/assets/icons/cross.svg#cross"></use>
      </svg>
    </div>
    <div class="info-container">
      <img :src="movie.image" :class="[!movie.image && 'absent']"/>
      <div class="info">
        <div class="movie-title">{{movie.title}}</div>
        <div class="container">
          <span class="label">Actors: </span>
          <span v-for="(actor, index) in movie.actors" :key="index" class="item">{{actor.first_name}} {{actor.last_name}}</span>
        </div>
        <div class="container">
          <span class="label">Genres: </span>
          <span v-for="(genre, index) in movie.genres" :key="index" class="item">{{genre.name}}</span>
        </div>
        <div>{{movie.description}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    movie: {
      type: Object,
      default: () => {}
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
}

.label {
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
}

.item {
  font-size: 14px;
  background-color: rgba(102, 102, 102, 0.8);
  padding: 3px 6px;
  border-radius: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description {
  font-size: 14px;
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
}
img.absent {
  margin-right: 0;
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
