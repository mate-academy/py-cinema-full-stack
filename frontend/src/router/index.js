import Vue from "vue";
import Router from "vue-router";
import { isAuthenticated, initTokensFromStorage } from "@/api";

// === Páginas (lazy) ===
const SignIn = () => import("@/views/SignIn.vue");
const MovieListScreen = () => import("@/views/MovieListScreen.vue");
const MovieSessionListScreen = () => import("@/views/MovieSessionListScreen.vue");
const MovieSessionDetailScreen = () => import("@/views/MovieSessionDetailScreen.vue");
const OrderListScreen = () => import("@/views/OrderListScreen.vue");
const ProfileScreen = () => import("@/views/ProfileScreen.vue");

// Componente inline para ping/debug do router
const RouterPing = {
  name: "RouterPing",
  render(h) {
    return h("div", { style: { padding: "16px", color: "#fff" } }, [
      h("h2", "Router is alive ✅"),
      h("p", `Current path: ${window.location.hash}`),
    ]);
  },
};

Vue.use(Router);
initTokensFromStorage();

const router = new Router({
  mode: "hash",
  routes: [
    { path: "/", redirect: "/movies" },

    // Público
    { path: "/login", name: "login", component: SignIn, meta: { public: true } },

    // Privadas
    { path: "/movies", name: "movies", component: MovieListScreen, meta: { requiresAuth: true } },
    { path: "/movie-sessions", name: "movie-sessions", component: MovieSessionListScreen, meta: { requiresAuth: true } },

    // >>> Detalhe (sem regex, sem props) <<<
    {
      path: "/movie-sessions/:id",
      name: "movie-session-detail",
      component: MovieSessionDetailScreen,
      meta: { requiresAuth: true },
    },

    { path: "/orders", name: "orders", component: OrderListScreen, meta: { requiresAuth: true } },
    { path: "/profile", name: "profile", component: ProfileScreen, meta: { requiresAuth: true } },

    // Rota de depuração para checar se o Router está funcionando
    { path: "/__router-ping", name: "__router_ping", component: RouterPing, meta: { requiresAuth: false } },

    // Catch-all
    { path: "*", redirect: "/movies" },
  ],
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
});

// Logs de depuração
router.beforeEach((to, from, next) => {
  // eslint-disable-next-line no-console
  console.log("[router.beforeEach] from:", from.fullPath, "-> to:", to.fullPath);

  const authed = isAuthenticated();
  if (to.path === "/login" && authed) {
    // eslint-disable-next-line no-console
    console.log("[router] already authed → redirect /movies");
    return next({ path: "/movies", replace: true });
  }

  if (to.matched.some((r) => r.meta && r.meta.requiresAuth)) {
    if (!authed) {
      // eslint-disable-next-line no-console
      console.warn("[router] blocked (not authed) → /login");
      return next({
        path: "/login",
        query: to.fullPath ? { next: to.fullPath } : undefined,
        replace: true,
      });
    }
  }

  return next();
});

router.afterEach((to) => {
  // eslint-disable-next-line no-console
  console.log("[router.afterEach] now at:", to.fullPath);
});

// Import lazy com erro? Cai aqui:
router.onError((err) => {
  // eslint-disable-next-line no-console
  console.error("[router] async component load error:", err);
});

export default router;
