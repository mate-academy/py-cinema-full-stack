<template>
  <div v-if="active && isStaff" class="actor-container">
    <div class="add-actor" v-if="createMode">
      <div class="header">Add Actor</div>
      <div class="note">Please fill in the fields in details</div>
      <div class="input-container">
        <input-item label="First name" width="wide" v-model="firstName"></input-item>
        <input-item label="Last name" width="wide" v-model="lastName"></input-item>
      </div>
      <action-button label="Submit" @click="addActor"></action-button>
    </div>
    <div class="actors">
      <div class="header">All Actors</div>
      <div class="container">
        <div v-for="(actor, index) in actors" :key="actor.id" :class="index % 2 === 0 ? 'odd' : ''">
          {{actor.first_name}} {{actor.last_name}}
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

import { getActors } from '@/api/cinema/actors';
import { addActor } from '@/api/cinema/actors';

export default {
  props: {
    isStaff: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    active: false,
    actors: [],
    createMode: false,
    firstName: '',
    lastName: ''
  }),
  computed: {
    token () {
      return localStorage.getItem('access');
    }
  },
  methods: {
    async fetchActors () {
      try {
        const { data } = await getActors(this.token);
        this.actors = data;
      } catch (err) {
        console.error(err.response?.data || err);
      }
    },
    async addActor () {
      try {
        await addActor(this.token, {
          first_name: this.firstName,
          last_name: this.lastName
        });
        this.createMode = !this.createMode;
        this.fetchActors();
        this.firstName = '';
        this.lastName = '';
      } catch (err) {
        console.error(err.response?.data || err);
      }
    },
    hashHandler () {
      this.active = Boolean(location.hash.match('actors$'));
    }
  },
  watch: {
    active () {
      if (this.active) {
        this.fetchActors();
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
