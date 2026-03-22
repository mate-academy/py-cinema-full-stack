<template>
  <div v-if="active && isStaff" class="genres-container">
    <div class="add-genre" v-if="createMode">
      <div class="header">Add Genre</div>
      <div class="note">Please fill in the fields in details</div>
      <input-item label="Genre" width="wide" v-model="name"></input-item>
      <action-button label="Submit" @click="addGenre"></action-button>
    </div>
    <div class="genres">
      <div class="header">All Genres</div>
      <div class="container">
        <div v-for="(genre, index) in genres" :key="genre.id" :class="index % 2 === 0 ? 'odd' : ''">
          {{genre.name}}
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

import { getGenres, addGenre as addGenreApi } from '@/api/cinema/genres';

export default {
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
  computed: {
    token () {
      return localStorage.getItem('access');
    }
  },
  methods: {
    async fetchGenres () {
      try {
        const { data } = await getGenres(this.token);
        this.genres = data;
      } catch (err) {
        console.error(err.response?.data || err);
      }
    },
    async addGenre () {
      try {
        await addGenreApi(this.token, { name: this.name });
        this.createMode = !this.createMode;
        this.fetchGenres();
        this.name = '';
      } catch (err) {
        console.error(err.response?.data || err);
      }
    },
    hashHandler () {
      this.active = Boolean(location.hash.match('genres$'));
    }
  },
  watch: {
    active () {
      if (this.active) {
        this.fetchGenres();
      }
    }
  },
  mounted () {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
  },
  beforeDestroy () {
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
.genres-container, .genres-container > * {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
}
.add-genre {
  margin-bottom: 36px;
}
.action-button {
  margin-top: 36px;
}
.header {
  font-weight: 600;
  font-size: 50px;
  line-height: 61px;
}
.note {
  font-size: 25px;
  line-height: 31px;
}
.container {
  width: 100%;
  font-size: 25px;
  line-height: 30px;
}
.container > div {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 10px;
}
.container > .odd {
  background-color: var(--secondary-bg);
}
</style>
