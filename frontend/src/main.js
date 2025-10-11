// src/main.js (Vue 2)
import Vue from "vue";
import App from "./App.vue";
import VCalendar from "v-calendar";
import router from "./router";                         // Vue Router v3 (hash mode no seu projeto)
import api, { initTokensFromStorage } from "@/api";    // axios central + init dos tokens
import "./assets/main.css";

Vue.use(VCalendar);

// Expondo a instância axios globalmente (compat)
Vue.prototype.$api = api;
Vue.prototype.$axios = api; // compat
Vue.prototype.axios = api;  // compat

Vue.config.productionTip = false;

// --- Inicializa tokens do localStorage ANTES de montar o app ---
initTokensFromStorage();

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
