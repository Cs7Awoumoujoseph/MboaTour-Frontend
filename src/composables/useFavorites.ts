import { ref, computed, watch } from "vue";
import { useAuth } from "./useAuth";
import type { Destination, FavoriteEntry } from "../types/index.ts";
import api from "../api/axios.ts";
import { siteApi } from "../api/siteApi.ts";

const favorites = ref<FavoriteEntry[]>([]);
const sites = ref<Destination[]>([]);
const sitesLoaded = ref(false);
const favoritesLoadedForUserId = ref<number | null>(null);

async function loadFavorites(userId: number) {
  try {
    const response = await api.get(`/favoris/utilisateur/${userId}`);
    favorites.value = (response.data ?? []).map((favori: any) => ({
      userId: Number(favori.utilisateurId),
      siteId: Number(favori.siteId),
    }));
  } catch (err) {
    console.error("Erreur lors du chargement des favoris :", err);
  }
}

const API_BASE = api.defaults.baseURL ?? "http://localhost:8080/mboa";

function resolveImageUrl(site: any): string {
  const imageId = site.imageId ?? site.idImage ?? site.image?.idImage;
  if (imageId) {
    return `${API_BASE}/img/${imageId}/view`;
  }
  if (typeof site.image === "string" && site.image) {
    return site.image;
  }
  if (site.imageUrl) {
    return site.imageUrl;
  }
  return "/src/assets/image/placeholder.jpg";
}

async function loadSites() {
  try {
    const response = await siteApi.search({ page: 0, size: 1000 });
    const rawSites = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.content)
        ? response.data.content
        : [];

    sites.value = rawSites.map((site: any) => ({
      id: site.id,
      name: site.name ?? site.nom ?? "Site touristique",
      category: site.category ?? site.categorie ?? "Autre",
      region: site.location ?? site.region ?? "Région inconnue",
      description:
        site.description ??
        site.phraseAccroche ??
        "Découvrez ce site touristique du Cameroun.",
      imageId: site.imageId ?? site.idImage ?? site.image?.idImage,
      image: resolveImageUrl(site),
      rating: site.rating ?? site.moyenneAvis ?? 0,
      reviews: site.reviews ?? Array(site.nbreAvis ?? 0).fill(null),
    }));
  } catch (err) {
    console.error("Erreur lors du chargement des sites :", err);
  }
}
export function useFavorites() {
  const { currentUser, isLoggedIn } = useAuth();

  if (!sitesLoaded.value) {
    sitesLoaded.value = true;
    loadSites();
  }

  // Recharge les favoris chaque fois que l'utilisateur connecté change
  watch(
    () => currentUser.value?.id,
    (userId) => {
      if (userId && favoritesLoadedForUserId.value !== userId) {
        favoritesLoadedForUserId.value = userId;
        loadFavorites(userId);
      } else if (!userId) {
        favorites.value = [];
        favoritesLoadedForUserId.value = null;
      }
    },
    { immediate: true },
  );

  function isFavorite(siteId: number): boolean {
    if (!currentUser.value) return false;
    const userId = Number(currentUser.value.id);
    return favorites.value.some(
      (f) => f.userId === userId && f.siteId === Number(siteId),
    );
  }

  async function toggleFavorite(siteId: number): Promise<void> {
    if (!currentUser.value) return;
    const userId = Number(currentUser.value.id);
    const alreadyFavorite = isFavorite(siteId);

    try {
      if (alreadyFavorite) {
        await api.delete("/favoris/supprimer", {
          params: { utilisateurId: userId, siteId },
        });
        favorites.value = favorites.value.filter(
          (f) => !(f.userId === userId && f.siteId === Number(siteId)),
        );
      } else {
        await api.post("/favoris/ajouter", null, {
          params: { utilisateurId: userId, siteId },
        });
        favorites.value = [
          ...favorites.value,
          { userId, siteId: Number(siteId) },
        ];
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour des favoris :", err);
    }
  }

  const favoriteSites = computed(() => {
    if (!currentUser.value) return [];
    const userId = Number(currentUser.value.id);
    const myFavoriteIds = favorites.value
      .filter((f) => f.userId === userId)
      .map((f) => f.siteId);
    return sites.value.filter((s) => myFavoriteIds.includes(Number(s.id)));
  });
return { isFavorite, toggleFavorite, favoriteSites, sites };
}