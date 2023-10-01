<template>
  <div class="header">
    <a class="app-title" href="/">Cinema Shop</a>
    <div class="menu">
      <a href='#/movie-sessions' :class="activeTab === 'movie-sessions' && 'active'">Movie Sessions</a>
      <a href='#/cinema-halls' v-if="user.is_staff" :class="activeTab === 'cinema-halls' && 'active'">Cinema Halls</a>
      <a href='#/movies' :class="activeTab.match(/(movies|^$)/) && 'active'">Movies</a>
      <a href='#/genres' v-if="user.is_staff" :class="activeTab === 'genres' && 'active'">Genres</a>
      <a href='#/actors' v-if="user.is_staff" :class="activeTab === 'actors' && 'active'">Actors</a>
    </div>
    <div class="action-section">
      <div class="profile-section">
        <a class="username" @click="showPopup = !showPopup">{{user.email}}</a>
        <header-popup
          @openProfile="openProfile"
          @openOrders="openOrders"
          :class="!showPopup && 'hidden'"
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
import ActionButton from '../comps/ActionButton.vue/';
import HeaderPopup from '../comps/HeaderPopup.vue/';
export default {
  data: () => ({
    activeTab: 'movies',
    showPopup: false
  }),
  props: {
    user: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    hashHandler () {
      const [, active] = location.hash.match(/#\/([a-z]*-[a-z]*|[a-z]*)/);
      this.activeTab = active;
    },

    openProfile () {
      location.hash = '#/my-profile';
    },

    openOrders () {
      location.hash = '#/my-orders';
    }

  },
  mounted () {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();

    const profileSectionEl = document.querySelector('.profile-section');
    document.addEventListener('click', evt => {
      if (this.showPopup && !profileSectionEl.contains(evt.target)) this.showPopup = false;
    });
  },
  beforeDestroy () {
    window.removeEventListener('hashchange', this.hashHandler);
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
}

.app-title {
  font-weight: 900;
  font-size: 25px;
  line-height: 30px;
  margin-right: 20px;
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
  justify-content: right;
}

.app-title,
.cart {
  cursor: pointer;
}

a {
  color: var(--main-font);
  text-decoration: none;
}

a.username {
  padding-bottom: 2px;
  border-bottom: 1px solid transparent;
}
a.username:hover {
  border-color: var(--main-font);
}

.hidden {
  display: none;
}
</style>
