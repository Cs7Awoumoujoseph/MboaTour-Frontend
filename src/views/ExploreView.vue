<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import heroLandscape from "../assets/hero-landscape.svg";
import { siteApi } from "../api/siteApi";
import type { Destination } from "../types/index";
import { categorieApi } from "../api/categorieApi";
import { regionApi } from "../api/regionApi";
import type { Category } from "../types/index";
import { useFavorites } from "../composables/useFavorites";
import { useAuth } from "../composables/useAuth";

const { isFavorite, toggleFavorite } = useFavorites();
const { isLoggedIn } = useAuth();

const sites = ref<Destination[]>([]);

const loading = ref(false);
const error = ref("");

const search = ref("");

const selectedRegion = ref("Toutes les régions");
const selectedCategories = ref<string[]>([]);

const sortBy = ref("popularite");

const currentPage = ref(1);
const totalPages = ref(1);
const totalElements = ref(0);

// Nombre d'éléments par page : 10 (demande explicite)
const PAGE_SIZE = 10;

const regions = ref<string[]>([]);
const categories = ref<Category[]>([]);

// ======================================================
// URL IMAGE
// ======================================================

const getImageUrl = (imageId?: number) => {
  if (!imageId) {
    return "/src/assets/image/placeholder.jpg";
  }

  return `http://localhost:8080/mboa/img/${imageId}/view`;
};

// ======================================================
// CHARGEMENT DES SITES
// ======================================================

const loadSites = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await siteApi.search({
      motCle: search.value || undefined,

      region:
        selectedRegion.value !== "Toutes les régions"
          ? selectedRegion.value
          : undefined,

      categorie:
        selectedCategories.value.length > 0
          ? selectedCategories.value[0]
          : undefined,

      page: currentPage.value - 1,
      size: PAGE_SIZE,

      tri:
        sortBy.value === "note"
          ? "MOYENNE"
          : sortBy.value === "nom"
            ? "NOM"
            : "POPULARITE",

      asc: sortBy.value === "nom",
    });

    sites.value = response.data.content ?? [];

    totalPages.value = response.data.totalPages ?? 1;

    totalElements.value =
      response.data.page?.totalElements ?? sites.value.length;

    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = 1;
      await loadSites();
    }
  } catch (err) {
    console.error("Erreur lors du chargement des sites :", err);
    error.value = "Impossible de charger les sites touristiques.";
  } finally {
    loading.value = false;
  }
};

// ======================================================
// NORMALISATION DES DONNÉES
// ======================================================

const normalizedSites = computed<Destination[]>(() => {
  return sites.value.map((site: any) => ({
    id: site.id,
    name: site.name ?? site.nom ?? "Site touristique",
    category: site.category ?? site.categorie ?? "Autre",
    region: site.location ?? "Région inconnue",
    description:
      site.description ??
      site.phraseAccroche ??
      "Découvrez ce site touristique du Cameroun.",
    imageId: site.imageId ?? site.idImage ?? site.image?.idImage,
    image: site.image ?? site.imageUrl,
    rating: site.rating ?? site.moyenneAvis ?? 0,
    reviews: site.reviews ?? Array(site.nbreAvis ?? 0).fill(null),
  }));
});

const filteredSites = computed(() => normalizedSites.value);

const sortedSites = computed(() => {
  const result = [...filteredSites.value];

  if (sortBy.value === "nom") {
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortBy.value === "note") {
    return result.sort((a, b) => b.rating - a.rating);
  }

  return result;
});

const paginatedSites = computed(() => sortedSites.value);

const categoryColor = (category: string) => {
  switch (category) {
    // 🌿 Nature
    case "Nature":
      return "bg-emerald-600";

    // 💧 Eau / cascades
    case "Cascades et chutes":
      return "bg-sky-600";

    // 🥾 Randonnée / aventure
    case "Sites de randonnee":
      return "bg-orange-600";

    // 🌳 Protection de l'environnement
    case "Zones protegees":
    case "Zones protegees ":
      return "bg-teal-600";

    // 🏖️ Plages / tourisme balnéaire
    case "Sites balneaires":
      return "bg-cyan-600";

    // 🏛️ Culture / patrimoine
    case "Patrimoine culturel":
      return "bg-amber-600";

    // 🗿 Monuments
    case "Monuments":
      return "bg-rose-600";

    // 📍 Autres
    default:
      return "bg-slate-600";
  }
};

const loadCategories = async () => {
  try {
    const response = await categorieApi.getAll();
    const embedded = response.data?._embedded;
    if (!embedded) return;

    const data = Object.values(embedded).find((value) =>
      Array.isArray(value),
    ) as any[] | undefined;
    if (!data) return;

    categories.value = data.map((cat: any) => ({
      name: cat.nom ?? cat.name ?? cat.libelle ?? "Catégorie",
      icon: cat.icon ?? "",
    }));
  } catch (err) {
    console.error("Erreur chargement catégories :", err);
  }
};

const loadRegions = async () => {
  try {
    const response = await regionApi.getAll();
    const embedded = response.data?._embedded;
    if (!embedded) return;

    const data = Object.values(embedded).find((value) =>
      Array.isArray(value),
    ) as any[] | undefined;
    if (!data) return;

    regions.value = data
      .map((region: any) =>
        typeof region === "string"
          ? region
          : (region.nom ?? region.name ?? region.libelle),
      )
      .filter(Boolean);
  } catch (err) {
    console.error("Erreur chargement régions :", err);
  }
};

const resetFilters = () => {
  search.value = "";
  selectedRegion.value = "Toutes les régions";
  selectedCategories.value = [];
  sortBy.value = "popularite";
  currentPage.value = 1;
  loadSites();
};

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) {
    return;
  }
  currentPage.value = page;
  loadSites();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const previousPage = () => {
  if (currentPage.value > 1) changePage(currentPage.value - 1);
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) changePage(currentPage.value + 1);
};

watch(
  [search, selectedRegion, selectedCategories, sortBy],
  () => {
    currentPage.value = 1;
    loadSites();
  },
  { deep: true },
);

onMounted(() => {
  loadSites();
  loadCategories();
  loadRegions();
});
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="relative">
      <div
        class="absolute inset-0 bg-gradient-to-r from-mboa-green/40 via-black/20 to-transparent"
      ></div>
      <img
         :src="heroLandscape"
        alt="Sites touristiques du Cameroun"
        class="w-full h-[280px] object-cover"
      />
      <div
        class="absolute inset-0 flex flex-col justify-between px-6 md:px-16 py-8"
      >
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-white">
            Explorer les <span class="text-mboa-gold">sites touristiques</span>
          </h1>
          <p class="text-white/90 text-sm mt-1">
            Découvrez la richesse culturelle, historique et naturelle du
            Cameroun.
          </p>
        </div>
      </div>
    </section>

    <!-- BARRE RECHERCHE + TRI — STICKY -->
    <div class="sticky top-0 z-30 -mt-7 relative">
      <div class="max-w-7xl mx-auto px-6">
        <div
          class="bg-mboa-belge/95 backdrop-blur-md rounded-xl shadow-lg ring-1 ring-black/5 p-3 flex flex-col sm:flex-row gap-3 items-center transition-shadow dark:bg-gray-800/95"
        >
          <div
            class="flex items-center flex-1 border bg-white rounded-lg px-3 py-2 gap-2 w-full dark:bg-gray-900 focus-within:ring-2 focus-within:ring-mboa-green/40 transition-shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              stroke-width="2"
              class="w-5 h-5 shrink-0"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.3 15.3 L21 21" />
            </svg>
            <input
              v-model="search"
              type="text"
              placeholder="Rechercher un site touristique, une ville, une région..."
              class="flex-1 text-sm focus:outline-none bg-transparent dark:text-gray-200 dark:placeholder:text-gray-500"
            />
            <button
              v-if="search"
              @click="search = ''"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          </div>

          <select
            v-model="sortBy"
            class="border bg-white rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-mboa-green/40 dark:bg-gray-900 dark:text-gray-400"
          >
            <option value="popularite">Trier par : Popularité</option>
            <option value="note">Trier par : Note</option>
            <option value="nom">Trier par : Nom (A-Z)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- CONTENU PRINCIPAL -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex flex-col md:flex-row gap-8 items-start">
        <!-- FILTRES — STICKY, colonne gauche -->
        <aside
          class="w-full md:w-64 shrink-0 md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:overflow-y-auto md:pr-1"
        >
          <div
            class="bg-white dark:bg-gray-900 rounded-xl shadow-sm ring-1 ring-black/5 p-4"
          >
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-bold text-green-800 dark:text-mboa-gold">
                Filtres
              </h2>
              <span
                v-if="
                  selectedRegion !== 'Toutes les régions' ||
                  selectedCategories.length
                "
                class="text-xs text-mboa-red font-medium"
              >
                actifs
              </span>
            </div>

            <div class="mb-6">
              <h3
                class="text-sm font-semibold text-gray-800 mb-3 dark:text-gray-200"
              >
                Région
              </h3>
              <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <label
                  class="flex items-center gap-2 cursor-pointer hover:text-mboa-green dark:hover:text-mboa-gold transition-colors"
                >
                  <input
                    type="radio"
                    value="Toutes les régions"
                    v-model="selectedRegion"
                  />
                  Toutes les régions
                </label>
                <label
                  v-for="region in regions"
                  :key="region"
                  class="flex items-center gap-2 cursor-pointer hover:text-mboa-green dark:hover:text-mboa-gold transition-colors"
                >
                  <input
                    type="radio"
                    :value="region"
                    v-model="selectedRegion"
                  />
                  {{ region }}
                </label>
              </div>
            </div>

            <div class="mb-6">
              <h3
                class="text-sm font-semibold text-gray-800 mb-3 dark:text-gray-200"
              >
                Catégorie
              </h3>
              <div class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <label
                  v-for="cat in categories"
                  :key="cat.name"
                  class="flex items-center gap-2 cursor-pointer hover:text-mboa-green dark:hover:text-mboa-gold transition-colors"
                >
                  <input
                    type="checkbox"
                    :value="cat.name"
                    v-model="selectedCategories"
                  />
                  <span class="w-4 h-4" v-html="cat.icon"></span>
                  {{ cat.name }}
                </label>
              </div>
            </div>

            <button
              @click="resetFilters"
              class="w-full border rounded-lg py-2 text-sm bg-mboa-red text-white hover:bg-red-700 transition-colors font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </aside>

        <!-- RESULTATS — colonne droite -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Affichage de
              <span class="font-semibold text-gray-700 dark:text-gray-300">{{
                paginatedSites.length
              }}</span>
              sur
              <span class="font-semibold text-gray-700 dark:text-gray-300">{{
                totalElements
              }}</span>
              résultats
            </p>
          </div>

          <!-- ÉTAT : chargement (skeleton) -->
          <div
            v-if="loading"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div
              v-for="n in 6"
              :key="n"
              class="rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-900 animate-pulse"
            >
              <div class="w-full h-40 bg-gray-200 dark:bg-gray-700"></div>
              <div class="p-4 space-y-3">
                <div
                  class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"
                ></div>
                <div
                  class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"
                ></div>
                <div
                  class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"
                ></div>
                <div
                  class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"
                ></div>
              </div>
            </div>
          </div>

          <!-- ÉTAT : erreur -->
          <div
            v-else-if="error"
            class="text-center text-red-500 py-12 bg-red-50 dark:bg-red-950/20 rounded-xl"
          >
            {{ error }}
          </div>

          <template v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="site in paginatedSites"
                :key="site.id"
                class="group rounded-xl overflow-hidden shadow-sm hover:shadow-xl bg-white min-w-0 dark:bg-gray-900 transition-all duration-300 hover:-translate-y-1 ring-1 ring-black/5"
              >
                <div class="relative overflow-hidden">
                  <img
                    :src="getImageUrl(site.imageId)"
                    :alt="site.name"
                    class="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  ></div>
                  <span
                    :class="categoryColor(site.category)"
                    class="absolute top-2 left-2 text-white text-[11px] font-medium px-2 py-1 rounded shadow-sm"
                  >
                    {{ site.category }}
                  </span>
                  <button
                    :disabled="!isLoggedIn"
                    @click="toggleFavorite(site.id)"
                    class="disabled:opacity-50 disabled:cursor-not-allowed absolute top-2 right-2 bg-white/90 dark:bg-gray-900/80 rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      :fill="isFavorite(site.id) ? '#C0392B' : 'none'"
                      stroke="#C0392B"
                      stroke-width="2"
                      class="w-4 h-4"
                    >
                      <path
                        d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1.2 4.5 2.7C12 6.2 13.5 5 15.5 5 19 5 21.5 8.5 19.5 12.5 17 16.65 12 21 12 21z"
                      />
                    </svg>
                  </button>
                </div>

                <div class="p-4">
                  <h3
                    class="font-semibold text-mboa-green dark:text-mboa-gold group-hover:underline decoration-2 underline-offset-2"
                  >
                    {{ site.name }}
                  </h3>
                  <p
                    class="text-xs text-gray-500 flex items-center gap-1 mb-2 mt-1 dark:text-gray-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D4A017"
                      stroke-width="1.8"
                      width="16"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path
                        d="M12 21 C12 21 19 14.5 19 9.5 C19 5.4 15.9 2.5 12 2.5 C8.1 2.5 5 5.4 5 9.5 C5 14.5 12 21 12 21 Z"
                      />
                      <circle cx="12" cy="9.5" r="2.8" />
                    </svg>
                    {{ site.region }}
                  </p>
                  <p
                    class="text-sm text-gray-600 mb-3 break-words line-clamp-3 dark:text-gray-400"
                  >
                    {{ site.description }}
                  </p>
                  <div
                    class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800"
                  >
                    <span
                      class="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"
                    >
                      <span class="text-mboa-gold">★</span> {{ site.rating }}
                      <span class="text-gray-400"
                        >({{ site.reviews.length }} avis)</span
                      >
                    </span>
                    <router-link
                      :to="`/site/${site.id}`"
                      class="bg-mboa-red text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Voir la fiche
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="paginatedSites.length === 0"
              class="text-center text-gray-400 py-16 dark:text-gray-500 bg-gray-50 dark:bg-gray-900/40 rounded-xl"
            >
              <p class="font-medium">
                Aucun site ne correspond à ces critères.
              </p>
              <button
                @click="resetFilters"
                class="mt-3 text-sm text-mboa-green dark:text-mboa-gold underline"
              >
                Réinitialiser les filtres
              </button>
            </div>

            <!-- PAGINATION -->
            <div
              v-if="totalPages > 1"
              class="flex items-center justify-center gap-2 mt-10"
            >
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="px-3 h-9 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
              >
                Précédent
              </button>

              <button
                v-for="page in totalPages"
                :key="page"
                @click="changePage(page)"
                :class="
                  currentPage === page
                    ? 'bg-mboa-green text-white shadow-sm'
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-800'
                "
                class="w-9 h-9 rounded-lg text-sm font-medium border transition-colors"
              >
                {{ page }}
              </button>

              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 h-9 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
              >
                Suivant
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
