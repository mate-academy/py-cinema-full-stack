<template>
  <div class="profile" v-if="active">
    <div class="header">My profile</div>
    <div class="input-container">
      <input-item
        label="Email"
        v-model="email"
        pattern="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$"
        :initialValue="localUser.email"
      ></input-item>
      <password-input label="Password" v-model="password"></password-input>
      <action-button label="Submit" @click="changeUserData"></action-button>

      <div class="result success" v-if="success">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <use href="#success"></use>
        </svg>
        <div>Updated</div>
      </div>

      <div class="result failure" v-if="error">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <use href="#error"></use>
        </svg>
        <div>{{ Array.isArray(error) ? error[0] : error }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import InputItem from '../comps/InputItem.vue';
import ActionButton from '../comps/ActionButton.vue';
import PasswordInput from '../comps/PasswordInput.vue';
import { getUserProfile } from '@/api/user';
import axios from 'axios';

export default {
  name: 'ProfileScreen',
  props: {
    user: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    active: false,
    email: '',
    password: '',
    success: false,
    error: null,
    localUser: {} // Локальна копія для уникнення прямої мутації пропсів
  }),
  computed: {
    token() {
      return localStorage.getItem('access');
    }
  },
  methods: {
    hashHandler() {
      this.active = Boolean(window.location.hash.match('my-profile$'));
    },
    async changeUserData() {
      const config = {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      };

      const body = {};
      // Порівнюємо з localUser
      if (this.email && this.email !== this.localUser.email) body.email = this.email;
      if (this.password) body.password = this.password;

      if (Object.keys(body).length === 0) return;

      try {
        // Виправлено URL: прибрано зайві префікси та додано слеш в кінці
        const { data } = await axios.patch('user/me/', body, config);
        this.success = true;
        this.localUser = data; // Оновлюємо локальні дані
        this.email = '';
        this.password = '';
        this.error = null;
      } catch (err) {
        const errors = err.response?.data || {};
        this.error = errors.password || errors.email || errors.detail || "Error updating profile";
      }
    },
    async loadProfile() {
      if (!this.token) return;
      try {
        const { data } = await getUserProfile(this.token);
        this.localUser = data;
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }
  },
  watch: {
    error(val) {
      if (val) setTimeout(() => { this.error = null; }, 5000);
    },
    success(val) {
      if (val) setTimeout(() => { this.success = false; }, 5000);
    },
    // Стежимо за зміною вхідного пропса
    user: {
      handler(newVal) { this.localUser = { ...newVal }; },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
    this.loadProfile();
  },
  // У Vue 3 використовується unmounted замість beforeDestroy
  unmounted() {
    window.removeEventListener('hashchange', this.hashHandler);
  },
  components: {
    InputItem,
    ActionButton,
    PasswordInput
  }
};
</script>
