<template>
  <div
    class="movie-card"
    :style="cardStyle"
    @click="$emit('click', id)"
  >
    <div class="main-info">
      <span class="title">{{ title }}</span>
      <div class="detail" v-if="!times || !times.length">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <div class="additional-info">
      <div class="container" v-if="actors?.length">
        <span class="label">Actors: </span>
        <div class="items-wrapper">
          <span v-for="(actor, index) in actors" :key="index" class="item">
            {{ actor }}
          </span>
        </div>
      </div>

      <div class="container" v-if="genres?.length">
        <span class="label">Genres: </span>
        <div class="items-wrapper">
          <span v-for="(genre, index) in genres" :key="index" class="item">
            {{ genre }}
          </span>
        </div>
      </div>

      <div class="container" v-if="times?.length">
        <span class="label">Time: </span>
        <div class="items-wrapper">
          <span
            v-for="(time, index) in formattedTime"
            :key="index"
            class="item time"
            @click.stop="$emit('open-details', id)"
          >
            {{ time }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'MovieCard',
  emits: ['click', 'open-details'],
  props: {
    id: {
      type: [Number, String],
      required: true
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
    // Виносимо логіку стилів у computed для чистоти шаблону
    cardStyle() {
      const gradient = 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.9) 100%)';
      const bgImage = this.image ? `url(${this.image})` : 'none';
      return {
        backgroundImage: `${gradient}, ${bgImage}`
      };
    },
    formattedTime() {
      if (!this.times) return [];
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
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 24px 25px;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.movie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
}

.main-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 12px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.additional-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.container {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.items-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.label {
  font-size: 14px;
  font-weight: 600;
  color: #ccc;
  min-width: 60px;
}

.item {
  font-size: 12px;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  padding: 2px 8px;
  border-radius: 4px;
  color: #fff;
}

.item.time {
  background-color: var(--primary-color, #f39c12); /* Або інший акцентний колір */
  font-weight: 700;
}

.detail {
  color: #fff;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.detail:hover {
  opacity: 1;
}
</style>
