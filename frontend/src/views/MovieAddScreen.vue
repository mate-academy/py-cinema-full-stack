<template>
  <div v-if="active && isStaff" class="movie-container">
    <div class="header">Add a movie</div>
    <div class="note">Please fill in the fields in details</div>
    <div class="container">
      <input-item label="Title" width="wide" v-model="title"></input-item>
      <input-item label="Duration (min)" width="wide" v-model="duration" type="number"></input-item>

      <custom-multiselect
        label="Actors"
        :options="actors"
        :selected="selectedActorIds"
        @select="handleActorSelection"
      ></custom-multiselect>

      <custom-multiselect
        label="Genres"
        :options="genres"
        :selected="selectedGenreIds"
        @select="handleGenreSelection"
      ></custom-multiselect>

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

export default {
  name: 'AddMovieScreen',
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
  methods: {
    hashHandler() {
      this.active = Boolean(window.location.hash.includes('movies') && window.location.hash.includes('add=true'));
    },
    async fetchInitialData() {
      try {
        const [actorsRes, genresRes] = await Promise.all([
          this.axios.get('/cinema/actors/'),
          this.axios.get('/cinema/genres/')
        ]);

        const actorsData = Array.isArray(actorsRes.data) ? actorsRes.data : (actorsRes.data.results || []);
        const genresData = Array.isArray(genresRes.data) ? genresRes.data : (genresRes.data.results || []);

        this.actors = actorsData.map(actor => ({
          id: actor.id,
          name: `${actor.first_name} ${actor.last_name}`
        }));
        this.genres = genresData;
      } catch (err) {
        console.error('Error fetching actors/genres:', err);
      }
    },
    async addMovie() {
      try {
        const { data: movie } = await this.axios.post('/cinema/movies/', {
          title: this.title,
          duration: Number(this.duration),
          description: this.description,
          actors: this.selectedActorIds,
          genres: this.selectedGenreIds
        });

        if (this.image && movie.id) {
          const formData = new FormData();
          formData.append('image', this.image);

          await this.axios.post(`/cinema/movies/${movie.id}/upload-image/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }

        this.$router.push('/movies');
      } catch (err) {
        console.error('Failed to add movie:', err);
        alert('Помилка при додаванні фільму');
      }
    },
    handleActorSelection(id) {
      const index = this.selectedActorIds.indexOf(id);
      if (index > -1) {
        this.selectedActorIds.splice(index, 1);
      } else {
        this.selectedActorIds.push(id);
      }
    },
    handleGenreSelection(id) {
      const index = this.selectedGenreIds.indexOf(id);
      if (index > -1) {
        this.selectedGenreIds.splice(index, 1);
      } else {
        this.selectedGenreIds.push(id);
      }
    },
    handleImageUpload(file) {
      this.image = file;
    }
  },
  watch: {
    active(newVal) {
      if (newVal) this.fetchInitialData();
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
    if (this.active) this.fetchInitialData();
  },
  unmounted() {
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

<style scoped>
.movie-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.header {
  font-weight: 600;
  font-size: 40px;
}
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.description textarea {
  width: 100%;
  min-height: 120px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: transparent;
  color: inherit;
}
</style>
