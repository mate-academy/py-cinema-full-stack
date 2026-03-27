<template>
  <div class="header">
    <a class="app-title" href="#/">Cinema Shop</a>
    <div class="menu">
      <a href='#/movie-sessions' :class="{ 'active': activeTab === 'movie-sessions' }">Movie Sessions</a>
      <a href='#/cinema-halls' v-if="user?.is_staff" :class="{ 'active': activeTab === 'cinema-halls' }">Cinema Halls</a>
      <a href='#/movies' :class="{ 'active': activeTab === 'movies' || !activeTab }">Movies</a>
      <a href='#/genres' v-if="user?.is_staff" :class="{ 'active': activeTab === 'genres' }">Genres</a>
      <a href='#/actors' v-if="user?.is_staff" :class="{ 'active': activeTab === 'actors' }">Actors</a>
    </div>

    <div class="action-section">
      <div class="profile-section" ref="profileSection">
        <a class="username" @click.stop="showPopup = !showPopup">{{ user?.email }}</a>
        <header-popup
          v-if="showPopup"
          @openProfile="openProfile"
          @openOrders="openOrders"
          :class="{ 'hidden': !showPopup }"
        ></header-popup>
      </div>
      <action-button
        @click="$emit('log-out')"
        type="outlined"
        width="small"
        label="Log Out"
      ></action-button>
    </div>
  </div>
</template>

<script>
import ActionButton from '../comps/ActionButton.vue';
import HeaderPopup from '../comps/HeaderPopup.vue';

export default {
  name: 'AppHeader',
  data: () => ({
    activeTab: 'movies',
    showPopup: false
  }),
  props: {
    user: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    hashHandler() {
      // Більш надійний регулярний вираз для визначення активної вкладки
      const hash = window.location.hash || '#/movies';
      const match = hash.match(/#\/([a-z-]*)/);
      this.activeTab = match ? match[1] : 'movies';
    },

    openProfile() {
      window.location.hash = '#/my-profile';
      this.showPopup = false;
    },

    openOrders() {
      window.location.hash = '#/my-orders';
      this.showPopup = false;
    },

    // Метод для закриття попапа при кліку поза ним
    closePopup(evt) {
      if (this.showPopup && this.$refs.profileSection && !this.$refs.profileSection.contains(evt.target)) {
        this.showPopup = false;
      }
    }
  },
  mounted() {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();

    // Додаємо слухач на документ
    document.addEventListener('click', this.closePopup);
  },
  // Vue 3: обов'язково чистимо за собою
  unmounted() {
    window.removeEventListener('hashchange', this.hashHandler);
    document.removeEventListener('click', this.closePopup);
  },
  components: {
    ActionButton,
    HeaderPopup
  }
};
</script>

<style scoped>
.header {
  width: 100%;
  display: flex;
  padding: 20px 100px;
  align-items: center;
  background-color: var(--secondary-bg);
  box-sizing: border-box;
}

.app-title {
  font-weight: 900;
  font-size: 25px;
  line-height: 30px;
  margin-right: 20px;
}

.menu {
  display: flex;
}

.menu > * {
  font-size: 16px;
  line-height: 20px;
  padding: 10px 22px;
  border-right: 1px solid var(--border);
}
.menu > *:last-of-type {
  border-right: none;
}

a.active,
.menu > *:hover {
  cursor: pointer;
  font-weight: 700;
}

.action-section {
  color: var(--main-font);
  display: flex;
  align-items: center;
  gap: 24px;
  flex-grow: 1;
  justify-content: flex-end;
}

.profile-section {
  position: relative;
}

.app-title,
.cart {
  cursor: pointer;
}

a {
  color: var(--main-font);
  text-decoration: none;
  transition: opacity 0.2s;
}

a.username {
  cursor: pointer;
  padding-bottom: 2px;
  border-bottom: 1px solid transparent;
}
a.username:hover {
  border-bottom-color: var(--main-font);
}

.hidden {
  display: none;
}
</style>
