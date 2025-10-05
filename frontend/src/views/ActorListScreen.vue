<template>
  <div v-if="active && isStaff" class="actor-container">
    <div class="add-actor" v-if="createMode">
      <div class="header">Add Actor</div>
      <div class="note">Please fill in the fields in details</div>
      <div class="input-container">
        <input-item label="First name" width="wide" v-model="firstName" />
        <input-item label="Last name"  width="wide" v-model="lastName" />
      </div>
      <action-button label="Submit" @click="addActor" />
    </div>

    <div class="actors">
      <div class="header">All Actors</div>
      <div class="container">
        <div
          v-for="(actor, index) in actors"
          :key="actor.id"
          :class="index % 2 === 0 ? 'odd' : ''"
        >
          {{ actor.first_name || actor.firstName }} {{ actor.last_name || actor.lastName }}
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
  name: 'ActorListScreen',
  props: { isStaff: { type: Boolean, default: false } },
  components: { AddBtn, InputItem, ActionButton },

  data: () => ({
    active: false,
    actors: [],
    createMode: false,
    firstName: '',
    lastName: '',
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

    async fetchActors () {
      if (!this.token) { location.hash = '#/sign-in'; return; }
      this.errorText = '';
      try {
        const url = this.buildUrl('/api/cinema/actors/');
        const { data } = await axios.get(url, { headers: this.authHeader() });
        this.actors = Array.isArray(data) ? data : [];
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('access'); localStorage.removeItem('refresh');
          location.hash = '#/sign-in';
        }
        this.errorText = this.safeErr(err);
        console.error('[actors] GET error:', err);
      }
    },

    async addActor () {
      if (!this.token) { location.hash = '#/sign-in'; return; }
      this.errorText = '';
      try {
        const url = this.buildUrl('/api/cinema/actors/');
        await axios.post(
          url,
          { first_name: this.firstName, last_name: this.lastName },
          { headers: { ...this.authHeader(), 'Content-Type': 'application/json' } }
        );
        this.createMode = false;
        this.firstName = ''; this.lastName = '';
        this.fetchActors();
      } catch (err) {
        this.errorText = this.safeErr(err);
        console.error('[actors] POST error:', err);
      }
    },

    hashHandler () {
      this.active = Boolean(location.hash.match('actors$'));
    }
  },

  watch: {
    active (val) { if (val) this.fetchActors(); }
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
.actor-container, .actor-container > * {
  display: flex; flex-direction: column; align-items: center;
  gap: 24px; width: 100%;
}
.add-actor { margin-bottom: 36px; }
.action-button { margin-top: 36px; }
.header { font-weight: 600; font-size: 50px; line-height: 61px; }
.note { font-size: 25px; line-height: 31px; }
.container { width: 100%; font-size: 25px; line-height: 30px; }
.container > div { height: 50px; display: flex; align-items: center; padding: 0 10px; border-radius: 10px; }
.container > .odd { background-color: var(--secondary-bg); }
.input-container { width: 100%; display: flex; gap: 100px; }
</style>
