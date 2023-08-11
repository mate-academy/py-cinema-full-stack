<template>
  <div class="movie-card" v-bind:style="{ 'background-image': 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%), url(' + image + ')' }" @click="$emit('click', id)">
    <div class="main-info">
      <span class="title">{{title}}</span>
      <div class="detail" @click="$emit('click', id)" v-if="!times.length">
        <svg width="24" height="24" viewbox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <use href="/assets/icons/detail.svg#detail"></use>
        </svg>
      </div>
    </div>
    <div class="additional-info">
      <div class="container" v-if="actors.length">
        <span class="label">Actors: </span>
        <span v-for="(actor, index) in actors" :key="index" class="item">{{actor}}</span>
      </div>
      <div class="container" v-if="genres.length">
        <span class="label">Genres: </span>
        <span v-for="(genre, index) in genres" :key="index" class="item">{{genre}}</span>
      </div>
      <div class="container" v-if="times.length">
        <span class="label">Time: </span>
        <span v-for="(duration, index) in formattedTime" :key="index" class="item time" @click="$emit('open-details', id)">{{duration}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  props: {
    id: {
      type: Number
    },
    image: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    actors: {
      type: Array,
      default: () => []
    },
    genres: {
      type: Array,
      default: () => []
    },
    times: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    formattedTime () {
      return this.times.map(time => moment(time).format('HH:mm'));
    }
  }

};
</script>

<style scoped>
.movie-card {
  width: 100%;
  height: 446px;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 24px 25px;
  cursor: pointer;
}

.main-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
}

.container {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
}

.label {
  font-size: 18px;
}

.title {
  font-size: 25px;
}

.label, .title {
  font-weight: 600;
}

.item {
  font-size: 14px;
  background-color: rgba(102, 102, 102, 0.8);
  padding: 3px 6px;
  border-radius: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item.time {
  cursor: pointer;
}

.container:first-child {
  margin-bottom: 12px;
}

.detail {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
