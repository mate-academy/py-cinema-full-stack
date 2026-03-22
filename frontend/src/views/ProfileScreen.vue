<template>
  <div class="profile" v-if="active">
    <div class="header">My profile</div>
    <div class="input-container">
      <input-item
        label="Email"
        v-model="email"
        pattern="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$"
        :initialValue="user.email"
      ></input-item>
      <password-input label="Password" v-model="password"></password-input>
      <action-button label="Submit" @click="changeUserData"></action-button>
      <div class="result success" v-if="success">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <use href="/assets/icons/success.svg#success"></use>
        </svg>
        <div>Updated</div>
      </div>
      <div class="result failure" v-if="error">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <use href="/assets/icons/error.svg#error"></use>
        </svg>
        <div>{{error[0]}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import InputItem from '../comps/InputItem.vue';
import ActionButton from '../comps/ActionButton.vue';
import PasswordInput from '../comps/PasswordInput.vue';
import { getUserProfile } from '@/api/user/me';
import axios from 'axios';

export default {
  props: {
    user: {
      type: Object,
      default: () => {}
    }
  },
  data: () => ({
    active: false,
    email: '',
    password: '',
    success: null,
    error: null
  }),
  computed: {
    token () {
      return localStorage.getItem('access');
    }
  },
  methods: {
    hashHandler () {
      this.active = Boolean(location.hash.match('my-profile$'));
    },
    async changeUserData () {
      const config = {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      };
      const body = {};
      if (this.email && this.email !== this.user.email) body.email = this.email;
      if (this.password) body.password = this.password;
      try {
        const { data } = await axios.patch(`${import.meta.env.VITE_USER_API_URL}/me/`, body, config);
        this.success = !!data;
        this.email = '';
        this.password = '';
      } catch (err) {
        const { password = null, email = null } = err.response?.data || {};
        this.error = password || email;
      }
    },
    async loadProfile () {
      try {
        const { data } = await getUserProfile(this.token);
        this.user = data;
      } catch (err) {
        console.error(err);
      }
    }
  },
  watch: {
    error () {
      setTimeout(() => {
        this.error = null;
      }, 15000);
    },
    success () {
      setTimeout(() => {
        this.success = null;
      }, 15000);
    }
  },
  mounted () {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
    this.loadProfile();
  },
  beforeDestroy () {
    window.removeEventListener('hashchange', this.hashHandler);
  },
  components: {
    InputItem,
    ActionButton,
    PasswordInput
  }
};
</script>

<style scoped>
.profile, .profile > * {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
}
.action-button {
  margin-top: 16px;
}
.header {
  font-weight: 600;
  font-size: 50px;
  line-height: 61px;
}
.result {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}
</style>
