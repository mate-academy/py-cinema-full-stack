<template>
  <nav class="nav">
    <div class="brand">Py Cinema</div>

    <ul class="links">
      <li :class="{ active: isActive('/movies') }">
        <router-link to="/movies">Movies</router-link>
      </li>

      <li :class="{ active: isActive('/movie-sessions') }">
        <router-link to="/movie-sessions">Sessions</router-link>
      </li>

      <li :class="{ active: isActive('/orders') }">
        <router-link to="/orders">My Orders</router-link>
      </li>

      <!-- Links opcionais: crie as rotas/telas conforme necessário -->
      <li :class="{ active: isActive('/cinema-halls') }">
        <router-link to="/cinema-halls">Halls</router-link>
      </li>
      <li :class="{ active: isActive('/actors') }">
        <router-link to="/actors">Actors</router-link>
      </li>
      <li :class="{ active: isActive('/genres') }">
        <router-link to="/genres">Genres</router-link>
      </li>
    </ul>

    <div class="right">
      <slot name="right"></slot>
    </div>
  </nav>
</template>

<script>
export default {
  name: "AppNav",
  methods: {
    isActive(target) {
      const path = this.$route?.path || "/movies";
      return path.startsWith(target);
    },
  },
};
</script>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 14px;
  border-bottom: 1px solid #eee;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.brand {
  font-weight: 700;
  letter-spacing: .3px;
}
.links {
  display: flex;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.links a {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
}
.links li.active a,
.links a.router-link-exact-active {
  background: #eef;
  color: #1f3a8a;
}
.right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
