<template>
  <div class="sign-in">
    <h1>Sign in to Cinema Shop</h1>
    <h2>
      Please enter your sign in details.
      <a href="#/sign-up">Sign up</a> here if you are not registered yet.
    </h2>
    <input-item
      label="Login"
      pattern="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$"
      placeholder="Email"
      v-model="email"
    ></input-item>
    <password-input v-model="password"></password-input>
    <action-button
      label="Sign in"
      :disabled="!email || !password"
      @click="signIn"
    ></action-button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import ActionButton from '../comps/ActionButton.vue';
import InputItem from '../comps/InputItem.vue';
import PasswordInput from '../comps/PasswordInput.vue';
import axios from 'axios';

export default {
  data: () => ({
    email: '',
    password: '',
    error: null,
  }),
  methods: {
    async signIn() {
      this.error = null;

      try {
        const { data } = await axios.post(
          'http://localhost:8080/api/user/token/',
          {
            email: this.email,
            password: this.password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );

        const { access, refresh } = data;

        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);

        this.$emit('log-in');
      } catch (err) {
        console.error(err);
        this.error =
          err.response?.data?.detail || 'Login failed. Check your credentials.';
      }
    },
  },
  components: {
    InputItem,
    PasswordInput,
    ActionButton,
  },
};
</script>

<style scoped>
.sign-in {
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
  left: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
}

.error {
  color: red;
  font-weight: 600;
  margin-top: 12px;
}

h1 {
  font-size: 50px;
  font-weight: 600;
  text-align: center;
  line-height: 60px;
}

h2 {
  font-size: 25px;
  text-align: center;
  margin-bottom: 16px;
  line-height: 30px;
}

a {
  text-decoration: underline;
  font-weight: 600;
  cursor: pointer;
  color: var(--main-font);
}
</style>
