<script setup lang="ts">
import { ref, computed, onMounted, type Directive } from "vue";
import { useFavorites } from "../composables/useFavorites";
import { useAuth } from "../composables/useAuth";
import type { Destination } from "../types";
import { siteApi } from "../api/siteApi";
import main from "../assets/image/main.gif";

const { isFavorite, toggleFavorite } = useFavorites();
const { isLoggedIn } = useAuth();

// =====================================================
// Directive d'animation au scroll (IntersectionObserver)
// Usage : v-reveal ou v-reveal="{ delay: 150 }"
// =====================================================
const vReveal: Directive<HTMLElement, { delay?: number } | undefined> = {
  mounted(el, binding) {
    const delay = binding.value?.delay ?? 0;
    el.classList.add("reveal");
    el.style.transitionDelay = `${delay}ms`;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("reveal-visible");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
  },
};

const categories = [
  {
    label: "Sites Culturels",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20 L24 8 L42 20" /><path d="M10 20 L10 38 L38 38 L38 20" /><path d="M24 8 L24 38" /><path d="M17 38 L17 26 L31 26 L31 38" /></svg>`,
  },
  {
    label: "Sites Naturels",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="12" r="3" /><path d="M4 38 L18 18 L26 28 L32 20 L44 38 Z" /><path d="M4 38 L44 38" /></svg>`,
  },
  {
    label: "Musées",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 16 L24 6 L43 16" />
  <path d="M5 16 L43 16" />
  <path d="M8 20 L8 36" />
  <path d="M16 20 L16 36" />
  <path d="M24 20 L24 36" />
  <path d="M32 20 L32 36" />
  <path d="M40 20 L40 36" />
  <path d="M4 40 L44 40" />
  <path d="M4 36 L44 36" />
</svg>
`,
  },
  {
    label: "Artisanat",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <ellipse cx="24" cy="10" rx="14" ry="5" />
  <path d="M10 10 C10 18, 17 22, 17 30 C17 36, 20 40, 24 42 C28 40, 31 36, 31 30 C31 22, 38 18, 38 10" />
  <path d="M13 12 L13 16" />
  <path d="M19 14.5 L19 18" />
  <path d="M29 14.5 L29 18" />
  <path d="M35 12 L35 16" />
</svg>
`,
  },
  {
    label: "Festivals",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="24" cy="10" r="5" />
  <path d="M14 32 C14 24, 34 24, 34 32 L34 36 L14 36 Z" />
  <circle cx="10" cy="16" r="4" />
  <path d="M3 32 C3 26, 12 26, 15 30" />
  <circle cx="38" cy="16" r="4" />
  <path d="M45 32 C45 26, 36 26, 33 30" />
</svg>
`,
  },
  {
    label: "Régions",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 10 L16 6 L26 10 L36 6 L42 10 L42 38 L36 42 L26 38 L16 42 L6 38 Z" />
  <path d="M16 6 L16 42" />
  <path d="M26 10 L26 38" />
  <path d="M36 6 L36 42" />
  <circle cx="24" cy="22" r="4" fill="#D4A017" stroke="none" />
</svg>
`,
  },
];

const categoryColorMap: Record<string, string> = {
  "Sites balneaires": "bg-mboa-green",
  "Patrimoine culturel": "bg-green-600",
  "Sites de randonnee": "bg-mboa-gold",
  Festival: "bg-mboa-red",
};
function categoryColor(cat: string) {
  return categoryColorMap[cat] || "bg-gray-500";
}

const features = [
  {
    title: "Informations officielles",
    description: "Des contenus fiables et vérifiés sur les sites touristiques.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M24 4 L42 11 L42 23 C42 34 34 42 24 45 C14 42 6 34 6 23 L6 11 Z" /><path d="M16 24 L21 29 L32 18" stroke="#D4A017" /></svg>`,
  },
  {
    title: "Facile à utiliser",
    description: "Réservez et planifiez vos visites en quelques clics.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="13" y="4" width="22" height="40" rx="4" /><path d="M18 12 L30 12" /></svg>`,
  },
  {
    title: "Support 24/7",
    description:
      "Notre équipe est là pour vous accompagner avant, pendant et après votre voyage.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 26 L8 22 C8 12.6 15.2 5 24 5 C32.8 5 40 12.6 40 22 L40 26" /><rect x="4" y="26" width="10" height="14" rx="3" /><rect x="34" y="26" width="10" height="14" rx="3" /></svg>`,
  },
];

const steps = [
  {
    number: "01",
    title: "Explorez",
    description:
      "Parcourez les sites culturels, naturels et historiques du Cameroun, filtrés par région ou par centre d'intérêt.",
  },
  {
    number: "02",
    title: "Contactez un admin",
    description:
      "Contactez un administrateur certifié,prenez votre visite en quelques clics.",
  },
  {
    number: "03",
    title: "Vivez l'expérience",
    description:
      "Rencontrez votre guide sur place et découvrez le patrimoine camerounais à travers un récit authentique.",
  },
];

const stats = [
  { value: "120+", label: "Sites référencés" },
  { value: "45", label: "Admin certifiés" },
  { value: "10", label: "Régions couvertes" },
  { value: "4.8/5", label: "Note moyenne voyageurs" },
];

// Photos de démonstration (placeholders Picsum, à remplacer par vos vrais visuels)
const regions = [
  {
    name: "Littoral",
    desc: "Chutes et forêts côtières",
    img: "https://picsum.photos/seed/mboa-littoral/400/500",
  },
  {
    name: "Ouest",
    desc: "Chefferies et cases traditionnelles",
    img: "https://picsum.photos/seed/mboa-ouest/400/500",
  },
  {
    name: "Nord",
    desc: "Savanes et parcs nationaux",
    img: "https://picsum.photos/seed/mboa-nord/400/500",
  },
  {
    name: "Adamaoua",
    desc: "Plateaux et cascades",
    img: "https://picsum.photos/seed/mboa-adamaoua/400/500",
  },
];

const testimonials = [
  {
    name: "Aïcha M.",
    origin: "Voyageuse — Douala",
    quote:
      "Notre guide connaissait chaque recoin du Palais de Bafut. Une visite qui vaut largement mieux qu'un simple circuit touristique.",
    photo: "https://picsum.photos/seed/mboa-aicha/100/100",
  },
  {
    name: "Thomas R.",
    origin: "Voyageur — France",
    quote:
      "Réservation simple, guide ponctuel et passionné. J'ai découvert des sites que je n'aurais jamais trouvés seul.",
    photo: "https://picsum.photos/seed/mboa-thomas/100/100",
  },
  {
    name: "Bella N.",
    origin: "Voyageuse — Yaoundé",
    quote:
      "MboaTour m'a permis de redécouvrir mon propre pays sous un autre angle, avec des explications historiques précises.",
    photo: "https://picsum.photos/seed/mboa-bella/100/100",
  },
];

const loading = ref(true);
const error = ref("");
const sites = ref<Destination[]>([]);

const loadPopularSites = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await siteApi.search({
      page: 0,
      size: 4,
      tri: "MOYENNE",
    });

    const content = response?.data?.content;

    if (Array.isArray(content)) {
      sites.value = content;
    } else if (Array.isArray(response?.data)) {
      sites.value = response.data;
    } else {
      sites.value = [];
    }
  } catch (err) {
    console.error("Erreur chargement sites :", err);
    error.value = "Impossible de charger les destinations pour le moment.";
    sites.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadPopularSites();
});

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
    image: site.image?.image
      ? `data:${site.image.type};base64,${site.image.image}`
      : (site.imageUrl ?? ""),
    rating: site.rating ?? site.moyenneAvis ?? 0,
    reviews: site.reviews ?? Array(site.nbreAvis ?? 0).fill(null),
  }));
});

function starStates(rating: number) {
  const rounded = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) => i < rounded);
}

const skeletons = Array.from({ length: 4 });
</script>

<template>
  <div class="font-sans overflow-x-hidden">
    <svg width="0" height="0" class="absolute">
      <defs>
        <pattern
          id="mboa-chevron"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <rect width="16" height="16" fill="#F5E9D6" />
          <polygon points="0,16 8,4 16,16" fill="#1B3D2A" />
          <polygon points="0,16 8,8 16,16" fill="#D4A017" />
          <polygon points="4,16 8,10 12,16" fill="#C0392B" />
        </pattern>
      </defs>
    </svg>

    <!-- =============================================== -->
    <!-- SECTION 1 : HÉRO — image animée en arrière-plan  -->
    <!-- =============================================== -->
    <section
      class="relative bg-mboa-green text-white pt-6 pb-32 px-6 overflow-hidden min-h-[85vh] flex items-center"
    >
      <svg
        width="100%"
        height="12"
        preserveAspectRatio="none"
        class="block absolute top-0 left-0"
      >
        <rect width="100%" height="12" fill="url(#mboa-chevron)" />
      </svg>

      <!-- Image de fond en Ken Burns (zoom/pan lent en boucle) -->
      <div class="absolute inset-0 overflow-hidden">
        <div
          class="absolute inset-0 bg-cover bg-center kenburns"
          :style="{ backgroundImage: 'url(' + main + ')' }"
        ></div>
        <div
          class="absolute inset-0"
          style="
            background:
              linear-gradient(
                100deg,
                rgba(27, 61, 42, 0.93) 0%,
                rgba(27, 61, 42, 0.72) 38%,
                rgba(27, 61, 42, 0.42) 65%,
                rgba(27, 61, 42, 0.6) 100%
              ),
              linear-gradient(
                to bottom,
                rgba(27, 61, 42, 0.25) 0%,
                transparent 25%,
                rgba(27, 61, 42, 0.55) 100%
              );
          "
        ></div>
      </div>

      <!-- Motifs du masque flottant doucement -->
      <svg
        class="absolute left-[8%] top-[18%] w-16 h-16 text-mboa-gold/20 hidden md:block float-slow"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path
          d="M50 5 L85 25 L85 55 C85 75 68 90 50 95 C32 90 15 75 15 55 L15 25 Z"
        />
      </svg>
      <svg
        class="absolute right-[10%] top-[12%] w-24 h-24 text-white/10 hidden md:block float-slower"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path
          d="M50 5 L85 25 L85 55 C85 75 68 90 50 95 C32 90 15 75 15 55 L15 25 Z"
        />
      </svg>
      <div
        class="absolute -right-16 -top-16 w-72 h-72 rounded-full border border-white/10 hidden sm:block"
      ></div>

      <!-- Contenu -->
      <div
        class="relative max-w-4xl mx-auto sm:mx-0 text-center sm:text-left z-10"
      >
        <span
          v-reveal
          class="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-xs font-medium tracking-wide uppercase px-3 py-1.5 rounded-full mb-6"
        >
          <span class="w-2 h-2 rounded-full bg-mboa-gold"></span>
          Sites certifiés & guides locaux
        </span>

        <h1
          v-reveal="{ delay: 100 }"
          class="font-poppins text-4xl md:text-5xl font-bold leading-tight mb-4"
        >
          Découvrez le<br class="hidden sm:block" />
          <span class="text-mboa-gold">Cameroun</span>
          autrement
        </h1>

        <p
          v-reveal="{ delay: 200 }"
          class="text-lg md:text-xl text-white/80 max-w-2xl mb-8 mx-auto sm:mx-0"
        >
          Partez à la rencontre d'une culture riche, de paysages spectaculaires
          et d'expériences authentiques, accompagné par des guides locaux
          passionnés.
        </p>

        <div
          v-reveal="{ delay: 300 }"
          class="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-10"
        >
          <router-link
            to="/explorer"
            class="bg-mboa-gold text-mboa-green font-semibold px-6 py-3 rounded-lg hover:bg-yellow-500 transition shadow-sm"
          >
            Explorer les destinations
          </router-link>
          <router-link
            to="/a-propos"
            class="border border-white/40 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition"
          >
            Nous contacter
          </router-link>
        </div>

        <div
          v-reveal="{ delay: 400 }"
          class="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/70 justify-center sm:justify-start"
        >
          <span class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D4A017"
              stroke-width="2"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
            120+ sites référencés
          </span>
          <span class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D4A017"
              stroke-width="2"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
            Adminstrateur vérifiés
          </span>
          <span class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D4A017"
              stroke-width="2"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
            Sur et Fiable
          </span>
        </div>
      </div>

      <svg
        class="absolute bottom-0 left-0 w-full h-12 text-mboa-cream z-10"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path
          d="M0,32 C240,60 480,0 720,16 C960,32 1200,56 1440,24 L1440,60 L0,60 Z"
        />
      </svg>
    </section>

    <!-- =============================================== -->
    <!-- SECTION 2 : CATÉGORIES                           -->
    <!-- =============================================== -->
    <section class="bg-mboa-cream py-10 dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-6">
        <h2
          v-reveal
          class="text-center text-sm font-semibold tracking-wide uppercase text-mboa-green/70 mb-6"
        >
          Parcourir par catégorie
        </h2>
        <div class="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          <button
            v-for="(cat, i) in categories"
            :key="cat.label"
            v-reveal="{ delay: i * 60 }"
            type="button"
            class="group flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-transparent px-2 py-5 shadow-sm hover:shadow-md hover:border-mboa-gold/50 hover:-translate-y-0.5 transition-all dark:bg-gray-900"
          >
            <div
              class="w-10 h-10 flex items-center justify-center text-mboa-gold group-hover:scale-110 transition-transform"
              v-html="cat.icon"
            ></div>
            <span
              class="text-gray-700 text-xs md:text-sm font-medium text-center dark:text-gray-300"
              >{{ cat.label }}</span
            >
          </button>
        </div>
      </div>
    </section>

    <!-- =============================================== -->
    <!-- SECTION 3 : DESTINATIONS POPULAIRES              -->
    <!-- =============================================== -->
    <section class="max-w-7xl mx-auto px-6 py-14">
      <div v-reveal class="flex items-end justify-between mb-8 flex-wrap gap-3">
        <div>
          <h2
            class="font-poppins text-2xl md:text-3xl font-bold text-mboa-green dark:text-mboa-gold"
          >
            Destinations <span class="text-mboa-gold">populaires</span>
          </h2>
          <p class="text-gray-500 text-sm mt-1 dark:text-gray-400">
            Explorez les lieux incontournables du Cameroun
          </p>
        </div>
        <router-link
          to="/explorer"
          class="text-mboa-red text-sm font-semibold hover:opacity-75 whitespace-nowrap"
        >
          Voir toutes les destinations &rarr;
        </router-link>
      </div>

      <div
        v-if="error"
        class="flex flex-col items-center text-center gap-3 bg-red-50 border border-red-100 rounded-xl py-12 px-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C0392B"
          stroke-width="1.8"
          class="w-10 h-10"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" />
          <path d="M12 16h.01" />
        </svg>
        <p class="text-mboa-red font-medium">{{ error }}</p>
        <button
          @click="loadPopularSites"
          class="bg-mboa-red text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Réessayer
        </button>
      </div>

      <div
        v-else-if="loading"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
      >
        <div
          v-for="(_, i) in skeletons"
          :key="i"
          class="rounded-xl overflow-hidden bg-white shadow-sm animate-pulse dark:bg-gray-900"
        >
          <div class="w-full h-36 bg-gray-200 dark:bg-gray-700"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-700"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
            <div
              class="h-6 bg-gray-100 rounded w-full mt-4 dark:bg-gray-800"
            ></div>
          </div>
        </div>
      </div>

      <div
        v-else-if="normalizedSites.length === 0"
        class="text-center py-12 text-gray-500 dark:text-gray-400"
      >
        Aucune destination disponible pour le moment.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="(site, i) in normalizedSites"
          :key="site.id"
          v-reveal="{ delay: i * 80 }"
          class="group rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-white border border-transparent hover:border-mboa-gold/30 dark:bg-gray-900"
        >
          <div class="relative overflow-hidden">
            <img
              :src="site.image"
              :alt="site.name"
              class="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span
              :class="categoryColor(site.category)"
              class="absolute top-2 left-2 text-white text-[11px] font-medium px-2 py-1 rounded"
            >
              {{ site.category }}
            </span>
            <button
              :disabled="!isLoggedIn"
              @click="toggleFavorite(site.id)"
              class="disabled:opacity-50 disabled:cursor-not-allowed absolute top-2 right-2 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white transition dark:bg-gray-900"
              :aria-label="
                isFavorite(site.id)
                  ? 'Retirer des favoris'
                  : 'Ajouter aux favoris'
              "
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
              class="font-semibold text-mboa-green truncate dark:text-mboa-gold"
            >
              {{ site.name }}
            </h3>
            <p
              class="text-xs text-gray-500 flex items-center gap-1 mt-1 dark:text-gray-400"
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
            <div class="flex items-center gap-0.5 mt-2">
              <svg
                v-for="(filled, si) in starStates(site.rating)"
                :key="si"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                :fill="filled ? '#D4A017' : 'none'"
                stroke="#D4A017"
                stroke-width="1.5"
                class="w-3.5 h-3.5"
              >
                <path
                  d="M12 2l2.9 6.9 7.1.6-5.5 4.7 1.7 7-6.2-4-6.2 4 1.7-7-5.5-4.7 7.1-.6z"
                />
              </svg>
              <span class="text-[11px] text-gray-400 ml-1 dark:text-gray-500"
                >({{ site.reviews.length }})</span
              >
            </div>
            <div class="flex items-center justify-between mt-3">
              <span
                class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full dark:bg-green-900/40 dark:text-green-400"
                >Visite</span
              >
              <router-link
                :to="`/site/${site.id}`"
                class="bg-mboa-red text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-700 transition"
              >
                Voir la fiche
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- =============================================== -->
    <!-- SECTION 4 : COMMENT ÇA MARCHE                    -->
    <!-- =============================================== -->
    <section class="bg-white py-16 relative overflow-hidden dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-6">
        <div v-reveal class="text-center mb-12">
          <span
            class="text-xs font-semibold tracking-widest uppercase text-mboa-red"
            >Le parcours</span
          >
          <h2
            class="font-poppins text-2xl md:text-3xl font-bold text-mboa-green mt-2 dark:text-mboa-gold"
          >
            Comment ça marche
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div
            class="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] border-t-2 border-dashed border-mboa-gold/40"
          ></div>
          <div
            v-for="(step, i) in steps"
            :key="step.number"
            v-reveal="{ delay: i * 120 }"
            class="relative text-center px-4"
          >
            <div
              class="relative z-10 w-16 h-16 mx-auto rounded-full bg-mboa-green text-mboa-gold font-poppins font-bold text-xl flex items-center justify-center mb-5 shadow-md"
            >
              {{ step.number }}
            </div>
            <h3
              class="font-poppins font-semibold text-lg text-mboa-green mb-2 dark:text-mboa-gold"
            >
              {{ step.title }}
            </h3>
            <p
              class="text-sm text-gray-500 max-w-xs mx-auto dark:text-gray-400"
            >
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <svg width="100%" height="14" preserveAspectRatio="none" class="block">
      <rect width="100%" height="14" fill="url(#mboa-chevron)" />
    </svg>

    <!-- =============================================== -->
    <!-- SECTION 5 : CHIFFRES CLÉS                        -->
    <!-- =============================================== -->
    <section class="bg-mboa-green py-14 px-6">
      <div
        class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
      >
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          v-reveal="{ delay: i * 100 }"
        >
          <p class="font-poppins text-3xl md:text-4xl font-bold text-mboa-gold">
            {{ stat.value }}
          </p>
          <p class="text-white/70 text-sm mt-1">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- =============================================== -->
    <!-- SECTION 6 : RÉGIONS À DÉCOUVRIR (nouveau, avec photos) -->
    <!-- =============================================== -->
    <section class="bg-mboa-cream py-16 dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-6">
        <div v-reveal class="text-center mb-10">
          <span
            class="text-xs font-semibold tracking-widest uppercase text-mboa-red"
            >Aux quatre coins du pays</span
          >
          <h2
            class="font-poppins text-2xl md:text-3xl font-bold text-mboa-green mt-2 dark:text-mboa-gold"
          >
            Régions à découvrir
          </h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="(region, i) in regions"
            :key="region.name"
            v-reveal="{ delay: i * 100 }"
            class="group relative rounded-2xl overflow-hidden h-64 shadow-sm"
          >
            <img
              :src="region.img"
              :alt="region.name"
              class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
            ></div>
            <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p class="font-poppins font-semibold">{{ region.name }}</p>
              <p class="text-xs text-white/80">{{ region.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- =============================================== -->
    <!-- SECTION 7 : POURQUOI CHOISIR MBOATOUR ?          -->
    <!-- =============================================== -->
    <section class="bg-white py-16 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <h2
          v-reveal
          class="font-poppins text-2xl md:text-3xl font-bold text-mboa-green mb-10 dark:text-mboa-gold"
        >
          Pourquoi choisir <span class="text-mboa-gold">MboaTour</span> ?
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div
            v-for="(item, i) in features"
            :key="item.title"
            v-reveal="{ delay: i * 100 }"
            class="flex flex-col items-center bg-mboa-cream/60 dark:bg-gray-700/60 rounded-2xl border border-transparent hover:border-mboa-gold/30 shadow-sm hover:shadow-md transition-all p-6"
          >
            <div
              class="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm dark:bg-gray-900 text-mboa-green dark:text-mboa-gold"
            >
              <div class="w-7 h-7" v-html="item.icon"></div>
            </div>
            <h3 class="font-semibold text-mboa-green mb-1 dark:text-mboa-gold">
              {{ item.title }}
            </h3>
            <p class="text-sm text-gray-500 max-w-xs dark:text-gray-400">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- =============================================== -->
    <!-- SECTION 8 : TÉMOIGNAGES                          -->
    <!-- =============================================== -->
    <section class="bg-mboa-cream py-16 dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-6">
        <div v-reveal class="text-center mb-12">
          <span
            class="text-xs font-semibold tracking-widest uppercase text-mboa-red"
            >Ils ont voyagé avec nous</span
          >
          <h2
            class="font-poppins text-2xl md:text-3xl font-bold text-mboa-green mt-2 dark:text-mboa-gold"
          >
            Ce que disent nos voyageurs
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(t, i) in testimonials"
            :key="t.name"
            v-reveal="{ delay: i * 120 }"
            class="bg-white border border-mboa-gold/20 rounded-2xl p-6 dark:bg-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#D4A017"
              class="w-8 h-8 mb-3 opacity-60"
            >
              <path
                d="M7.17 6C4.87 8.34 3.5 11 3.5 14.14c0 3.6 2.24 6.36 5.8 6.36 2.3 0 3.9-1.7 3.9-3.9 0-2-1.3-3.5-3.2-3.7-.5-.05-.9-.1-.9-.6 0-1.1 1.4-3.2 2.9-4.4L7.17 6Zm10 0C14.87 8.34 13.5 11 13.5 14.14c0 3.6 2.24 6.36 5.8 6.36 2.3 0 3.9-1.7 3.9-3.9 0-2-1.3-3.5-3.2-3.7-.5-.05-.9-.1-.9-.6 0-1.1 1.4-3.2 2.9-4.4L17.17 6Z"
              />
            </svg>
            <p
              class="text-sm text-gray-700 mb-5 leading-relaxed dark:text-gray-300"
            >
              {{ t.quote }}
            </p>
            <div class="flex items-center gap-3">
              <img
                :src="t.photo"
                :alt="t.name"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p
                  class="text-sm font-semibold text-mboa-green dark:text-mboa-gold"
                >
                  {{ t.name }}
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500">
                  {{ t.origin }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- =============================================== -->
    <!-- SECTION 9 : APPEL À L'ACTION FINAL                -->
    <!-- =============================================== -->
    <section class="relative bg-mboa-green py-20 px-6 overflow-hidden">
      <svg
        width="100%"
        height="14"
        preserveAspectRatio="none"
        class="absolute top-0 left-0"
      >
        <rect width="100%" height="14" fill="url(#mboa-chevron)" />
      </svg>
      <svg
        class="absolute -right-10 -bottom-10 w-72 h-72 text-white/5 hidden md:block float-slow"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path
          d="M50 5 L85 25 L85 55 C85 75 68 90 50 95 C32 90 15 75 15 55 L15 25 Z"
        />
      </svg>
      <div
        class="absolute -left-16 top-1/3 w-48 h-48 rounded-full border border-mboa-gold/10 hidden md:block"
      ></div>

      <div v-reveal class="relative max-w-4xl mx-auto text-center text-white">
        <span
          class="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-xs font-medium tracking-wide uppercase px-3 py-1.5 rounded-full mb-6"
        >
          Rejoignez la communauté MboaTour
        </span>
        <h2
          class="font-poppins text-3xl md:text-4xl font-bold mb-4 leading-tight"
        >
          Prêt à vivre le
          <span class="text-mboa-gold">Cameroun</span> autrement&nbsp;?
        </h2>
        <p class="text-white/80 mb-9 max-w-xl mx-auto">
          Créez votre compte gratuitement et commencez à planifier votre
          prochaine découverte dès aujourd'hui.
        </p>
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <router-link
            to="/register"
            class="w-full sm:w-auto bg-mboa-gold text-mboa-green font-semibold px-8 py-3.5 rounded-lg hover:bg-yellow-500 transition shadow-lg shadow-black/10"
          >
            Créer mon compte
          </router-link>
          <router-link
            to="/contact"
            class="w-full sm:w-auto border border-white/40 text-white font-medium px-8 py-3.5 rounded-lg hover:bg-white/10 transition"
          >
            Nous contacter
          </router-link>
        </div>
        <p class="text-white/50 text-xs mt-8">
          Gratuit et sans engagement · Annulation flexible sur toutes les
          réservations
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Animation Ken Burns pour l'image de fond du Hero */
@keyframes kenburns {
  0% {
    transform: scale(1) translate(0, 0);
  }
  50% {
    transform: scale(1.12) translate(-1.5%, -1%);
  }
  100% {
    transform: scale(1) translate(0, 0);
  }
}
.kenburns {
  animation: kenburns 22s ease-in-out infinite;
}

/* Motifs flottants */
@keyframes floatY {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-16px);
  }
}
.float-slow {
  animation: floatY 7s ease-in-out infinite;
}
.float-slower {
  animation: floatY 10s ease-in-out infinite;
}

/* Directive v-reveal : état avant/après entrée dans le viewport */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}
.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .kenburns,
  .float-slow,
  .float-slower {
    animation: none;
  }
  .reveal {
    transition: none;
    opacity: 1;
    transform: none;
  }
}
</style>
