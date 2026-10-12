<script setup>
import { useRouter } from "vue-router";
import { useUserDashboardModal } from "../../composables/useUserDashboardModal.ts";
import { useAuth } from "../../composables/useAuth.ts";
import { useFavorites } from "../../composables/useFavorites.ts";
import { useReviews } from "../../composables/useReviews.ts";
import { computed, ref, watch } from "vue";
const { favoriteSites, sites } = useFavorites();

const router = useRouter();
const { isOpen, activeTab, close } = useUserDashboardModal();
const { currentUser, logout } = useAuth();
const { getReviewsByUser, loadReviewsForUser, updateReview, removeReview } =
  useReviews();

const myReviews = computed(() => getReviewsByUser(currentUser.value?.id ?? -1));
const editingReviewId = ref(null);
const editRating = ref(0);
const editComment = ref("");
const editError = ref("");

const roleLabel = computed(() => {
  const labels = {
    visiteur: "Utilisateur",
    guide: "Guide touristique",
    admin: "Hermann&joseph",
  };
  return labels[currentUser.value?.role] || "Visiteur";
});

// Charge les avis de l'utilisateur dès l'ouverture de la modale
watch(
  () => [isOpen.value, currentUser.value?.id],
  ([open, userId]) => {
    if (open && userId) {
      loadReviewsForUser(userId, currentUser.value.nom);
    }
  },
  { immediate: true },
);

function getSiteName(siteId) {
  return sites.value.find((s) => s.id === siteId)?.name || "Site";
}

function handleLogout() {
  logout();
  close();
  router.push("/");
}

function getSite(siteId) {
  return sites.value.find((s) => s.id === siteId);
}

function startEdit(review) {
  editingReviewId.value = review.id;
  editRating.value = review.rating;
  editComment.value = review.comment;
  editError.value = "";
}

function cancelEdit() {
  editingReviewId.value = null;
  editError.value = "";
}

async function saveEdit(id) {
  editError.value = "";
  if (editRating.value === 0 || !editComment.value.trim()) return;
  const result = await updateReview(id, editRating.value, editComment.value);
  if (!result.ok) {
    editError.value = result.error;
    return;
  }
  editingReviewId.value = null;
}

async function handleDelete(id) {
  if (confirm("Supprimer cet avis ?")) {
    const result = await removeReview(id);
    if (!result.ok) {
      alert(result.error);
    }
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      @click.self="close"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center px-4 py-8"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex overflow-hidden max-h-[85vh] dark:bg-gray-900"
      >
        <!-- SIDEBAR -->
        <aside
          class="w-64 shrink-0 bg-gray-50 border-r border-gray-100 flex flex-col px-5 py-6 dark:bg-gray-800 dark:border-gray-700"
        >
          <div
            class="flex flex-col items-center text-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-700"
          >
            <div class="relative">
              <!-- Sidebar -->
              <div
                class="w-20 h-20 rounded-full bg-mboa-green/10 border-4 border-white ring-1 ring-gray-200 flex items-center justify-center text-2xl font-bold text-mboa-green shadow-sm dark:text-mboa-gold dark:ring-gray-700 dark:border-gray-800"
              >
                {{ currentUser?.nom?.charAt(0).toUpperCase() }}
              </div>
              <span
                class="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-[3px] border-white dark:border-gray-800 rounded-full"
              ></span>
            </div>
            <!-- Bloc auteur dans une carte d'avis -->
            <p class="text-sm font-medium text-gray-800 leading-tight dark:text-gray-200">
              {{ currentUser?.nom }}
            </p>
            <p class="text-xs text-gray-400 truncate max-w-[190px] dark:text-gray-500">
              {{ currentUser?.email }}
            </p>
          </div>

          <nav class="flex-1 space-y-1 text-sm">
            <div
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 dark:text-gray-600 cursor-not-allowed text-sm"
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
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Vue d'ensemble
              <span
                class="ml-auto text-[9px] bg-mboa-gold/20 text-mboa-gold px-1.5 py-0.5 rounded-full font-semibold"
                >V2</span
              >
            </div>
            <button
              @click="activeTab = 'favorites'"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left"
              :class="
                activeTab === 'favorites'
                  ? 'bg-mboa-red/10 text-mboa-red font-medium'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'"
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
                <path
                  d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8
  A4.8 4.8 0 0 1 12 5.5a4.8 4.8 0 0 1 8.8 3.3z"
                />
              </svg>
              Mes favoris
              <span
                class="ml-auto text-xs bg-white border rounded-full w-5 h-5 flex items-center justify-center dark:bg-gray-900 dark:border-gray-700"
                >{{ favoriteSites.length }}</span
              >
            </button>

            <button
              @click="activeTab = 'reviews'"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left"
              :class="
                activeTab === 'reviews'
                  ? 'bg-mboa-red/10 text-mboa-red font-medium'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'"
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
                  d="M8.625 9.75h6.75
       M8.625 13.5h4.5
       M12 21
       a9 9 0 1 0-8.25-5.4
       L3 21l4.65-1.35A8.96 8.96 0 0 0 12 21Z"
                />
              </svg>

              Mes avis
              <span
                class="ml-auto text-xs bg-white border rounded-full w-5 h-5 flex items-center justify-center dark:bg-gray-900 dark:border-gray-700"
                >{{ myReviews.length }}</span
              >
            </button>

            <div
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 dark:text-gray-600 cursor-not-allowed text-sm"
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
                <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" />
                <path d="M9 3v15" />
                <path d="M15 6v15" />
              </svg>
              Mon itinéraire
              <span
                class="ml-auto text-[9px] bg-mboa-gold/20 text-mboa-gold px-1.5 py-0.5 rounded-full font-semibold"
                >V2</span
              >
            </div>

            <div
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 dark:text-gray-600 cursor-not-allowed text-sm"
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
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
                <path d="M8 14h2M14 14h2M8 18h2" />
              </svg>
              Mes réservations
              <span
                class="ml-auto text-[9px] bg-mboa-gold/20 text-mboa-gold px-1.5 py-0.5 rounded-full font-semibold"
                >V2</span
              >
            </div>

            <div
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 dark:text-gray-600 cursor-not-allowed text-sm"
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
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1
  a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.5v-.1
  a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1
  A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.4v-2.5h.1
  A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1
  a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.5v.1
  a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1
  A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.5 1h.1v2.5h-.1
  a1.7 1.7 0 0 0-1.5 1.5z"
                />
              </svg>

              Paramètres
              <span
                class="ml-auto text-[9px] bg-mboa-gold/20 text-mboa-gold px-1.5 py-0.5 rounded-full font-semibold"
                >V2</span
              >
            </div>
          </nav>

          <button
            @click="handleLogout"
            class="mt-6 border border-mboa-red text-mboa-red text-sm font-medium py-2.5 rounded-lg hover:bg-mboa-red hover:text-white transition flex items-center justify-center gap-2"
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5" />
              <path d="M21 12H9" />
            </svg>

            Fermer la session
          </button>
        </aside>

        <!-- CONTENU -->
        <div class="flex-1 min-w-0 bg-white overflow-y-auto dark:bg-gray-900">
          <div class="flex items-start justify-between px-8 pt-6 pb-4">
            <div>
              <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Mon espace
              </h2>
              <p class="text-sm mt-2 text-gray-400 dark:text-gray-500">
                Retrouvez ici vos favoris, vos avis et vos activités.
              </p>
            </div>
            <button
              @click="close"
              class="text-gray-400 hover:text-gray-600 text-xl leading-none dark:text-gray-500 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <!-- Onglets -->
          <div class="flex gap-6 border-b border-gray-100 px-8 text-sm dark:border-gray-700">
            <button
              @click="activeTab = 'favorites'"
              class="pb-3 border-b-2 transition flex items-center gap-1.5"
              :class="
                activeTab === 'favorites'
                  ? 'border-mboa-red text-mboa-red font-medium'
                  : 'border-transparent text-gray-400 dark:text-gray-500'
              "
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
                <path
                  d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8
  A4.8 4.8 0 0 1 12 5.5a4.8 4.8 0 0 1 8.8 3.3z"
                />
              </svg>
              Mes favoris ({{ favoriteSites.length }})
            </button>
            <button
              @click="activeTab = 'reviews'"
              class="pb-3 border-b-2 transition flex items-center gap-1.5"
              :class="
                activeTab === 'reviews'
                  ? 'border-mboa-red text-mboa-red font-medium'
                  : 'border-transparent text-gray-400 dark:text-gray-500'
              "
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
                  d="M8.625 9.75h6.75
       M8.625 13.5h4.5
       M12 21
       a9 9 0 1 0-8.25-5.4
       L3 21l4.65-1.35A8.96 8.96 0 0 0 12 21Z"
                />
              </svg>
              Mes avis ({{ myReviews.length }})
            </button>
          </div>

          <div class="px-8 py-6">
            <!-- FAVORIS -->
            <div v-if="activeTab === 'favorites'">
              <div
                v-if="favoriteSites.length > 0"
                class="grid grid-cols-1 sm:grid-cols-3 gap-5"
              >
                <router-link
                  v-for="site in favoriteSites"
                  :key="site.id"
                  :to="`/site/${site.id}`"
                  @click="close"
                  class="rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg dark:border-gray-700"
                >
                  <img
                    :src="site.image"
                    :alt="site.name"
                    class="w-full h-32 object-cover"
                  />

                  <div class="p-3">
                    <h3 class="font-semibold text-sm text-mboa-green dark:text-mboa-gold">
                      {{ site.name }}
                    </h3>
                    <p class="text-xs text-gray-400 flex items-center mb-1 dark:text-gray-500">
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
                      {{ site.region }}
                    </p>
                    <p class="text-xs text-gray-500 line-clamp-2 dark:text-gray-400">
                      {{ site.description }}
                    </p>
                  </div>
                </router-link>
              </div>
              <p v-else class="text-gray-400 text-sm py-12 text-center dark:text-gray-500">
                Vous n'avez encore ajouté aucun site à vos favoris.
              </p>
            </div>

            <!-- AVIS -->
            <div v-else>
              <div v-if="myReviews.length > 0" class="space-y-4">
                <div
                  v-for="review in myReviews"
                  :key="review.id"
                  class="border border-gray-300 shadow-sm bg-[#faf9f5] dark:bg-gray-800 rounded-xl p-5 dark:border-gray-600"
                >
                  <div class="flex gap-4">
                    <img
                      :src="getSite(review.siteId)?.image"
                      class="w-20 h-20 rounded-lg object-cover shrink-0"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <router-link
                            :to="`/site/${review.siteId}`"
                            @click="close"
                            class="font-bold text-gray-800 hover:text-mboa-green dark:text-gray-200"
                          >
                            {{ getSite(review.siteId)?.name }}
                          </router-link>
                          <p
                            class="text-xs text-gray-400 mt-0.5 flex items-center dark:text-gray-500"
                          >
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
                            {{ getSite(review.siteId)?.region }}
                          </p>
                        </div>
                        <span
                          class="text-xs text-gray-400 whitespace-nowrap flex items-center dark:text-gray-500"
                          ><svg
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
                              d="M6.75 3v2.25M17.25 3v2.25
       M3.75 9h16.5
       M5.25 5.25h13.5
       A1.5 1.5 0 0 1 20.25 6.75v11.5
       a1.5 1.5 0 0 1-1.5 1.5H5.25
       a1.5 1.5 0 0 1-1.5-1.5V6.75
       a1.5 1.5 0 0 1 1.5-1.5Z"
                            />
                          </svg>
                          {{ review.date }}</span
                        >
                      </div>

                      <!-- Mode lecture -->
                      <template v-if="editingReviewId !== review.id">
                        <div class="flex items-center gap-2 mt-2">
                          <span class="text-mboa-gold text-sm"
                            >{{ "★".repeat(review.rating)
                            }}{{ "☆".repeat(5 - review.rating) }}</span
                          >
                          <span
                            class="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full dark:text-green-400 dark:bg-green-900/40"
                            >{{ review.rating }}.0/5</span
                          >
                        </div>
                        <p class="text-sm text-gray-600 mt-2 break-words dark:text-gray-400">
                          {{ review.comment }}
                        </p>
                      </template>

                      <!-- Mode édition -->
                      <template v-else>
                        <div class="flex gap-1 mt-2">
                          <button
                            v-for="n in 5"
                            :key="n"
                            @click="editRating = n"
                            class="text-xl"
                            :class="
                              n <= editRating
                                ? 'text-mboa-gold'
                                : 'text-gray-300 dark:text-gray-600'
                            "
                          >
                            ★
                          </button>
                        </div>
                        <textarea
                          v-model="editComment"
                          rows="2"
                          class="w-full border rounded-lg p-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-mboa-green/30"
                        ></textarea>
                        <p v-if="editError" class="text-xs text-mboa-red mt-1">
                          {{ editError }}
                        </p>
                      </template>
                    </div>
                  </div>

                  <div
                    class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div
                      class="w-8 h-8 rounded-full bg-mboa-green/10 flex items-center justify-center text-xs font-bold text-mboa-green dark:text-mboa-gold"
                    >
                      {{ currentUser?.nom?.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p
                        class="text-sm font-medium text-gray-800 leading-tight dark:text-gray-200"
                      >
                        {{ currentUser?.nom }}
                      </p>
                      <p class="text-xs text-gray-400 leading-tight dark:text-gray-500">
                        {{ roleLabel }}
                      </p>
                    </div>

                    <div class="flex gap-2">
                      <template v-if="editingReviewId !== review.id">
                        <button
                          @click="startEdit(review)"
                          class="text-sm text-gray-600 border rounded-lg px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1.5 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-800"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          @click="handleDelete(review.id)"
                          class="text-sm text-mboa-red border border-mboa-red/30 rounded-lg px-3 py-1.5 hover:bg-mboa-red hover:text-white transition flex items-center gap-1.5"
                        >
                          🗑️ Supprimer
                        </button>
                      </template>
                      <template v-else>
                        <button
                          @click="cancelEdit"
                          class="text-sm text-gray-600 border rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-800"
                        >
                          Annuler
                        </button>
                        <button
                          @click="saveEdit(review.id)"
                          class="text-sm text-white bg-mboa-green rounded-lg px-3 py-1.5 hover:bg-mboa-green-light"
                        >
                          Enregistrer
                        </button>
                      </template>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Encouragement à publier plus d'avis -->
              <div class="text-center py-10">
                <div class="text-5xl mb-3 px-55">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.8"
                    stroke="currentColor"
                    class="w-20 h-20"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8.625 9.75h6.75
       M8.625 13.5h4.5
       M12 21
       a9 9 0 1 0-8.25-5.4
       L3 21l4.65-1.35A8.96 8.96 0 0 0 12 21Z"
                    />
                  </svg>
                </div>
                <p class="font-semibold text-gray-800 dark:text-gray-200">
                  {{
                    myReviews.length > 0
                      ? "Vous n'avez pas encore publié d'autres avis."
                      : "Vous n'avez encore publié aucun avis."
                  }}
                </p>
                <p class="text-sm text-gray-400 mt-1 dark:text-gray-500">
                  Partagez votre expérience et aidez les autres voyageurs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
