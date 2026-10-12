<script setup>
import SiteFormModal from "./SiteFormModal.vue";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../../composables/useAuth";
import logoMboa from "../../assets/icons/icon-mboaTour.jpg";
import { useAdminSites } from "../../composables/useAdminSites";
import { useSiteFormModal } from "../../composables/useSiteFormModal";

const {
  sites,
  loading,
  error,
  loadSites,
  removeSite,
  publishedCount,
  draftCount,
} = useAdminSites();

async function handleDelete(id) {
  if (!confirm("Supprimer ce site ?")) return;
  try {
    await removeSite(id);
  } catch (err) {
    console.error("Erreur suppression :", err);
    alert("Impossible de supprimer ce site.");
  }
}

const router = useRouter();
const { currentUser, logout } = useAuth();
const { openCreate, openEdit } = useSiteFormModal();

const search = ref("");
const regionFilter = ref("");
const regions = [
  "Littoral",
  "Centre",
  "Ouest",
  "Nord-Ouest",
  "Sud",
  "Est",
  "Adamaoua",
  "Extrême-Nord",
  "Sud-Ouest",
];

const filteredSites = computed(() =>
  sites.value.filter((s) => {
    const matchesSearch = s.name
      .toLowerCase()
      .includes(search.value.toLowerCase());
    const matchesRegion =
      !regionFilter.value || s.region === regionFilter.value;
    return matchesSearch && matchesRegion;
  }),
);

function handleLogout() {
  logout();
  router.push("/");
}

// NOTE : le double appel onMounted(loadSites) a été retiré (il était présent
// deux fois dans le fichier d'origine — le chargement se faisait donc deux fois).
onMounted(() => {
  loadSites();
});
</script>

<template>
  <div class="flex h-screen bg-mboa-belge dark:bg-gray-800 overflow-hidden">
    <!-- SIDEBAR -->
    <aside
      class="w-64 bg-mboa-green text-white flex flex-col shrink-0 h-screen overflow-y-auto"
    >
      <!-- Logo -->
      <div
        class="flex items-center gap-3 px-5 pt-6 pb-6 border-b border-white/10"
      >
        <div
          class="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-mboa-gold/40"
        >
          <img
            :src="logoMboa"
            alt="MboaTour Logo"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="leading-tight">
          <span class="font-bold text-white text-base block">MboaTour</span>
          <span class="text-[10px] text-mboa-gold font-bold tracking-wide">
            CULTURAL TOURISM APP
          </span>
        </div>
      </div>

      <nav class="px-3 py-4 space-y-1 text-sm flex-1">
        <router-link
          to="/admin"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 21h16.5M4.5 3h15M5.25 3v18M13.5 3v18M9 3v18M18.75 3v18"
            />
          </svg>
          Gestion des sites
        </router-link>

        <button
          type="button"
          disabled
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 w-full text-left cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 4.5h15M4.5 3h15a1.5 1.5 0 0 1 1.5 1.5v15a1.5 1.5 0 0 1-1.5 1.5h-15a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 4.5 3z"
            />
          </svg>
          Avis
          <span
            class="ml-auto text-[10px] bg-mboa-gold text-mboa-green px-1.5 py-0.5 rounded-full font-semibold"
          >
            V2
          </span>
        </button>

        <button
          type="button"
          disabled
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 w-full text-left cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-5 h-5"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
          Médias
          <span
            class="ml-auto text-[10px] bg-mboa-gold text-mboa-green px-1.5 py-0.5 rounded-full font-semibold"
          >
            V2
          </span>
        </button>

        <button
          type="button"
          disabled
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 w-full text-left cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a7.723 7.723 0 0 1 0 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
            />
          </svg>
          Paramètres
        </button>
      </nav>

      <div class="px-3 py-4 border-t border-white/10">
        <button
          @click="handleLogout"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/5 hover:text-white text-sm w-full transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
            />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>

    <!-- CONTENU -->
    <main class="flex-1 px-8 py-6 overflow-y-auto h-screen">
      <div
        class="flex items-center justify-between mb-6 pb-4 border-b border-black/5 dark:border-white/10"
      >
        <div>
          <h1
            class="text-2xl font-bold text-[#1B3D2A] dark:text-gray-100"
            style="font-family: &quot;Poppins&quot;, sans-serif"
          >
            Gestion des sites touristiques
          </h1>
          <div class="border-b-2 border-[#D4A017] inline-block w-12 mt-2"></div>
        </div>

        <!-- Carte profil -->
        <div
          class="flex items-center gap-3 bg-white border border-[#F5E9D6] rounded-2xl pl-4 pr-2 py-2 shadow-sm dark:bg-gray-900 dark:border-gray-700"
          style="font-family: &quot;Inter&quot;, sans-serif"
        >
          <div class="text-right leading-tight">
            <p class="text-sm font-semibold text-[#222222] dark:text-gray-100">
              {{ currentUser?.nom }}
            </p>
            <p class="text-xs font-medium text-[#C0392B] dark:text-red-400">
              Administrateur
            </p>
          </div>

          <div class="relative flex-shrink-0">
            <div
              class="w-11 h-11 rounded-full bg-[#1B3D2A]/10 border border-[#1B3D2A]/20 flex items-center justify-center overflow-hidden dark:bg-mboa-gold/10 dark:border-mboa-gold/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.8"
                stroke="currentColor"
                class="w-5 h-5 text-[#1B3D2A] dark:text-mboa-gold"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <span
              class="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-[#D4A017] ring-2 ring-white dark:ring-gray-900 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="white"
                class="w-2.5 h-2.5"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <!-- CARTES STATS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-3 dark:bg-gray-900 dark:border-gray-700"
        >
          <div
            class="w-12 h-12 rounded-xl bg-mboa-green flex items-center justify-center shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              fill="none"
              stroke="#F5E9D6"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-6 h-6"
            >
              <path d="M5 16 L24 6 L43 16" />
              <path d="M5 16 L43 16" />
              <path d="M8 20 L8 36" />
              <path d="M16 20 L16 36" />
              <path d="M32 20 L32 36" />
              <path d="M40 20 L40 36" />
              <path d="M4 40 L44 40" />
            </svg>
          </div>
          <div class="min-w-0">
            <p
              class="text-xs font-medium text-gray-500 dark:text-gray-400 truncate"
            >
              Nombre total de sites
            </p>
            <p
              class="text-2xl font-bold text-gray-800 leading-tight dark:text-gray-100"
            >
              {{ sites.length }}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 truncate">
              Tous les sites enregistrés
            </p>
          </div>
        </div>

        <div
          class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 dark:bg-gray-900 dark:border-gray-700"
        >
          <div
            class="w-12 h-12 rounded-xl bg-mboa-gold flex items-center justify-center shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-6 h-6"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12 L21 12" />
              <path
                d="M12 3 C14.5 5.5 15.5 8.5 15.5 12 C15.5 15.5 14.5 18.5 12 21 C9.5 18.5 8.5 15.5 8.5 12 C8.5 8.5 9.5 5.5 12 3 Z"
              />
            </svg>
          </div>
          <div class="min-w-0">
            <p
              class="text-xs font-medium text-gray-500 dark:text-gray-400 truncate"
            >
              Sites publiés
            </p>
            <p
              class="text-2xl font-bold text-gray-800 leading-tight dark:text-gray-100"
            >
              {{ publishedCount }}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 truncate">
              Visibles par les utilisateurs
            </p>
          </div>
        </div>

        <div
          class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 dark:bg-gray-900 dark:border-gray-700"
        >
          <div
            class="w-12 h-12 rounded-xl bg-gray-400 flex items-center justify-center shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-6 h-6"
            >
              <path d="M4 4h16v16H4z" />
              <path d="M4 9h16" />
            </svg>
          </div>
          <div class="min-w-0">
            <p
              class="text-xs font-medium text-gray-500 dark:text-gray-400 truncate"
            >
              Sites non publiés
            </p>
            <p
              class="text-2xl font-bold text-gray-800 leading-tight dark:text-gray-100"
            >
              {{ draftCount }}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 truncate">
              En attente de publication
            </p>
          </div>
        </div>

        <div
          class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 dark:bg-gray-900 dark:border-gray-700"
        >
          <div
            class="w-12 h-12 rounded-xl bg-mboa-cream flex items-center justify-center shrink-0 dark:bg-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-6 h-6 text-mboa-green dark:text-mboa-gold"
            >
              <path d="M3 17 L9 11 L13 15 L21 7" />
              <path d="M15 7 L21 7 L21 13" />
            </svg>
          </div>
          <div class="min-w-0">
            <p
              class="text-xs font-medium text-gray-500 dark:text-gray-400 truncate"
            >
              Vues totales
            </p>
            <p
              class="text-2xl font-bold text-gray-800 leading-tight dark:text-gray-100"
            >
              10
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 truncate">
              Sur tous les sites
            </p>
          </div>
        </div>
      </div>

      <!-- BARRE RECHERCHE + BOUTON AJOUTER -->
      <div
        class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 gap-3"
      >
        <div class="flex gap-3 flex-1">
          <div class="relative flex-1 max-w-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              stroke-width="2"
              class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.3 15.3 L21 21" />
            </svg>
            <input
              v-model="search"
              type="text"
              placeholder="Rechercher un site par nom..."
              class="border border-gray-200 shadow-sm rounded-lg pl-9 pr-3 py-2 bg-white text-sm w-full focus:outline-none focus:ring-2 focus:ring-mboa-green/30 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
            />
          </div>
          <select
            v-model="regionFilter"
            class="border border-gray-200 shadow-sm bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mboa-green/30 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
          >
            <option value="">Toutes les régions</option>
            <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
        <button
          @click="openCreate"
          class="bg-mboa-red text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 whitespace-nowrap transition-colors shrink-0"
        >
          + Ajouter un site
        </button>
      </div>

      <!-- TABLEAU -->
      <div
        class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-700"
      >
        <table class="w-full text-sm">
          <thead>
            <tr
              class="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200 bg-mboa-cream/60 dark:text-gray-400 dark:border-gray-700 dark:bg-gray-800"
            >
              <th class="px-4 py-3 font-medium">Image</th>
              <th class="px-4 py-3 font-medium">Nom du site</th>
              <th class="px-4 py-3 font-medium">Région</th>
              <th class="px-4 py-3 font-medium">Tarif</th>
              <th class="px-4 py-3 font-medium">Statut</th>
              <th class="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- ÉTAT : chargement (skeleton) -->
            <template v-if="loading">
              <tr
                v-for="n in 4"
                :key="n"
                class="border-b border-gray-100 last:border-0 dark:border-gray-800 animate-pulse"
              >
                <td class="px-4 py-3">
                  <div
                    class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700"
                  ></div>
                </td>
                <td class="px-4 py-3">
                  <div
                    class="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"
                  ></div>
                </td>
                <td class="px-4 py-3">
                  <div
                    class="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"
                  ></div>
                </td>
                <td class="px-4 py-3">
                  <div
                    class="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"
                  ></div>
                </td>
                <td class="px-4 py-3">
                  <div
                    class="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"
                  ></div>
                </td>
                <td class="px-4 py-3">
                  <div
                    class="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded"
                  ></div>
                </td>
              </tr>
            </template>

            <tr
              v-for="site in filteredSites"
              v-else
              :key="site.id"
              class="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/60 transition-colors"
            >
              <td class="px-4 py-3">
                <img
                  :src="site.image"
                  class="w-10 h-10 rounded-lg object-cover"
                  :alt="site.name"
                />
              </td>
              <td
                class="px-4 py-3 font-medium text-gray-800 dark:text-gray-200"
              >
                {{ site.name }}
              </td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400">
                {{ site.region }}
              </td>
              <td class="px-4 py-3 text-gray-500 dark:text-gray-400">
                {{ site.price }}
              </td>
              <td class="px-4 py-3">
                <span
                  :class="
                    site.status === 'Publié'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                  "
                  class="text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5 w-fit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 8 8"
                    fill="currentColor"
                    class="w-2 h-2 shrink-0"
                  >
                    <circle cx="4" cy="4" r="4" />
                  </svg>
                  {{ site.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-3">
                  <button
                    @click="openEdit(site)"
                    class="text-mboa-gold hover:opacity-70 transition-opacity"
                    aria-label="Modifier"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="w-4 h-4"
                    >
                      <path
                        d="M16.5 3.5 C17.3 2.7 18.6 2.7 19.4 3.5 L20.5 4.6 C21.3 5.4 21.3 6.7 20.5 7.5 L8 20 L3 21 L4 16 Z"
                      />
                      <path d="M15 5 L19 9" />
                    </svg>
                  </button>
                  <button
                    @click="handleDelete(site.id)"
                    class="text-mboa-red hover:opacity-70 transition-opacity"
                    aria-label="Supprimer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="w-4 h-4"
                    >
                      <path d="M4 7 L20 7" />
                      <path
                        d="M9 7 L9 4.5 C9 3.7 9.7 3 10.5 3 L13.5 3 C14.3 3 15 3.7 15 4.5 L15 7"
                      />
                      <path
                        d="M6 7 L6.8 20 C6.85 20.8 7.5 21.4 8.3 21.4 L15.7 21.4 C16.5 21.4 17.15 20.8 17.2 20 L18 7"
                      />
                      <path d="M10 11 L10 17" />
                      <path d="M14 11 L14 17" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <p
          v-if="error"
          class="text-center text-mboa-red py-6 text-sm bg-mboa-red/5"
        >
          {{ error }}
        </p>

        <div
          v-if="!loading && !error && filteredSites.length === 0"
          class="text-center text-gray-400 py-12 text-sm dark:text-gray-500"
        >
          <p class="font-medium">Aucun site trouvé.</p>
          <p class="text-xs mt-1">
            Essayez de modifier votre recherche ou vos filtres.
          </p>
        </div>
      </div>
    </main>

    <SiteFormModal />
  </div>
</template>
