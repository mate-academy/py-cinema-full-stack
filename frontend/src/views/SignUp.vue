<template>
  <div class="sign-up">
    <div class="header">Sign Up</div>
    <div class="container">
      <input-item label="Email" v-model="email" width="wide"></input-item>
      <password-input label="Password" v-model="password"></password-input>
    </div>
    <action-button label="Submit" @click="signUp"></action-button>
  </div>
</template>

<script>
import InputItem from '../comps/InputItem.vue';
import PasswordInput from '../comps/PasswordInput.vue';
import ActionButton from '../comps/ActionButton.vue';
// Імпортуємо axios, він уже має baseURL з main.js
import axios from 'axios';

export default {
  name: 'SignUp',
  components: {
    InputItem,
    PasswordInput,
    ActionButton
  },
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    async signUp() {
      try {
        // 1. Реєстрація (шлях відносно baseURL)
        await axios.post('user/register/', {
          email: this.email,
          password: this.password
        });

        // 2. Логін для отримання токенів
        const { data } = await axios.post('user/token/', {
          email: this.email,
          password: this.password
        });

        const { access, refresh } = data;
        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);

        // Повідомляємо батьківський компонент про успіх
        this.$emit('log-in');

      } catch (err) {
        // Виводимо помилку в консоль для дебагу
        console.error('Помилка реєстрації:', err.response?.data || err);
        alert(JSON.stringify(err.response?.data) || "Помилка з'єднання з сервером");
      }
    }
  }
};
</script>
