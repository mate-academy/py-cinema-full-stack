<template>
  <div v-if="active && isStaff" class="genres-container">
    <div class="add-genre" v-if="createMode">
      <div class="header">Add Genre</div>
      <div class="note">Please fill in the fields in details</div>
      <input-item label="Genre" width="wide" v-model="name"></input-item>
      <div v-if="error" class="error">{{ error }}</div>
      <action-button label="Submit" @click="addGenre" :disabled="!name.trim()"></action-button>
    </div>
    <div class="genres" v-if="!createMode">
      <div class="header">All Genres</div>
      <div class="container">
        <div v-for="(genre, index) in genres" :key="genre.id" :class="index % 2 === 0 ? 'odd' : ''">
          {{genre.name}}
        </div>
      </div>
      <add-btn @click="handleGenreCreate"></add-btn>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

import AddBtn from '../comps/AddBtn.vue';
import InputItem from '../comps/InputItem.vue';
import ActionButton from '../comps/ActionButton.vue';
import { getErrorMessage } from '../utils/errorMessage';
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
    name: '',
    error: ''
  }),
  computed: {
    token () {
      return localStorage.getItem('access');
    }
  },
  methods: {
    async fetchGenres () {
      try {
        const { data: genres } = await axios.get('/api/cinema/genres/', {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.genres = genres;
      } catch (err) {
        console.error(err.response.data);
      }
    },

    async addGenre () {
      this.error = '';
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        };

        await axios.post(
          '/api/cinema/genres/',
          {
            name: this.name
          },
          config
        );

        location.hash = '#/genres';

        this.name = '';
      } catch (err) {
        this.error = getErrorMessage(err, 'Unable to create the genre.');
      }
    },

    hashHandler () {
      this.active = Boolean(location.hash.match(/genres(?:\?add=true)?$/));
      this.createMode = Boolean(location.hash.match('genres\\?add=true$'));
    },

    handleGenreCreate () {
      location.hash = '#/genres?add=true';
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

.error {
  color: var(--red);
}

</style>
