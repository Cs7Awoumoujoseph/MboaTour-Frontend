<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { siteApi } from "../api/siteApi";
import { useAuth } from "../composables/useAuth";
import { useUserMedia } from "../composables/useUserMedia";
import { useFavorites } from "../composables/useFavorites";
import { useReviews } from "../composables/useReviews";
const { addReview, getReviewsForSite, hasUserReviewed, setReviewsForSite } =
  useReviews();

// ---------------------------------------------------------------------------
// Sources de données
// ---------------------------------------------------------------------------
// `siten`        -> vient du backend (siteApi.getDetails) : infos du site
// `userComment`  -> vient du backend (siteApi.getComment) : avis déjà en base
// `siteSimilar`  -> vient du backend (siteApi.search)      : sites similaires
//
// Favoris, upload photos/vidéos et nouveaux avis restent en LOCAL (mock) via
// useFavorites / useUserMedia / useReviews, en attendant que ces endpoints
// existent côté backend. Dès qu'ils existeront, il suffira de remplacer les
// appels de ces composables par des appels siteApi.xxx().
// ---------------------------------------------------------------------------

const route = useRoute();
const { isFavorite, toggleFavorite } = useFavorites();
const userMedia = useUserMedia();
const { isLoggedIn, currentUser } = useAuth();

const siten = ref(null);
const siteSimilar = ref([]);
const userComment = ref([]);
const error = ref("");
const error1 = ref("");
const mainImage = ref("");

const mediaTab = ref("photos");
const mediaInput = ref(null);

const selectedRating = ref(0);
const reviewText = ref("");
const reviewError = ref("");

// ---------------------------------------------------------------------------
// Chargement des données API
// ---------------------------------------------------------------------------

const loadSiteDetails = async () => {
  const id = Number(route.params.id);
  try {
    const response = await siteApi.getDetails(id);
    siten.value = response.data;
    error.value = "";
  } catch (err) {
    console.error("Erreur chargement du site :", err);
    error.value = "Impossible de charger cette destination.";
    siten.value = null;
  }
};

const loadComments = async () => {
  const id = Number(route.params.id);
  try {
    const response = await siteApi.getAllComments(id);
    userComment.value = response.data || [];
    setReviewsForSite(id, userComment.value);
  } catch (err) {
    console.error("Erreur chargement des commentaires :", err);
    userComment.value = [];
  }
};

const loadSimilarSites = async () => {
  try {
    const response = await siteApi.search({
      page: 0,
      size: 4, // on demande 4 pour pouvoir exclure le site courant et garder 3
      tri: "MOYENNE",
      categorie: siten.value?.category,
    });
    const content = response?.data?.content || [];
    siteSimilar.value = content
      .filter((s) => s.id !== siten.value?.id)
      .slice(0, 3);
    error1.value = "";
  } catch (err) {
    console.error("Erreur chargement des sites similaires :", err);
    error1.value = "Impossible de charger les sites similaires.";
    siteSimilar.value = [];
  }
};

const loadAll = async () => {
  // remonte en haut de la page (utile quand on arrive via "sites similaires",
  // sinon on reste scrollé en bas de l'ancienne page)
  window.scrollTo({ top: 0, behavior: "smooth" });

  // reset de l'état "avis en cours de saisie" quand on change de site
  selectedRating.value = 0;
  reviewText.value = "";
  reviewError.value = "";
  mediaTab.value = "photos";

  await loadSiteDetails();
  // ces deux appels dépendent de siten (id / catégorie), on les lance après
  loadComments();
  loadSimilarSites();
};

// Vue Router réutilise le même composant quand seul le paramètre `id` change
// (ex: clic sur un site similaire) -> onMounted ne se redéclenche pas.
// On surveille donc directement l'id de la route pour recharger les données.
watch(
  () => route.params.id,
  () => {
    loadAll();
  },
  { immediate: true },
);

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

const getImagUrl = (imagId) => {
  if (!imagId) return "/src/assets/image/placeholder.jpg";
  return `http://localhost:8080/mboa/img/${imagId}/view`;
};

watch(
  siten,
  (newSite) => {
    if (newSite?.images?.length) {
      const mainImg = newSite.images.find((img) => img.principal) ?? newSite.images[0];
      mainImage.value = getImagUrl(mainImg.idImage);
    } else {
      mainImage.value = "/src/assets/image/placeholder.jpg";
    }
  },
  { immediate: true },
);

// ---------------------------------------------------------------------------
// Avis (backend + local, combinés pour un retour immédiat après publication)
// ---------------------------------------------------------------------------

// Normalise un avis venant du backend (nom, note, dateComment, comment)
// vers le même format qu'un avis local (authorName, rating, date, comment)
const normalizedApiReviews = computed(() =>
  userComment.value.map((c) => ({
    id: `api-${c.id ?? c.dateComment}-${c.nom}`,
    authorName: c.nom,
    rating: c.note,
    date: c.dateComment,
    comment: c.comment,
  })),
);

const localReviews = computed(() =>
  siten.value ? getReviewsForSite(siten.value.id) : [],
);

const allReviewsForSite = computed(() =>
  siten.value ? getReviewsForSite(siten.value.id) : []
);

const alreadyReviewed = computed(() =>
  isLoggedIn.value && currentUser.value && siten.value
    ? hasUserReviewed(siten.value.id, currentUser.value.id)
    : false,
);

const computedRating = computed(() => {
  if (allReviewsForSite.value.length === 0) return 0;
  const total = allReviewsForSite.value.reduce((sum, r) => sum + r.rating, 0);
  return Math.round((total / allReviewsForSite.value.length) * 10) / 10;
});

const computedBreakdown = computed(() =>
  [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: allReviewsForSite.value.filter((r) => r.rating === stars).length,
  })),
);

const maxBarCount = computed(() =>
  Math.max(1, ...computedBreakdown.value.map((b) => b.count)),
);

async function handleReviewSubmit() {
  reviewError.value = "";
  if (
    !isLoggedIn.value ||
    selectedRating.value === 0 ||
    !reviewText.value.trim()
  )
    return;
  if (alreadyReviewed.value) {
    reviewError.value = "Vous avez déjà publié un avis pour ce site.";
    return;
  }

  const result = await addReview(
    siten.value.id,
    currentUser.value.id,
    currentUser.value.nom,
    selectedRating.value,
    reviewText.value,
  );

  if (!result.ok) {
    reviewError.value = result.error;
    return;
  }

  selectedRating.value = 0;
  reviewText.value = "";
}

watch(isLoggedIn, (loggedIn) => {
  if (!loggedIn) {
    selectedRating.value = 0;
    reviewText.value = "";
    reviewError.value = "";
  }
});

// ---------------------------------------------------------------------------
// Médias (photos / vidéos) - local pour l'instant
// ---------------------------------------------------------------------------

const filteredMedia = computed(() => {
  if (!siten.value) return [];
  const targetType = mediaTab.value === "photos" ? "photo" : "video";
  return userMedia
    .getMediaForSite(siten.value.id)
    .filter((m) => m.type === targetType);
});

function handleMediaUpload(event) {
  const files = Array.from(event.target.files || []);
  const type = mediaTab.value === "photos" ? "photo" : "video";

  files.forEach((file) => {
    const url = URL.createObjectURL(file);
    userMedia.addMedia(
      siten.value.id,
      url,
      type,
      currentUser.value.id,
      currentUser.value.nom,
    );
  });

  event.target.value = "";
}

function canDeleteMedia(item) {
  if (!isLoggedIn.value || !currentUser.value) return false;
  const isOwner = item.authorId === currentUser.value.id;
  const isAdmin = currentUser.value.role === "admin";
  return isOwner || isAdmin;
}

// ---------------------------------------------------------------------------
// Itinéraire
// ---------------------------------------------------------------------------

function handleItinerary() {
  const query = encodeURIComponent(
    `${siten.value.name},${siten.value.location}`,
  );
  window.open(`https://www.google.com/maps/search/${query}`, "_blank");
}
</script>

<template>
  <div v-if="siten" class="max-w-7xl mx-auto px-6 py-6">
    <!-- Fil d'ariane -->
    <nav class="text-sm text-gray-500 flex items-center gap-2 mb-4 dark:text-gray-400">
      <router-link to="/" class="hover:underline">Accueil</router-link>
      <span>›</span>
      <router-link to="/explorer" class="hover:underline">explorer</router-link>
      <span>›</span>
      <span class="text-mboa-green font-medium dark:text-mboa-gold">{{ siten.name }}</span>
    </nav>

    <!-- LIGNE 1 : Galerie + Infos pratiques -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Galerie -->
      <div class="lg:col-span-2">
        <div class="relative rounded-xl overflow-hidden mb-3">
          <img
            :src="mainImage"
            :alt="siten.name"
            class="w-full h-80 object-cover"
          />

          <button
            :disabled="!isLoggedIn"
            @click="toggleFavorite(siten.id)"
            class="disabled:opacity-50 disabled:cursor-not-allowed absolute top-2 right-2 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              :fill="isFavorite(siten.id) ? '#C0392B' : 'none'"
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
        <!--miniature-->
        <div class="flex gap-3">
          <img
            v-for="image in siten.images"
            :key="image.idImage"
            :src="getImagUrl(image.idImage)"
            @click="mainImage = getImagUrl(image.idImage)"
            class="w-24 h-16 object-cover rounded-lg cursor-pointer border-2"
            :class="
              mainImage === getImagUrl(image.idImage)
                ? 'border-mboa-gold'
                : 'border-transparent'
            "
          />
        </div>
      </div>

      <!-- Carte infos pratiques -->
      <div class="border border-gray-200 rounded-xl shadow-sm p-5 bg-[#faf9f5] dark:bg-gray-800 dark:border-gray-700">
        <h1 class="text-2xl font-bold text-mboa-green mb-1 dark:text-mboa-gold">
          {{ siten.name }}
        </h1>
        <p class="text-xs text-gray-500 mb-2 flex items-center gap-1 dark:text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D4A017"
            stroke-width="1.8"
            width="22"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M12 21 C12 21 19 14.5 19 9.5 C19 5.4 15.9 2.5 12 2.5 C8.1 2.5 5 5.4 5 9.5 C5 14.5 12 21 12 21 Z"
            />
            <circle cx="12" cy="9.5" r="2.8" />
          </svg>
          {{ siten.location }}
        </p>
        <p class="text-sm text-mboa-gold font-medium mb-4">
          {{ "★".repeat(Math.round(computedRating)) }} ({{
            allReviewsForSite.length
          }}
          avis)
        </p>

        <div
          class="grid grid-cols-4 text-center text-xs mb-5 border-t border-gray-200 py-4 divide-x divide-gray-200 dark:border-gray-700 dark:divide-gray-700"
        >
          <div class="flex flex-col items-center gap-1 px-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.8"
              stroke="#d8a72c"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.5 6.75h-9A2.25 2.25 0 0 0 5.25 9v.75a2.25 2.25 0 0 1 0 4.5V15A2.25 2.25 0 0 0 7.5 17.25h9A2.25 2.25 0 0 0 18.75 15v-.75a2.25 2.25 0 0 1 0-4.5V9a2.25 2.25 0 0 0-2.25-2.25Z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 6.75v10.5"
                stroke-dasharray="2 2"
              />
            </svg>
            <p class="text-gray-400 dark:text-gray-500">Tarif d'entrée</p>
            <p class="font-semibold text-gray-800 dark:text-gray-200">{{ siten.tarif }}</p>
            <p class="text-gray-400 dark:text-gray-500">Par personne</p>
          </div>

          <div class="flex flex-col items-center gap-1 px-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D4A017"
              stroke-width="1.8"
              class="w-6 h-6"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7 L12 12 L16 14" />
            </svg>
            <p class="text-gray-400 dark:text-gray-500">Horaires</p>
            <p class="font-semibold text-gray-800 dark:text-gray-200">{{ siten.horaires }}</p>
            <p class="text-gray-400 dark:text-gray-500">Lun - Dim</p>
          </div>

          <div class="flex flex-col items-center gap-1 px-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D4A017"
              stroke-width="1.8"
              class="w-6 h-6"
            >
              <path d="M20.6 12 L12 20.6 L3.4 12 L3.4 3.4 L12 3.4 Z" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="#D4A017" stroke="none" />
            </svg>
            <p class="text-gray-400 dark:text-gray-500">Catégorie</p>
            <p class="font-semibold text-gray-800 dark:text-gray-200">{{ siten.category }}</p>
          </div>

          <div class="flex flex-col items-center gap-1 px-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D4A017"
              stroke-width="1.8"
              class="w-6 h-6"
            >
              <circle cx="8" cy="9" r="2.5" />
              <circle cx="16" cy="9" r="2.5" />
              <path
                d="M3 19 C3 15.5 5.5 13.5 8 13.5 C10.5 13.5 13 15.5 13 19"
              />
              <path
                d="M13 19 C13 15.5 15.5 13.5 18 13.5 C20.5 13.5 21 15 21 17.5"
              />
            </svg>
            <p class="text-gray-400 dark:text-gray-500">Idéal pour</p>
            <p class="font-semibold text-gray-800 dark:text-gray-200">Grande Visite</p>
          </div>
        </div>

        <button
          :disabled="!isLoggedIn"
          @click="handleItinerary"
          class="w-full bg-mboa-red text-white font-medium py-3 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.8"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 19c2.5-2.5 4-4.5 4-7a4 4 0 1 1 8 0c0 2.5 1.5 4.5 4 7"
            />
            <circle cx="4" cy="19" r="1.5" fill="currentColor" />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16 5.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <circle cx="13" cy="5.5" r="1" fill="currentColor" />
          </svg>
          Voir l'itinéraire
        </button>
        <p
          v-if="!isLoggedIn"
          class="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-2 dark:text-gray-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            <circle cx="12" cy="15.5" r="1" />
            <path d="M12 16.5v2" />
          </svg>
          Connexion requise pour accéder à l'itinéraire
        </p>
      </div>
    </div>

    <!-- LIGNE 2 : À propos + Avis -->
    <div class="grid grid-cols-1 lg:grid-cols-2 bg-mboa-belge gap-6 mb-8 dark:bg-gray-800">
      <!-- À propos -->
      <div
        class="rounded-xl p-5 border border-gray-200 shadow-sm min-w-0 bg-[#faf9f5] dark:bg-gray-800 dark:border-gray-700"
      >
        <h2 class="text-lg font-bold text-mboa-green dark:text-mboa-gold">À propos du site</h2>
        <div class="border-b-2 border-mboa-gold incline-block w-12 mb-3"></div>
        <p class="text-gray-600 text-sm leading-relaxed mb-5 break-words dark:text-gray-400">
          {{ siten.description }}
        </p>

        <div
          class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-gray-600 pt-4 dark:text-gray-400"
        >
          <div class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-6 h-6 shrink-0 text-mboa-green dark:text-mboa-gold"
            >
              <path
                d="M24 4 L42 11 L42 23 C42 34 34 42 24 45 C14 42 6 34 6 23 L6 11 Z"
              />
              <path d="M16 24 L21 29 L32 18" stroke="#D4A017" />
            </svg>
            <div>
              <p class="font-medium text-gray-800 dark:text-gray-200">Patrimoine protégé</p>
              <p class="text-gray-400 dark:text-gray-500">Monument historique</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-6 h-6 shrink-0 text-mboa-green dark:text-mboa-gold"
            >
              <path
                d="M4 8 L8 8 L9.5 5.5 L14.5 5.5 L16 8 L20 8 C20.55 8 21 8.45 21 9 L21 18 C21 18.55 20.55 19 20 19 L4 19 C3.45 19 3 18.55 3 18 L3 9 C3 8.45 3.45 8 4 8 Z"
              />
              <circle cx="12" cy="13.5" r="3.5" />
            </svg>
            <div>
              <p class="font-medium text-gray-800 dark:text-gray-200">Photos autorisées</p>
              <p class="text-gray-400 dark:text-gray-500">Sans flash</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-6 h-6 shrink-0 text-mboa-green dark:text-mboa-gold"
            >
              <circle cx="8" cy="8" r="2.5" />
              <circle cx="16" cy="8" r="2.5" />
              <path d="M2.5 19 C2.5 15 5 13 8 13 C11 13 13.5 15 13.5 19" />
              <path
                d="M13.5 19 C13.5 15 16 13 18.5 13 C21 13 21.5 15.5 21.5 18"
              />
            </svg>
            <div>
              <p class="font-medium text-gray-800 dark:text-gray-200">Visite guidée</p>
              <p class="text-gray-400 dark:text-gray-500">Disponible</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-6 h-6 shrink-0 text-mboa-green dark:text-mboa-gold"
            >
              <rect x="3.5" y="5" width="17" height="15" rx="2" />
              <path d="M3.5 9.5 L20.5 9.5" />
              <path d="M8 3 L8 6.5" />
              <path d="M16 3 L16 6.5" />
            </svg>
            <div>
              <p class="font-medium text-gray-800 dark:text-gray-200">Meilleure période</p>
              <p class="text-gray-400 dark:text-gray-500">Tout le temps</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Avis et notes -->
      <div>
        <div
          class="rounded-xl p-5 mb-4 border min-w-0 border-gray-200 shadow-sm bg-[#faf9f5] dark:bg-gray-800 dark:border-gray-700"
        >
          <h2 class="text-lg font-bold text-mboa-green dark:text-mboa-gold">Avis et notes</h2>
          <div
            class="border-b-2 border-mboa-gold incline-block w-12 mb-3"
          ></div>
          <div class="grid grid-cols-2 gap-4">
            <div class="border-r border-gray-200 dark:border-gray-700">
              <p class="text-3xl font-bold text-mboa-green dark:text-mboa-gold">
                {{ computedRating }}/5
              </p>
              <p class="text-mboa-gold text-sm mb-2">
                {{ "★".repeat(Math.round(computedRating)) }}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500">
                Basé sur {{ allReviewsForSite.length }} avis
              </p>

              <div class="mt-3 space-y-1">
                <div
                  v-for="bar in computedBreakdown"
                  :key="bar.stars"
                  class="flex items-center gap-2 text-xs"
                >
                  <span class="w-6 text-gray-500 dark:text-gray-400">{{ bar.stars }}★</span>
                  <div class="flex-1 bg-gray-100 rounded-full h-1.5 dark:bg-gray-700">
                    <div
                      class="bg-mboa-gold h-1.5 rounded-full"
                      :style="{ width: (bar.count / maxBarCount) * 100 + '%' }"
                    ></div>
                  </div>
                  <span class="w-4 text-gray-400 dark:text-gray-500">{{ bar.count }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-3 max-h-52 overflow-y-auto pr-1">
              <div
                v-for="review in allReviewsForSite"
                :key="review.id"
                class="text-sm"
              >
                <div class="flex items-center gap-2">
                  <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      class="w-6 h-6 text-gray-400 dark:text-gray-500"
                    >
                      <circle cx="12" cy="8" r="3.5" fill="currentColor" />
                      <path
                        d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-gray-800 dark:text-gray-200">{{
                          review.authorName
                        }}</span>
                        <span class="text-mboa-gold text-sm">{{
                          "★".repeat(review.rating)
                        }}</span>
                        <span class="text-sm text-gray-600 font-semibold dark:text-gray-400"
                          >{{ review.rating }}/5</span
                        >
                        <span class="text-[10px] text-gray-300 dark:text-gray-600">{{
                          review.date
                        }}</span>
                      </div>
                    </div>
                    <p
                      class="text-xs text-gray-500 dark:text-gray-400"
                      style="word-break: break-word"
                    >
                      {{ review.comment }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Laisser un avis -->
        <div
          class="border border-gray-200 shadow-sm p-5 bg-[#faf9f5] dark:bg-gray-800 rounded-xl dark:border-gray-700"
        >
          <h3 class="font-bold text-mboa-green text-lg dark:text-mboa-gold">Laisser un avis</h3>
          <div
            class="border-b-2 border-mboa-gold incline-block w-12 mb-3"
          ></div>
          <p class="text-sm text-gray-500 font-bold mb-2 dark:text-gray-400">Votre note</p>
          <div class="flex gap-1 mb-3">
            <button
              v-for="n in 5"
              :key="n"
              @click="isLoggedIn && (selectedRating = n)"
              class="text-xl"
              :class="n <= selectedRating ? 'text-mboa-gold' : 'text-gray-300 dark:text-gray-600'"
            >
              ★
            </button>
          </div>
          <textarea
            v-model="reviewText"
            :disabled="!isLoggedIn || alreadyReviewed"
            placeholder="Partagez votre expérience..."
            class="w-full border border-gray-200 rounded-xl p-3 placeholder:text-gray-400 text-sm bg-gray-100 text-gray-800 mb-3 disabled:opacity-50 resize-none disabled:cursor-not-allowed focus:ring-0 focus:border-gray-200 focus:bg-gray-200 focus:outline-none dark:border-gray-700 dark:text-gray-100 dark:bg-gray-900 dark:focus:bg-gray-900 dark:placeholder:text-gray-500"
            rows="2"
            maxlength="100"
          ></textarea>
          <button
            :disabled="!isLoggedIn || alreadyReviewed"
            @click="handleReviewSubmit"
            class="bg-mboa-red text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Publier
          </button>
          <p
            v-if="alreadyReviewed"
            class="text-xs flex items-center text-mboa-gold mt-2 gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m8 12 2.5 2.5L16 9" />
            </svg>
            Vous avez déjà donné votre avis sur ce site.
          </p>
          <p v-else-if="reviewError" class="text-xs text-mboa-red mt-2">
            {{ reviewError }}
          </p>
          <p
            v-else-if="!isLoggedIn"
            class="text-xs text-gray-400 mt-2 flex items-center gap-2 dark:text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              <circle cx="12" cy="15.5" r="1" />
              <path d="M12 16.5v2" />
            </svg>
            Connectez-vous pour publier un avis
          </p>
        </div>
      </div>
    </div>

    <!-- Partagez vos souvenirs -->
    <div
      class="border rounded-xl p-5 mt-4 mb-8 border-gray-200 shadow-sm bg-[#faf9f5] dark:bg-gray-800 dark:border-gray-700"
    >
      <h3 class="font-bold text-mboa-green text-lg mb-1 dark:text-mboa-gold">
        Partagez vos souvenirs
      </h3>
      <div class="border-b-2 border-mboa-gold incline-block w-12 mb-3"></div>
      <p class="text-sm text-gray-600 leading-relaxed mb-4 dark:text-gray-400">
        Vos photos et vidéos peuvent inspirer d'autres voyageurs.
      </p>

      <div class="flex gap-4 mb-4 text-sm">
        <button
          @click="mediaTab = 'photos'"
          class="pb-2 border-b-2 transition"
          :class="
            mediaTab === 'photos'
              ? 'border-mboa-red text-mboa-red font-medium'
              : 'border-transparent text-gray-400 dark:text-gray-500'
          "
        >
          Photos
        </button>
        <button
          @click="mediaTab = 'videos'"
          class="pb-2 border-b-2 transition"
          :class="
            mediaTab === 'videos'
              ? 'border-mboa-red text-mboa-red font-medium'
              : 'border-transparent text-gray-400 dark:text-gray-500'
          "
        >
          Vidéos
        </button>
      </div>

      <div class="flex gap-20">
        <div
          v-if="isLoggedIn"
          @click="mediaInput?.click()"
          class="w-32 h-32 sm:w-40 sm:h-40 shrink-0 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center text-gray-400 cursor-pointer hover:border-mboa-green text-xs px-2 dark:text-gray-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            class="w-6 h-6 mb-1"
          >
            <path d="M12 16 L12 4" />
            <path d="M7 9 L12 4 L17 9" />
            <path
              d="M4 16 L4 18 C4 19.1 4.9 20 6 20 L18 20 C19.1 20 20 19.1 20 18 L20 16"
            />
          </svg>
          Ajouter des {{ mediaTab === "photos" ? "photos" : "vidéos" }}
          <span class="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">
            {{
              mediaTab === "photos" ? "PNG, JPG — 10 Mo max" : "MP4 — 50 Mo max"
            }}
          </span>
        </div>

        <div class="flex-1 min-w-0">
          <div
            v-if="filteredMedia.length > 0"
            class="grid grid-cols-8 gap-3 max-h-48 overflow-y-auto pr-1"
          >
            <div
              v-for="item in filteredMedia"
              :key="item.id"
              class="relative h-16 sm:h-[76px] rounded-lg overflow-hidden group"
            >
              <img
                v-if="item.type === 'photo'"
                :src="item.url"
                class="w-full h-full object-cover"
              />
              <video
                v-else
                :src="item.url"
                class="w-full h-full object-cover"
                muted
              />
              <button
                v-if="canDeleteMedia(item)"
                @click="userMedia.removeMedia(item.id)"
                class="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 flex items-center h-full dark:text-gray-500">
            Aucune {{ mediaTab === "photos" ? "photo" : "vidéo" }} partagée pour
            l'instant.
          </p>
        </div>
      </div>
      <input
        ref="mediaInput"
        type="file"
        :accept="mediaTab === 'photos' ? 'image/*' : 'video/*'"
        multiple
        class="hidden"
        @change="handleMediaUpload"
      />

      <p v-if="!isLoggedIn" class="text-xs text-gray-400 mt-3 dark:text-gray-500">
        🔒 Connectez-vous pour partager vos photos et vidéos.
      </p>
    </div>

    <!-- Sites similaires -->
    <div>
      <h2 class="text-lg font-bold text-mboa-green dark:text-mboa-gold">Sites similaires</h2>
      <div class="border-b-2 border-mboa-gold incline-block w-12 mb-3"></div>
      <p v-if="error1" class="text-sm text-gray-400 mb-3 dark:text-gray-500">{{ error1 }}</p>
      <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <router-link
          v-for="s in siteSimilar"
          :key="s.id"
          :to="`/site/${s.id}`"
          class="rounded-xl overflow-hidden border border-gray-200 shadow-sm p-5 bg-[#faf9f5] dark:bg-gray-800 hover:shadow-md transition dark:border-gray-700"
        >
          <img
            :src="getImagUrl(s.image?.idImage)"
            :alt="s.name"
            class="w-full h-32 object-cover bg-gray-100 dark:bg-gray-700"
            @error="$event.target.src = '/src/assets/image/placeholder.jpg'"
          />
          <div class="p-3">
            <h3 class="font-semibold text-sm text-mboa-green dark:text-mboa-gold">{{ s.name }}</h3>
            <p class="text-xs text-gray-500 mb-1 flex items-center dark:text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D4A017"
                stroke-width="1.8"
                width="22"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M12 21 C12 21 19 14.5 19 9.5 C19 5.4 15.9 2.5 12 2.5 C8.1 2.5 5 5.4 5 9.5 C5 14.5 12 21 12 21 Z"
                />
                <circle cx="12" cy="9.5" r="2.8" />
              </svg>
              {{ s.location }}
            </p>
            <p class="text-xs text-mboa-gold">
              ★ {{ s.moyenneAvis ?? "-" }} ({{ s.nbreAvis ?? 0 }} avis)
            </p>
          </div>
        </router-link>
      </div>
    </div>
  </div>

  <div v-else class="max-w-7xl mx-auto px-6 py-6">
    <nav class="text-sm text-gray-700 flex items-center gap-2 mb-2 dark:text-gray-300">
      <router-link to="/" class="hover:underline">Accueil</router-link>
      <span>›</span>
      <router-link to="/explorer" class="hover:underline">explorer</router-link>
    </nav>
    <div class="max-w-7xl mx-auto px-6 py-16 text-center text-gray-400 dark:text-gray-500">
      {{ error || "Site introuvable." }}
    </div>
  </div>
</template>
