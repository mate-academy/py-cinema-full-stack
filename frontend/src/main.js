// src/main.js (Vue 2)
import Vue from "vue";
import App from "./App.vue";
import VCalendar from "v-calendar";
import "./assets/main.css";

Vue.use(VCalendar);
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");
