import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VCalendar from 'v-calendar'

// Global styles
import '@/assets/main.css'  // Matches your actual file

// Axios configuration
axios.defaults.baseURL = process.env.VUE_APP_API_URL || '/api'
axios.defaults.headers.common['Accept'] = 'application/json'

Vue.config.productionTip = false

// Plugins
Vue.use(VueAxios, axios)
Vue.use(VCalendar, {
  componentPrefix: 'vc',
  screens: {
    tablet: '576px',
    laptop: '992px',
    desktop: '1200px'
  }
})

// Global components example
// Vue.component('CustomButton', () => import('@/components/ui/CustomButton.vue'))

// App initialization
new Vue({
  router,
  render: h => h(App),
  mounted() {
    // Initialization code
    document.documentElement.setAttribute('data-theme', 'light')
  }
}).$mount('#app')
