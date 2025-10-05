<template>
  <div v-if="active && isStaff" class="genres-container">
    <div class="add-genre" v-if="createMode">
      <div class="header">Add Genre</div>
      <div class="note">Please fill in the fields in details</div>
      <input-item label="Genre" width="wide" v-model="name" />
      <action-button label="Submit" @click="addGenre" />
    </div>

    <div class="genres">
      <div class="header">All Genres</div>
      <div class="container">
        <div
          v-for="(genre, index) in genres"
          :key="genre.id"
          :class="index % 2 === 0 ? 'odd' : ''"
        >
          {{ genre.name || genre.title }}
        </div>
      </div>
      <add-btn @click="createMode = !createMode" />
    </div>

    <p v-if="errorText" style="color:#ff6b6b;margin-top:12px">{{ errorText }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import AddBtn from '../comps/AddBtn.vue';
import InputItem from '../comps/InputItem.vue';
import ActionButton from '../comps/ActionButton.vue';

export default {
  name: 'GenreListScreen',
  props: { isStaff: { type: Boolean, default: false } },
  components: { AddBtn, InputItem, ActionButton },

  data: () => ({
    active: false,
    genres: [],
    createMode: false,
    name: '',
    errorText: ''
  }),

  computed: {
    token () { return localStorage.getItem('access'); }
  },

  methods: {
    baseUrl () {
      const env = (import.meta.env && import.meta.env.VITE_API_URL) || '';
      const base = env && env.trim() ? env.trim() : 'http://localhost:8080';
      return new URL('/', base).origin;
    },
    buildUrl (path) { return new URL(path, this.baseUrl()).toString(); },
    authHeader () { return this.token ? { Authorization: `Bearer ${this.token}` } : {}; },
    safeErr (err) {
      return err?.response?.data?.detail ||
             err?.response?.data?.error ||
             (err?.response ? `HTTP ${err.response.status}` : (err?.message || 'Request failed'));
    },

    async fetchGenres () {
      if (!this.token) { location.hash = '#/sign-in'; return; }
      this.errorText = '';
      try {
        const url = this.buildUrl('/api/cinema/genres/');
        const { data } = await axios.get(url, { headers: this.authHeader() });
        this.genres = Array.isArray(data) ? data : [];
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('access'); localStorage.removeItem('refresh');
          location.hash = '#/sign-in';
        }
        this.errorText = this.safeErr(err);
        console.error('[genres] GET error:', err);
      }
    },

    async addGenre () {
      if (!this.token) { location.hash = '#/sign-in'; return; }
      this.errorText = '';
      try {
        const url = this.buildUrl('/api/cinema/genres/');
        await axios.post(
          url,
          { name: this.name },
          { headers: { ...this.authHeader(), 'Content-Type': 'application/json' } }
        );
        this.createMode = false;
        this.name = '';
        this.fetchGenres();
      } catch (err) {
        this.errorText = this.safeErr(err);
        console.error('[genres] POST error:', err);
      }
    },

    hashHandler () {
      this.active = Boolean(location.hash.match('genres$'));
    }
  },

  watch: {
    active (val) { if (val) this.fetchGenres(); }
  },

  mounted () {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
  },

  beforeDestroy () {
    window.removeEventListener('hashchange', this.hashHandler);
  }
};
</script>

<style scoped>
.genres-container, .genres-container > * {
  display: flex; flex-direction: column; align-items: center;
  gap: 24px; width: 100%;
}
.add-genre { margin-bottom: 36px; }
.action-button { margin-top: 36px; }
.header { font-weight: 600; font-size: 50px; line-height: 61px; }
.note { font-size: 25px; line-height: 31px; }
.container { width: 100%; font-size: 25px; line-height: 30px; }
.container > div { height: 50px; display: flex; align-items: center; padding: 0 10px; border-radius: 10px; }
.container > .odd { background-color: var(--secondary-bg); }
</style>
