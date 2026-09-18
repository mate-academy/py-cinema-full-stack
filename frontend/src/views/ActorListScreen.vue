<template>
  <div v-if="active && isStaff" class="actor-container">
    <div class="add-actor" v-if="createMode">
      <div class="header">Add Actor</div>
      <div class="note">Please fill in the fields in details</div>
      <div class="input-container">
        <input-item label="First name" width="wide" v-model="firstName"></input-item>
        <input-item label="Last name" width="wide" v-model="lastName"></input-item>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <action-button label="Submit" @click="addActor" :disabled="!firstName.trim() || !lastName.trim()"></action-button>
    </div>
    <div class="actors" v-if="!createMode">
      <div class="header">All Actors</div>
      <div class="container">
        <div v-for="(actor, index) in actors" :key="actor.id" :class="index % 2 === 0 ? 'odd' : ''">
          {{actor.first_name}} {{actor.last_name}}
        </div>
      </div>
      <add-btn @click="handleActorCreate"></add-btn>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

import AddBtn from '../comps/AddBtn.vue';
import InputItem from '../comps/InputItem.vue';
import ActionButton from '../comps/ActionButton.vue';
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
    lastName: '',
    error: ''
  }),
  computed: {
    token () {
      return localStorage.getItem('access');
    }
  },
  methods: {
    async fetchActors () {
      try {
        const { data: actors } = await axios.get('/api/cinema/actors/', {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.actors = actors;
      } catch (err) {
        console.error(err.response.data);
      }
    },

    async addActor () {
      this.error = '';
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        };

        await axios.post(
          '/api/cinema/actors/',
          {
            first_name: this.firstName,
            last_name: this.lastName
          },
          config
        );

        location.hash = '#/actors';

        this.firstName = '';
        this.lastName = '';
      } catch (err) {
        this.error = this.getErrorMessage(err, 'Unable to create the actor.');
      }
    },

    getErrorMessage (err, fallback) {
      const data = err.response && err.response.data;
      if (!data) return fallback;
      if (typeof data === 'string') return data;
      return Object.values(data).flat().join(' ') || fallback;
    },

    hashHandler () {
      this.active = Boolean(location.hash.match(/actors(?:\?add=true)?$/));
      this.createMode = Boolean(location.hash.match('actors\\?add=true$'));
    },

    handleActorCreate () {
      location.hash = '#/actors?add=true';
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

<style scoped>
.actor-container, .actor-container > * {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
}

.add-actor {
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

.input-container {
  width: 100%;
  display: flex;
  gap: 100px;
}

.error {
  color: var(--red);
}
</style>
