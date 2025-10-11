<template>
  <div class="signin-page">
    <div class="card">
      <h1 class="title">Sign in to Cinema Shop</h1>
      <p class="subtitle">
        Please enter your sign in details.
        <router-link to="/signup">Sign up</router-link> here if you are not registered yet.
      </p>

      <form @submit.prevent="signIn" class="form">
        <label class="label">
          <span>Login</span>
          <input
            v-model.trim="email"
            type="email"
            autocomplete="email"
            required
            autofocus
            class="input"
            placeholder="your@email.com"
          />
        </label>

        <label class="label">
          <span>Password</span>
          <div class="password-row">
            <input
              v-model="password"
              :type="show ? 'text' : 'password'"
              autocomplete="current-password"
              required
              class="input"
              placeholder="••••••••"
            />
            <button type="button" class="toggle" @click="show = !show">
              {{ show ? '🙈' : '👁' }}
            </button>
          </div>
        </label>

        <button :disabled="loading" type="submit" class="submit">
          <span v-if="!loading">Sign in</span>
          <span v-else>Signing in…</span>
        </button>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script>
// Usa o alias configurado no Vite
import api, { login, me, setTokens, isAuthenticated } from "@/api";

export default {
  name: "SignIn",
  data() {
    return {
      email: "",
      password: "",
      show: false,
      loading: false,
      errorMsg: "",
    };
  },
  async mounted() {
    // Se já estiver autenticado (tokens no storage), pula o login.
    if (isAuthenticated()) {
      try {
        await me();
        const nextPath = this.$route.query.next || "/movies"; // <-- respeita ?next=
        this.$router.replace(nextPath);
      } catch (_) {
        /* se falhar, permanece na tela de login */
      }
    }
    // Debug opcional:
    // console.log("API baseURL =", api?.defaults?.baseURL);
  },
  methods: {
    async signIn() {
      this.errorMsg = "";
      this.loading = true;
      try {
        // Envia JSON PURO: { email, password }
        const data = await login(this.email, this.password);
        // login() já chama setTokens; mantemos por segurança:
        setTokens({ access: data.access, refresh: data.refresh, persist: true });

        // Sanity check
        await me();

        // Redireciona para rota autenticada respeitando ?next=
        const nextPath = this.$route.query.next || "/movies"; // <-- respeita ?next=
        this.$router.replace(nextPath);
      } catch (e) {
        this.errorMsg =
          e?.response?.data?.detail ||
          (Array.isArray(e?.response?.data?.non_field_errors) &&
            e.response.data.non_field_errors[0]) ||
          (typeof e?.response?.data === "string" && e.response.data) ||
          e?.message ||
          "Login failed";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.signin-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #111;
  color: #eee;
  padding: 24px;
}
.card {
  width: 100%;
  max-width: 520px;
  background: #1b1b1b;
  border-radius: 16px;
  padding: 24px 24px 28px;
  box-shadow: 0 10px 30px rgba(0,0,0,.35);
}
.title {
  margin: 0 0 8px;
  font-size: 32px;
  line-height: 1.2;
}
.subtitle {
  margin: 0 0 24px;
  color: #bbb;
}
.form {
  display: grid;
  gap: 16px;
}
.label span {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}
.input {
  width: 100%;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #444;
  background: #0f0f0f;
  color: #eee;
  padding: 0 12px;
  outline: none;
}
.password-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}
.toggle {
  height: 40px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #444;
  background: #222;
  color: #ddd;
  cursor: pointer;
}
.submit {
  height: 44px;
  border: 0;
  border-radius: 12px;
  background: #ff5252;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
.submit:disabled {
  opacity: .6;
  cursor: default;
}
.error {
  margin-top: 8px;
  color: #ff7b7b;
}
</style>
