<template>
  <div class="sign-in" v-if="active">
    <h1>Sign in to Cinema Shop</h1>
    <h2>
      Please enter your sign in details.
      <a href="#/sign-up">Sign up</a>
      here if you are not registered yet.
    </h2>

    <input-item
      label="Login"
      pattern="^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$"
      placeholder="Email"
      v-model="email"
    ></input-item>

    <password-input v-model="password"></password-input>
    <action-button label="Sign in" @click="signIn"></action-button>
  </div>
</template>

<script>
import ActionButton from "../comps/ActionButton.vue";
import InputItem from "../comps/InputItem.vue";
import PasswordInput from "../comps/PasswordInput.vue";

export default {
  data: () => ({
    active: false,
    email: "",
    password: "",
  }),
  methods: {
    hashHandler() {
      this.active = !location.hash.match("sign-up$");
    },

    async signIn() {
      try {
        // VITE_API_URL: backend root (e.g. http://localhost:8000)
        // correct endpoint: POST /api/user/token/
        const baseUrl = import.meta.env.VITE_API_URL;
        const url = `${baseUrl}/api/user/token/`;

        const { data } = await this.axios.post(url, {
          email: this.email,
          password: this.password,
        });

        const { access, refresh } = data;

        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);

        this.$emit("log-in");
      } catch (err) {
        const status = err?.response?.status;
        const payload = err?.response?.data;
        console.error("Sign in failed:", status, payload || err.message);
      }
    },
  },
  mounted() {
    window.addEventListener("hashchange", this.hashHandler);
    this.hashHandler();
  },
  beforeUnmount() {
    window.removeEventListener("hashchange", this.hashHandler);
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
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
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
