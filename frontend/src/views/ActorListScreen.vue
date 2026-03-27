<template>
  <div v-if="active && isStaff" class="actor-container">
    <div class="add-actor" v-if="createMode">
      <div class="header">Add Actor</div>
      <div class="note">Please fill in the fields in details</div>
      <div class="input-container">
        <input-item label="First name" width="wide" v-model="firstName"></input-item>
        <input-item label="Last name" width="wide" v-model="lastName"></input-item>
      </div>
      <action-button
        label="Submit"
        @click="addActor"
        :disabled="!firstName || !lastName"
      ></action-button>
    </div>

    <div class="actors">
      <div class="header">All Actors</div>
      <div class="container">
        <div v-if="actors.length === 0" class="no-data">No actors found.</div>

        <div
          v-for="(actor, index) in actors"
          :key="actor.id"
          :class="['actor-item', index % 2 === 0 ? 'odd' : '']"
        >
          {{ actor.first_name }} {{ actor.last_name }}
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

// Перевірте шлях до API (імовірно @/api/cinema/actors)
import { getActors, addActor as addActorApi } from '@/api/cinema/actors';

export default {
  name: 'ActorListScreen',
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
    token() {
      return localStorage.getItem('access');
    }
  },
  methods: {
    hashHandler() {
      this.active = window.location.hash.endsWith('actors');
    },
    async fetchActors() {
      if (!this.token) return;
      try {
        const { data } = await getActors(this.token);
        // Обробка пагінації Django (results)
        this.actors = Array.isArray(data) ? data : (data.results || []);
      } catch (err) {
        console.error('Fetch actors error:', err.response?.data || err);
      }
    },
    async addActor() {
      if (!this.firstName.trim() || !this.lastName.trim()) return;
      try {
        await addActorApi(this.token, {
          first_name: this.firstName,
          last_name: this.lastName
        });

        // Скидання стану
        this.createMode = false;
        this.firstName = '';
        this.lastName = '';

        // Оновлення списку
        await this.fetchActors();
      } catch (err) {
        console.error('Add actor error:', err.response?.data || err);
        alert('Failed to add actor. Check console for details.');
      }
    }
  },
  watch: {
    active(newVal) {
      if (newVal) {
        this.fetchActors();
      }
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
    if (this.active) this.fetchActors();
  },
  // Vue 3: unmounted замість beforeDestroy
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
.actor-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  padding: 20px;
}
.add-actor, .actors {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 700px;
}
.input-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}
.header {
  font-weight: 600;
  font-size: 40px;
}
.note {
  font-size: 18px;
  color: #888;
}
.container {
  width: 100%;
  font-size: 20px;
}
.actor-item {
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
