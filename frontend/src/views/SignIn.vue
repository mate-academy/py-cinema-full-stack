<template>
  <div class="sign-in">
    <div class="header">Sign In</div>
    <div class="container">
      <input-item label="Email" v-model="email" width="wide"></input-item>
      <password-input label="Password" v-model="password"></password-input>
    </div>
    <action-button label="Submit" @click="signIn"></action-button>
  </div>
</template>

<script>
import InputItem from '../comps/InputItem.vue';
import PasswordInput from '../comps/PasswordInput.vue';
import ActionButton from '../comps/ActionButton.vue';
import axios from 'axios';

export default {
  name: 'SignIn',
  components: {
    InputItem,
    PasswordInput,
    ActionButton
  },
  data: () => ({
    email: '',
    password: ''
  }),
  methods: {
    async signIn() {
      try {
        // Використовуємо відносний шлях, оскільки baseURL вже встановлено в main.js
        // Додаємо '/' в кінці для відповідності стандартам Django
        const { data } = await axios.post('user/token/', {
          email: this.email,
          password: this.password
        });

        const { access, refresh } = data;

        // Зберігаємо токени
        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);

        // Оновлюємо заголовок авторизації для наступних запитів
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

        this.$emit('log-in');
      } catch (err) {
        // Більш детальний вивід помилки для дебагу
        const errorData = err.response?.data;
        console.error('Login error:', errorData || err.message);
        alert(errorData?.detail || "Невірний логін або пароль");
      }
    }
  }
};
</script>
