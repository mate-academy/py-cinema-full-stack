<template>
  <div v-if="active && isStaff" class="movie-container">
    <div class="header">Add a movie</div>
    <div class="note">Please fill in the fields in details</div>
    <div class="container">
      <input-item label="Title" width="wide" v-model="title"></input-item>
      <input-item label="Duration" width="wide" v-model="duration"></input-item>
      <custom-multiselect label="Actors" :options="actors" @option-selected="handleActorSelection"></custom-multiselect>
      <custom-multiselect label="Genres" :options="genres" @option-selected="handleGenreSelection"></custom-multiselect>
      <image-uploader @upload="handleImageUpload"></image-uploader>
      <div class="description">
        <div class="label">Description</div>
        <div class="textarea-field">
          <textarea v-model="description"></textarea>
        </div>
      </div>
    </div>
    <action-button
      label="Submit"
      @click="addMovie"
      :disabled="!title || !duration || !description || !selectedActorIds.length || !selectedGenreIds.length"
    ></action-button>
  </div>
</template>

<script>
import ActionButton from '../comps/ActionButton.vue';
import CustomMultiselect from '../comps/CustomMultiselect.vue';
import InputItem from '../comps/InputItem.vue';
import ImageUploader from '../comps/ImageUploader.vue';

import { getActors } from '@/api/cinema/actors';
import { getGenres } from '@/api/cinema/genres';
import { addMovie } from '@/api/cinema/movies';
import axios from 'axios';

export default {
  props: {
    isStaff: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    active: false,
    title: '',
    duration: '',
    description: '',
    actors: [],
    genres: [],
    selectedActorIds: [],
    selectedGenreIds: [],
    image: null
  }),
  computed: {
    token () {
      return localStorage.getItem('access');
    }
  },
  methods: {
    hashHandler () {
      this.active = Boolean(location.hash.match('movies\\?add=true'));
    },
    async fetchActors () {
      try {
        const { data } = await getActors(this.token);
        this.actors = data.map(({ id, first_name: firstName, last_name: lastName }) => ({
          id,
          name: `${firstName} ${lastName}`
        }));
      } catch (err) {
        console.error(err);
      }
    },
    async fetchGenres () {
      try {
        const { data } = await getGenres(this.token);
        this.genres = data;
      } catch (err) {
        console.error(err);
      }
    },
    async addMovie () {
      try {
        const { data: movie } = await addMovie(this.token, {
          title: this.title,
          duration: Number(this.duration),
          description: this.description,
          actors: this.selectedActorIds,
          genres: this.selectedGenreIds
        });

        if (this.image) {
          const data = new FormData();
          data.append('image', this.image);
          await axios.post(
            `${import.meta.env.VITE_API_URL}/movies/${movie.id}/upload-image/`,
            data,
            {
              headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );
        }

        location.hash = '#/movies';
      } catch (err) {
        console.error(err);
      }
    },
    handleActorSelection (id) {
      if (this.selectedActorIds.includes(id)) {
        this.selectedActorIds = this.selectedActorIds.filter(actorId => actorId !== id);
      } else {
        this.selectedActorIds.push(id);
      }
    },
    handleGenreSelection (id) {
      if (this.selectedGenreIds.includes(id)) {
        this.selectedGenreIds = this.selectedGenreIds.filter(genreId => genreId !== id);
      } else {
        this.selectedGenreIds.push(id);
      }
    },
    handleImageUpload (file) {
      this.image = file;
    }
  },
  watch: {
    active () {
      if (this.active) {
        this.fetchActors();
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
    InputItem,
    CustomMultiselect,
    ActionButton,
    ImageUploader
  }
};
</script>
