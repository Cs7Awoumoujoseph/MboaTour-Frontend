import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ExploreView from "../views/ExploreView.vue";
import SiteDetailView from "../views/SiteDetailView.vue";
import AdminDashboard from "../views/admin/AdminDashboardView.vue";
import LoginView from "../views/admin/LoginView.vue";
import { useAuth } from "../composables/useAuth.ts";
import AproposView from "../views/AproposView.vue";
import Contact from "../views/Contact.vue";
import Faq from "../views/Faq.vue";

const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/explorer", name: "explore", component: ExploreView },
  { path: "/a-propos", name: "a-proppos", component: AproposView },
  { path: "/contact", name: "contact", component: Contact },
  { path: "/faq", name: "faq", component: Faq },
  { path: "/site/:id", name: "site-detail", component: SiteDetailView },
  {
    path: "/admin",
    name: "admin-dashboard",
    component: AdminDashboard,
    meta: { hideLayout: true },
  },
  {
    path: "/admin/login",
    name: "admin-login",
    component: LoginView,
    meta: { hideLayout: true },
  },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const { isLoggedIn, currentUser } = useAuth();
  if (
    to.path === "/admin" &&
    (!isLoggedIn.value || currentUser.value?.type !== "ADMIN")
  ) {
    return "/admin/login";
  }
});

export default router;
