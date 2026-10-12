<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import logoMboa from "../../assets/icons/icon-mboaTour.jpg";
import { useAuth } from "../../composables/useAuth.ts";
import { useAuthModal } from "../../composables/useAuthModal.ts";
import { useUserDashboardModal } from "../../composables/useUserDashboardModal.ts";
import { useDarkMode } from "../../composables/useDarkMode.ts";

const { open: openUserDashboard } = useUserDashboardModal();
const { openLogin } = useAuthModal();
const { isLoggedIn, currentUser, logout } = useAuth();
const { isDark, toggleDarkMode } = useDarkMode();

function handleLogoutClick() {
  if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
    logout();
  }
}

// ======================================================
// OMBRE PROGRESSIVE AU SCROLL
// Le header étant fixe, on ajoute une ombre plus marquée
// dès que la page est scrollée, pour un rendu plus soigné
// qu'une ombre statique.
// ======================================================
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 8;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <header
    class="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md dark:bg-gray-900/95 transition-shadow duration-300"
    :class="isScrolled ? 'shadow-md dark:shadow-gray-950/40' : 'shadow-sm dark:shadow-gray-800'"
  >
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2 shrink-0">
        <div
          class="w-12 h-12 rounded-full bg-mboa-green flex items-center justify-center overflow-hidden ring-2 ring-mboa-gold/30"
        >
          <img
            :src="logoMboa"
            alt="MboaTour Logo"
            class="w-full h-full object-cover"
          />
        </div>
        <div>
          <span class="font-bold text-mboa-green text-lg leading-none block dark:text-mboa-gold">
            MboaTour
          </span>
          <span class="text-[10px] text-gray-500 font-bold tracking-wide dark:text-gray-400">
            CULTURAL TOURISM APP
          </span>
        </div>
      </router-link>

      <!-- Navigation -->
      <nav
        class="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <router-link
          to="/"
          class="hover:text-mboa-green dark:hover:text-mboa-gold transition-colors py-1"
          active-class="font-bold text-mboa-green dark:text-mboa-gold border-b-2 border-mboa-gold"
          >Accueil</router-link
        >
        <router-link
          to="/explorer"
          class="hover:text-mboa-green dark:hover:text-mboa-gold transition-colors py-1"
          active-class="font-bold text-mboa-green dark:text-mboa-gold border-b-2 border-mboa-gold"
          >Explorer</router-link
        >
        <router-link
          to="/a-propos"
          class="hover:text-mboa-green dark:hover:text-mboa-gold transition-colors py-1"
          active-class="font-bold text-mboa-green dark:text-mboa-gold border-b-2 border-mboa-gold"
          >À propos</router-link
        >
        <router-link
          to="/faq"
          class="hover:text-mboa-green dark:hover:text-mboa-gold transition-colors py-1"
          active-class="font-bold text-mboa-green dark:text-mboa-gold border-b-2 border-mboa-gold"
          >FAQ</router-link
        >
        <router-link
          to="/contact"
          class="hover:text-mboa-green dark:hover:text-mboa-gold transition-colors py-1"
          active-class="font-bold text-mboa-green dark:text-mboa-gold border-b-2 border-mboa-gold"
          >Nous Contacter</router-link
        >
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-4">
        <!-- Bascule mode sombre / clair -->
        <button
          @click="toggleDarkMode"
          type="button"
          :aria-label="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
          :title="isDark ? 'Mode clair' : 'Mode sombre'"
          class="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:bg-mboa-belge dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <svg
            v-if="!isDark"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-5 h-5"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-5 h-5"
          >
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
            />
          </svg>
        </button>

        <!-- Sélecteur de langue -->
        <button
          class="text-sm text-gray-600 flex items-center gap-1 dark:text-gray-300 hover:text-mboa-green dark:hover:text-mboa-gold transition-colors"
        >
          FR
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-4 h-4"
          >
            <path d="M6 9 L12 15 L18 9" />
          </svg>
        </button>

        <!-- Bouton se connecter -->
        <button
          v-if="!isLoggedIn"
          @click="openLogin"
          class="bg-mboa-red text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Se connecter
        </button>
        <div v-else class="flex items-center gap-3">
          <span class="w-2 h-2 rounded-full bg-green-500"></span>
          <button
            @click="openUserDashboard"
            class="text-sm text-gray-700 hover:text-mboa-green dark:text-gray-300 dark:hover:text-mboa-gold transition-colors"
          >
            <span class="font-medium text-gray-700 dark:text-gray-300">{{
              currentUser?.nom
            }}</span>
          </button>
          <button
            @click="handleLogoutClick"
            class="bg-mboa-red text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Espaceur : compense le header en position fixed pour que
       le contenu de la page ne soit pas masqué en dessous -->
  <div class="h-20"></div>
</template>