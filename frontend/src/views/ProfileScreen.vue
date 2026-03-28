<template>
  <div class="profile" v-if="active">
    <div class="header">My profile</div>
    <div class="input-container">
      <input-item
        label="Email"
        v-model="email"
        pattern="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$"
        :placeholder="user?.email"
      ></input-item>
      <password-input label="New Password" v-model="password"></password-input>
      <action-button label="Submit" @click="changeUserData" :disabled="!email && !password"></action-button>

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
    error: null
  }),
  methods: {
    hashHandler() {
      this.active = Boolean(window.location.hash.match('my-profile$'));
    },
    async changeUserData() {
      const body = {};
      if (this.email && this.email !== this.user.email) body.email = this.email;
      if (this.password) body.password = this.password;

      if (Object.keys(body).length === 0) return;

      try {
        await this.axios.patch('/user/me/', body);
        this.success = true;
        this.email = '';
        this.password = '';
        this.error = null;
        // Оновлюємо дані користувача в App.vue через подію
        this.$emit('refresh-user');
      } catch (err) {
        const errors = err.response?.data || {};
        this.error = errors.password || errors.email || errors.detail || "Error updating profile";
      }
    }
  },
  watch: {
    error(val) {
      if (val) setTimeout(() => { this.error = null; }, 5000);
    },
    success(val) {
      if (val) setTimeout(() => { this.success = false; }, 5000);
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();
  },
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

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 40px;
}
.header {
  font-size: 40px;
  font-weight: 600;
}
.input-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 400px;
}
.result {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
}
.success { color: #4caf50; }
.failure { color: #f44336; }
</style>
