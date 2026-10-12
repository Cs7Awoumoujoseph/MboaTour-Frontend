<script setup lang="ts">
import heroFaq from "../assets/hero-landscape.svg";
import { ref, computed, type Directive } from "vue";

// Directive d'animation au scroll — identique aux autres pages
// (idéalement à factoriser dans src/directives/reveal.ts et à enregistrer globalement)
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

type FaqItem = { q: string; a: string };
type FaqCategory = {
  id: string;
  label: string;
  icon: string;
  items: FaqItem[];
};

const categories: FaqCategory[] = [
  {
    id: "voyageurs",
    label: "Voyageurs",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>`,
    items: [
      {
        q: "Comment réserver une visite sur MboaTour ?",
        a: "Choisissez un site depuis la page Explorer, sélectionnez un guide et une date disponible, puis confirmez votre réservation. Vous recevez une confirmation par email avec les coordonnées du guide.",
      },
      {
        q: "Puis-je annuler ou reporter une réservation ?",
        a: "Oui, toutes les réservations peuvent être annulées ou reportées gratuitement jusqu'à 48h avant la visite depuis votre espace « Mes réservations ».",
      },
      {
        q: "Le paiement est-il sécurisé ?",
        a: "Oui, tous les paiements passent par un prestataire certifié. MboaTour ne stocke jamais vos informations bancaires.",
      },
      {
        q: "MboaTour propose-t-il des visites en dehors du Cameroun ?",
        a: "Non, la plateforme se concentre exclusivement sur les sites culturels et naturels du Cameroun.",
      },
    ],
  },
  {
    id: "guides",
    label: "Guides & partenaires",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 19 14.5 19 9.5 C19 5.4 15.9 2.5 12 2.5 C8.1 2.5 5 5.4 5 9.5 C5 14.5 12 21 12 21 Z" /><circle cx="12" cy="9.5" r="2.8" /></svg>`,
    items: [
      {
        q: "Comment devenir guide partenaire ?",
        a: "Rendez-vous sur la page « Devenir guide partenaire » et complétez le formulaire d'inscription. Notre équipe vérifie votre profil sous 48h avant validation.",
      },
      {
        q: "Quelles sont les conditions pour être accepté comme guide ?",
        a: "Une connaissance vérifiable du site proposé, une pièce d'identité valide et, idéalement, une expérience de guidage ou une recommandation locale.",
      },
      {
        q: "Comment MboaTour rémunère-t-il les guides ?",
        a: "Le guide fixe son tarif par visite. MboaTour prélève une commission sur chaque réservation confirmée, versée directement sur le compte du guide après la visite.",
      },
      {
        q: "Puis-je proposer un nouveau site touristique non référencé ?",
        a: "Oui, utilisez le sujet « Signaler un site touristique » du formulaire de contact avec les informations disponibles ; notre équipe contenu vérifie et l'ajoute.",
      },
    ],
  },
  {
    id: "compte",
    label: "Compte & sécurité",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>`,
    items: [
      {
        q: "J'ai oublié mon mot de passe, que faire ?",
        a: "Cliquez sur « Mot de passe oublié » depuis la page de connexion : un lien de réinitialisation vous est envoyé par email sous quelques minutes.",
      },
      {
        q: "Comment supprimer mon compte ?",
        a: "Depuis votre profil, section « Paramètres du compte », l'option « Supprimer mon compte » efface définitivement vos données personnelles sous 30 jours.",
      },
      {
        q: "Mes données personnelles sont-elles partagées ?",
        a: "Non, vos données ne sont jamais revendues. Seules les informations nécessaires (nom, contact) sont partagées avec le guide au moment de la réservation.",
      },
    ],
  },
  {
    id: "technique",
    label: "Support technique",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 3.5 3.5 10.5l4 4 7-7Z" /><path d="M14.5 7.5l2 2 4-4-2-2Z" /><path d="M9 15l-4.5 4.5" /></svg>`,
    items: [
      {
        q: "L'application ne charge pas correctement, que faire ?",
        a: "Vérifiez votre connexion internet, videz le cache de votre navigateur, ou réessayez depuis l'application mobile si le problème persiste sur le site web.",
      },
      {
        q: "Comment signaler un bug ?",
        a: "Utilisez le sujet « Support technique » du formulaire de contact en décrivant précisément l'écran concerné et l'action qui a provoqué le problème.",
      },
    ],
  },
];

const activeCategory = ref(categories[0].id);
const searchQuery = ref("");

// Résultats filtrés par la recherche, tous groupes confondus
const searchResults = computed<{ category: string; item: FaqItem }[]>(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return [];
  const results: { category: string; item: FaqItem }[] = [];
  for (const cat of categories) {
    for (const item of cat.items) {
      if (
        item.q.toLowerCase().includes(q) ||
        item.a.toLowerCase().includes(q)
      ) {
        results.push({ category: cat.label, item });
      }
    }
  }
  return results;
});

const activeCategoryData = computed(
  () => categories.find((c) => c.id === activeCategory.value)!,
);
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
    <!-- HÉRO — FAQ + BARRE DE RECHERCHE                  -->
    <!-- =============================================== -->
    <section
      class="relative bg-mboa-green text-white pt-6 pb-24 px-6 overflow-hidden min-h-[45vh] flex items-center"
    >
      <svg
        width="100%"
        height="12"
        preserveAspectRatio="none"
        class="block absolute top-0 left-0"
      >
        <rect width="100%" height="12" fill="url(#mboa-chevron)" />
      </svg>

      <div class="absolute inset-0 overflow-hidden">
        <div
          class="absolute inset-0 bg-cover bg-center kenburns"
          :style="{ backgroundImage: 'url(' + heroFaq + ')' }"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-b from-mboa-green/90 via-mboa-green/75 to-mboa-green/95"
        ></div>
      </div>

      <div class="relative max-w-2xl mx-auto text-center z-10 w-full">
        <span
          v-reveal
          class="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-xs font-medium tracking-wide uppercase px-3 py-1.5 rounded-full mb-6"
        >
          <span class="w-2 h-2 rounded-full bg-mboa-gold"></span>
          Foire aux questions
        </span>
        <h1
          v-reveal="{ delay: 100 }"
          class="font-poppins text-4xl md:text-5xl font-bold leading-tight mb-4"
        >
          Une question ? On a <span class="text-mboa-gold">sûrement</span> la
          réponse
        </h1>
        <p
          v-reveal="{ delay: 200 }"
          class="text-lg text-white/80 max-w-xl mx-auto mb-8"
        >
          Réservation, guides partenaires, compte, support technique — trouvez
          rapidement ce que vous cherchez.
        </p>

        <!-- Barre de recherche -->
        <div v-reveal="{ delay: 300 }" class="relative max-w-lg mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher une question…"
            class="w-full bg-white text-gray-800 placeholder:text-gray-400 rounded-full pl-12 pr-4 py-3.5 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-mboa-gold dark:bg-gray-900 dark:text-gray-200"
          />
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
    <!-- RÉSULTATS DE RECHERCHE                           -->
    <!-- =============================================== -->
    <section v-if="searchQuery.trim()" class="bg-mboa-cream py-14 dark:bg-gray-800">
      <div class="max-w-3xl mx-auto px-6">
        <p class="text-sm text-gray-500 mb-6 dark:text-gray-400">
          {{ searchResults.length }} résultat{{
            searchResults.length > 1 ? "s" : ""
          }}
          pour « {{ searchQuery }} »
        </p>

        <div
          v-if="searchResults.length === 0"
          class="text-center py-12 bg-white rounded-2xl shadow-sm dark:bg-gray-900"
        >
          <p class="text-gray-500 text-sm mb-1 dark:text-gray-400">
            Aucune réponse ne correspond à votre recherche.
          </p>
          <p class="text-gray-400 text-xs dark:text-gray-500">
            Essayez un autre mot-clé, ou contactez-nous directement.
          </p>
        </div>

        <div v-else class="space-y-3">
          <details
            v-for="(result, i) in searchResults"
            :key="result.item.q"
            v-reveal="{ delay: Math.min(i, 6) * 60 }"
            class="group bg-white rounded-xl p-5 shadow-sm dark:bg-gray-900"
          >
            <summary
              class="flex items-start justify-between gap-4 cursor-pointer list-none"
            >
              <div>
                <span
                  class="text-[11px] uppercase tracking-wide text-mboa-red font-semibold"
                  >{{ result.category }}</span
                >
                <p class="font-medium text-mboa-green text-sm mt-0.5 dark:text-mboa-gold">
                  {{ result.item.q }}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="w-4 h-4 text-mboa-gold flex-shrink-0 mt-1 transition-transform group-open:rotate-45"
              >
                <path stroke-linecap="round" d="M12 5v14M5 12h14" />
              </svg>
            </summary>
            <p class="text-sm text-gray-500 mt-3 leading-relaxed dark:text-gray-400">
              {{ result.item.a }}
            </p>
          </details>
        </div>
      </div>
    </section>

    <!-- =============================================== -->
    <!-- FAQ PAR CATÉGORIE (masqué pendant une recherche) -->
    <!-- =============================================== -->
    <section v-else class="bg-mboa-cream py-14 dark:bg-gray-800">
      <div class="max-w-5xl mx-auto px-6 grid md:grid-cols-4 gap-8">
        <!-- Navigation catégories -->
        <div v-reveal class="md:col-span-1">
          <div
            class="md:sticky md:top-6 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0"
          >
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="activeCategory = cat.id"
              type="button"
              class="flex items-center gap-3 text-left px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
              :class="
                activeCategory === cat.id
                  ? 'bg-mboa-green text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-mboa-green/5 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'"
            >
              <div class="w-4 h-4 flex-shrink-0" v-html="cat.icon"></div>
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Questions de la catégorie active -->
        <div class="md:col-span-3">
          <div v-reveal :key="activeCategoryData.id" class="space-y-3">
            <details
              v-for="item in activeCategoryData.items"
              :key="item.q"
              class="group bg-white rounded-xl p-5 shadow-sm dark:bg-gray-900"
            >
              <summary
                class="flex items-center justify-between gap-4 cursor-pointer list-none font-medium text-mboa-green text-sm dark:text-mboa-gold"
              >
                {{ item.q }}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="w-4 h-4 text-mboa-gold flex-shrink-0 transition-transform group-open:rotate-45"
                >
                  <path stroke-linecap="round" d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p class="text-sm text-gray-500 mt-3 leading-relaxed dark:text-gray-400">
                {{ item.a }}
              </p>
            </details>
          </div>
        </div>
      </div>
    </section>

    <svg width="100%" height="14" preserveAspectRatio="none" class="block">
      <rect width="100%" height="14" fill="url(#mboa-chevron)" />
    </svg>

    <!-- =============================================== -->
    <!-- CTA — QUESTION NON TROUVÉE                       -->
    <!-- =============================================== -->
    <section class="relative bg-mboa-green py-16 px-6 overflow-hidden">
      <div
        class="absolute -right-16 top-1/3 w-56 h-56 rounded-full border border-mboa-gold/10 hidden md:block"
      ></div>

      <div v-reveal class="relative max-w-2xl mx-auto text-center text-white">
        <h2 class="font-poppins text-2xl md:text-3xl font-bold mb-3">
          Vous ne trouvez pas votre réponse&nbsp;?
        </h2>
        <p class="text-white/80 mb-7 max-w-lg mx-auto">
          Notre équipe est disponible pour répondre à toute question spécifique,
          sous 48h.
        </p>
        <router-link
          to="/contact"
          class="inline-block bg-mboa-gold text-mboa-green font-semibold px-8 py-3.5 rounded-lg hover:bg-yellow-500 transition shadow-lg shadow-black/10"
        >
          Contactez-nous
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
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
  .kenburns {
    animation: none;
  }
  .reveal {
    transition: none;
    opacity: 1;
    transform: none;
  }
}
</style>
