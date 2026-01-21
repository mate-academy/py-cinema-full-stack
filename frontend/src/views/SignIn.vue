<template>
  <div class="sign-in" v-show="active">
    <h1>Sign in to Cinema Shop</h1>
    <h2>
      Please enter your sign in details.
      <a href="#/sign-up">Sign up</a>
      here if you are not registered yet.
    </h2>

    <input-item
      label="Email"
      placeholder="Email"
      v-model="email"
    ></input-item>

    <password-input v-model="password"></password-input>

    <action-button label="Sign in" @click="signIn"></action-button>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import ActionButton from '../comps/ActionButton.vue';
import InputItem from '../comps/InputItem.vue';
import PasswordInput from '../comps/PasswordInput.vue';

export default {
  data() {
    return {
      active: true,
      email: '',
      password: '',
      error: ''
    };
  },
  methods: {
    async signIn() {
      if (!this.email || !this.password) {
        this.error = 'Please enter email and password';
        return;
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/user/token/`,
          {
            email: this.email,
            password: this.password
          }
        );

        const { access, refresh } = data;

        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);

        this.error = '';
        this.$emit('log-in'); // сповіщаємо батьків
      } catch (err) {
        console.error(err.response);
        this.error = 'Invalid credentials';
      }
    }
  },
  components: {
    InputItem,
    PasswordInput,
    ActionButton
  }
};
</script>

<style scoped>
.sign-in {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

h1 {
  font-size: 50px;
  font-weight: 600;
  text-align: center;
}

h2 {
  font-size: 25px;
  text-align: center;
}

a {
  text-decoration: underline;
  cursor: pointer;
  color: var(--main-font);
}

.error {
  color: red;
  font-weight: 600;
}
</style>
