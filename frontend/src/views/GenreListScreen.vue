<template>
  <div v-if="active && isStaff" class="genres-container">
    <div class="add-genre" v-if="createMode">
      <div class="header">Add Genre</div>
      <div class="note">Please fill in the fields in details</div>
      <input-item label="Genre" width="wide" v-model="name"></input-item>
      <action-button label="Submit" @click="addGenre" :disabled="!name"></action-button>
    </div>

    <div class="genres">
      <div class="header">All Genres</div>
      <div class="container">
        <div v-if="genres.length === 0" class="no-data">No genres found.</div>

        <div
          v-for="(genre, index) in genres"
          :key="genre.id"
          :class="['genre-item', index % 2 === 0 ? 'odd' : '']"
        >
          {{ genre.name }}
        </div>
      </div>
      <add-btn @click="createMode = !createMode"></add-btn>
    </div>
  </div>
</template>

<script>
import AddBtn from '../comps/AddBtn.vue';
import InputItem from '../comps/InputItem.vue';
import ActionButton from '../comps/ActionButton.vue';

export default {
  name: 'GenreListScreen',
  props: {
    isStaff: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    active: false,
    genres: [],
    createMode: false,
    name: ''
  }),
  methods: {
    hashHandler() {
      this.active = Boolean(window.location.hash.match('genres$'));
    },
    async fetchGenres() {
      try {
        const { data } = await this.axios.get('/cinema/genres/');
        this.genres = Array.isArray(data) ? data : (data.results || []);
      } catch (err) {
        console.error('Fetch genres error:', err);
      }
    },
    async addGenre() {
      if (!this.name.trim()) return;
      try {
        await this.axios.post('/cinema/genres/', { name: this.name });
        this.createMode = false;
        this.name = '';
        await this.fetchGenres();
      } catch (err) {
        console.error('Add genre error:', err);
        alert('Помилка при додаванні жанру');
      }
    }
  },
  watch: {
    active(newVal) {
      if (newVal) {
        this.fetchGenres();
      }
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
    if (this.active) this.fetchGenres();
  },
  unmounted() {
    window.removeEventListener('hashchange', this.hashHandler);
  },
  components: {
    AddBtn,
    InputItem,
    ActionButton
  }
};
</script>

<style scoped>
.genres-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  padding: 20px;
}
.add-genre, .genres {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 600px;
}
.add-genre {
  margin-bottom: 36px;
  padding: 20px;
  border: 1px dashed #ccc;
  border-radius: 10px;
}
.header {
  font-weight: 600;
  font-size: 40px;
  line-height: 1.2;
}
.note {
  font-size: 18px;
  color: #888;
}
.container {
  width: 100%;
  font-size: 20px;
}
.genre-item {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  border-radius: 10px;
}
.odd {
  background-color: rgba(255, 255, 255, 0.05);
}
.no-data {
  text-align: center;
  color: #666;
  font-style: italic;
}
</style>
