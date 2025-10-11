<template>
  <div class="movie-card" @click="handleClick">
    <div class="poster" :class="{ placeholder: !image }">
      <img v-if="image" :src="buildImageUrl(image)" alt="movie poster" />
      <span v-else class="no-image">No Image</span>

      <!-- Botão de upload (apenas para staff) -->
      <button
        v-if="canEdit"
        class="edit-btn"
        title="Upload poster"
        @click.stop="triggerFile"
      >
        📷
      </button>
      <input
        ref="file"
        type="file"
        accept="image/*"
        class="hidden-input"
        @change="onFile"
      />
    </div>

    <div class="info">
      <h3 class="title">{{ title }}</h3>

      <div class="meta">
        <strong>Actors:</strong>
        <span v-for="(actor, i) in actors" :key="i" class="tag">{{ actor }}</span>
      </div>

      <div class="meta">
        <strong>Genres:</strong>
        <span v-for="(genre, i) in genres" :key="i" class="tag">{{ genre }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'MovieCard',
  props: {
    id: Number,
    title: String,
    image: String,
    actors: Array,
    genres: Array,
    canEdit: { type: Boolean, default: false }
  },
  methods: {
    handleClick() {
      this.$emit('click', this.id);
    },
    baseOrigin() {
      // Origem única via axios instance (configurada em src/api/index.js)
      const base = api?.defaults?.baseURL;
      return new URL('/', base).origin;
    },
    buildImageUrl(path) {
      if (!path) return '';
      try {
        // URL absoluta já válida
        return new URL(path).toString();
      } catch (e) {
        // Caminho relativo vindo do backend (ex.: /media/...)
        const rel = path.startsWith('/') ? path : `/${path}`;
        return new URL(rel, this.baseOrigin()).toString();
      }
    },
    triggerFile() {
      this.$refs.file.click();
    },
    onFile(e) {
      const file = e.target.files?.[0];
      if (file) this.$emit('upload-poster', { id: this.id, file });
      // limpa o input para permitir re-selecionar o mesmo arquivo
      e.target.value = '';
    }
  }
};
</script>

<style scoped>
.movie-card {
  background-color: #141414;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  flex-direction: column;
}
.movie-card:hover { transform: scale(1.02); box-shadow: 0 0 18px rgba(255,255,255,0.1); }

.poster {
  position: relative;
  width: 100%;
  height: 350px;
  overflow: hidden;
  background-color: #1e1e1e;
  display: flex; align-items: center; justify-content: center;
}
.poster img { width: 100%; height: 100%; object-fit: cover; }
.poster.placeholder { background: linear-gradient(145deg, #202020, #181818); color: #999; }
.no-image { opacity: .7; font-size: 14px; }

.edit-btn {
  position: absolute; right: 12px; top: 12px;
  background: rgba(0,0,0,.55);
  color: #fff; border: 1px solid #555; border-radius: 10px;
  padding: 6px 8px; cursor: pointer; font-size: 16px;
  transition: all .2s ease;
}
.edit-btn:hover { background: #fff; color: #111; border-color: #fff; }
.hidden-input { display: none; }

.info { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }
.title { font-weight: 600; font-size: 20px; margin: 0; color: #fff; }
.meta { color: #ddd; font-size: 14px; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.tag { background-color: #333; border-radius: 6px; padding: 2px 8px; font-size: 13px; color: #f1f1f1; }
</style>
