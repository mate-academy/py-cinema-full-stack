<template>
  <div class="header">
    <a class="app-title" href="/">Cinema Shop</a>
    <div class="menu">
      <a
        href="#/movie-sessions"
        :class="{ active: activeTab === 'movie-sessions' }"
      >Movie Sessions</a>
      <a
        href="#/cinema-halls"
        v-if="user && user.is_staff"
        :class="{ active: activeTab === 'cinema-halls' }"
      >Cinema Halls</a>
      <a
        href="#/movies"
        :class="{ active: isMoviesActive }"
      >Movies</a>
      <a
        href="#/genres"
        v-if="user && user.is_staff"
        :class="{ active: activeTab === 'genres' }"
      >Genres</a>
      <a
        href="#/actors"
        v-if="user && user.is_staff"
        :class="{ active: activeTab === 'actors' }"
      >Actors</a>
    </div>
    <div class="action-section">
      <div class="profile-section">
        <a class="username" @click="showPopup = !showPopup">{{ user ? user.email : '' }}</a>
        <header-popup
          v-if="showPopup"
          @openProfile="openProfile"
          @openOrders="openOrders"
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
  data: () => ({
    activeTab: 'movies',
    showPopup: false
  }),
  props: {
    user: {
      type: Object,
      default: () => ({
        is_staff: false,
        email: ''
      })
    }
  },
  computed: {
    isMoviesActive () {
      return Boolean(this.activeTab && this.activeTab.match(/(movies|^$)/));
    }
  },
  methods: {
    hashHandler () {
      const match = location.hash.match(/#\/([a-z]*-[a-z]*|[a-z]*)/);

      if (match && match[1]) {
        this.activeTab = match[1];
      } else {
        this.activeTab = 'movies';
      }
    },

    openProfile () {
      location.hash = '#/my-profile';
    },

    openOrders () {
      location.hash = '#/my-orders';
    },

    clickOutsideHandler (evt) {
      const profileSectionEl = document.querySelector('.profile-section');
      if (this.showPopup && profileSectionEl && !profileSectionEl.contains(evt.target)) {
        this.showPopup = false;
      }
    }
  },
  mounted () {
    window.addEventListener('hashchange', this.hashHandler);
    this.hashHandler();

    document.addEventListener('click', this.clickOutsideHandler);
  },
  beforeDestroy () {
    window.removeEventListener('hashchange', this.hashHandler);
    document.removeEventListener('click', this.clickOutsideHandler);
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
  cursor: pointer;
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

a {
  color: var(--main-font);
  text-decoration: none;
}

a.username {
  padding-bottom: 2px;
  border-bottom: 1px solid transparent;
  cursor: pointer;
}

a.username:hover {
  border-color: var(--main-font);
}
</style>