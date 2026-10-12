<script setup lang="ts">
import heroAbout from "../assets/hero-landscape.svg";
import type { Directive } from "vue";

// Directive d'animation au scroll — identique à celle de HomeView.vue
// (si tu l'as déjà extraite dans un fichier partagé, importe-la depuis là plutôt que de la dupliquer ici)
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

// Valeurs de la marque (charte graphique MboaTour)
const values = [
  {
    title: "Exploration",
    description:
      "Encourager la découverte de sites méconnus, au-delà des circuits touristiques classiques.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="12" r="3" /><path d="M4 38 L18 18 L26 28 L32 20 L44 38 Z" /><path d="M4 38 L44 38" /></svg>`,
  },
  {
    title: "Culture",
    description:
      "Mettre en valeur le patrimoine, les traditions et les récits qui font la richesse du Cameroun.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 34 C9 22, 9 16, 24 10 C39 16, 39 22, 39 34" /><path d="M24 10 L24 40" /><path d="M14 40 L34 40" /></svg>`,
  },
  {
    title: "Authenticité",
    description:
      "Travailler avec de vrais guides locaux pour des expériences fidèles à la réalité du terrain.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="18" /><path d="M24 14 a10 10 0 0 1 0 20 a5 5 0 0 1 0 -10 a2.5 2.5 0 0 0 0 -5" /></svg>`,
  },
  {
    title: "Confiance",
    description:
      "Des informations vérifiées et des partenaires locaux sélectionnés avec rigueur.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10 L24 6 L36 10 L36 24 C36 34 30 40 24 42 C18 40 12 34 12 24 Z" /><path d="M17 24 L22 29 L31 18" /></svg>`,
  },
];

const stats = [
  { value: "120+", label: "Sites référencés" },
  { value: "45", label: "Guides certifiés" },
  { value: "10", label: "Régions couvertes" },
  { value: "4.8/5", label: "Note moyenne voyageurs" },
];

// Équipe — à remplacer par les vrais membres et photos
const team = [
  {
    name: "Hermann L.",
    role: "Fondateur et Directeur",
    photo: "https://picsum.photos/seed/mboa-team-1/300/300",
  },
  {
    name: "Awoumou Joseph",
    role: "Fondateur et Directeur Adjoin",
    photo: "https://picsum.photos/seed/mboa-team-2/300/300",
  },
  {
    name: "Larissa M.",
    role: "Responsable contenu culturel",
    photo: "https://picsum.photos/seed/mboa-team-3/300/300",
  },
];
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
    <!-- HÉRO — À PROPOS                                  -->
    <!-- =============================================== -->
    <section
      class="relative bg-mboa-green text-white pt-6 pb-24 px-6 overflow-hidden min-h-[55vh] flex items-center"
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
          :style="{ backgroundImage: 'url(' + heroAbout + ')' }"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-b from-mboa-green/90 via-mboa-green/75 to-mboa-green/95"
        ></div>
      </div>

      <svg
        class="absolute right-[8%] top-[15%] w-28 h-28 text-white/10 hidden md:block float-slow"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path
          d="M50 5 L85 25 L85 55 C85 75 68 90 50 95 C32 90 15 75 15 55 L15 25 Z"
        />
      </svg>

      <div class="relative max-w-3xl mx-auto text-center z-10">
        <span
          v-reveal
          class="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-xs font-medium tracking-wide uppercase px-3 py-1.5 rounded-full mb-6"
        >
          <span class="w-2 h-2 rounded-full bg-mboa-gold"></span>
          À propos de nous
        </span>
        <h1
          v-reveal="{ delay: 100 }"
          class="font-poppins text-4xl md:text-5xl font-bold leading-tight mb-4"
        >
          Faire vivre le <span class="text-mboa-gold">Cameroun</span> autrement
        </h1>
        <p
          v-reveal="{ delay: 200 }"
          class="text-lg text-white/80 max-w-2xl mx-auto"
        >
          MboaTour est une plateforme numérique conçue pour promouvoir le
          tourisme culturel et naturel du Cameroun, en connectant voyageurs,
          guides locaux et destinations authentiques.
        </p>
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
    <!-- NOTRE HISTOIRE                                   -->
    <!-- =============================================== -->
    <section class="bg-mboa-cream py-16 dark:bg-gray-800">
      <div
        class="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center"
      >
        <div v-reveal>
          <span
            class="text-xs font-semibold tracking-widest uppercase text-mboa-red"
            >Notre histoire</span
          >
          <h2
            class="font-poppins text-2xl md:text-3xl font-bold text-mboa-green mt-2 mb-4 dark:text-mboa-gold"
          >
            Un pays riche, encore trop peu raconté
          </h2>
          <p class="text-gray-600 leading-relaxed mb-3 dark:text-gray-400">
            Le Cameroun est souvent surnommé « l'Afrique en miniature » pour la
            diversité de ses paysages, ses cultures et ses traditions. Pourtant,
            une grande partie de ce patrimoine reste difficile d'accès pour les
            voyageurs comme pour les Camerounais eux-mêmes.
          </p>
          <p class="text-gray-600 leading-relaxed dark:text-gray-400">
            MboaTour est né de cette conviction simple : chaque site, chaque
            tradition, chaque guide local mérite une vitrine fiable, moderne et
            fidèle à sa véritable identité culturelle.
          </p>
        </div>
        <div
          v-reveal="{ delay: 150 }"
          class="relative rounded-2xl overflow-hidden h-72 md:h-80 shadow-sm"
        >
          <img
            src="https://picsum.photos/seed/mboa-story/700/600"
            alt="Paysage culturel camerounais"
            class="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>

    <!-- =============================================== -->
    <!-- NOS VALEURS                                      -->
    <!-- =============================================== -->
    <section class="bg-white py-16 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-6">
        <div v-reveal class="text-center mb-12">
          <span
            class="text-xs font-semibold tracking-widest uppercase text-mboa-red"
            >Ce qui nous guide</span
          >
          <h2
            class="font-poppins text-2xl md:text-3xl font-bold text-mboa-green mt-2 dark:text-mboa-gold"
          >
            Nos valeurs
          </h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div
            v-for="(value, i) in values"
            :key="value.title"
            v-reveal="{ delay: i * 100 }"
            class="flex flex-col items-center text-center bg-mboa-cream/60 dark:bg-gray-700/60 rounded-2xl p-6 border border-transparent hover:border-mboa-gold/30 transition-all"
          >
            <div
              class="w-14 h-14 rounded-full bg-mboa-green text-mboa-gold flex items-center justify-center mb-4"
            >
              <div class="w-7 h-7" v-html="value.icon"></div>
            </div>
            <h3 class="font-poppins font-semibold text-mboa-green mb-1 dark:text-mboa-gold">
              {{ value.title }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ value.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <svg width="100%" height="14" preserveAspectRatio="none" class="block">
      <rect width="100%" height="14" fill="url(#mboa-chevron)" />
    </svg>

    <!-- =============================================== -->
    <!-- CHIFFRES CLÉS                                    -->
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
    <!-- L'ÉQUIPE                                         -->
    <!-- =============================================== -->
    <section class="bg-mboa-cream py-16 dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-6">
        <div v-reveal class="text-center mb-12">
          <span
            class="text-xs font-semibold tracking-widest uppercase text-mboa-red"
            >Derrière MboaTour</span
          >
          <h2
            class="font-poppins text-2xl md:text-3xl font-bold text-mboa-green mt-2 dark:text-mboa-gold"
          >
            L'équipe
          </h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div
            v-for="(member, i) in team"
            :key="member.name"
            v-reveal="{ delay: i * 120 }"
            class="bg-white rounded-2xl p-6 text-center shadow-sm dark:bg-gray-900"
          >
            <img
              :src="member.photo"
              :alt="member.name"
              class="w-20 h-20 rounded-full object-cover mx-auto mb-4"
            />
            <p class="font-poppins font-semibold text-mboa-green dark:text-mboa-gold">
              {{ member.name }}
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500">{{ member.role }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- =============================================== -->
    <!-- CTA FINAL                                        -->
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
      <div
        class="absolute -left-16 top-1/3 w-48 h-48 rounded-full border border-mboa-gold/10 hidden md:block"
      ></div>

      <div v-reveal class="relative max-w-3xl mx-auto text-center text-white">
        <h2
          class="font-poppins text-3xl md:text-4xl font-bold mb-4 leading-tight"
        >
          Envie de <span class="text-mboa-gold">contribuer</span> à
          l'aventure&nbsp;?
        </h2>
        <p class="text-white/80 mb-9 max-w-xl mx-auto">
          Que vous soyez guide local, gestionnaire de site touristique ou
          simplement passionné du Cameroun, MboaTour a besoin de vous pour
          raconter le pays sous son vrai visage.
        </p>
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <router-link
            to="/contact"
            class="w-full sm:w-auto border border-white/40 text-white font-medium px-8 py-3.5 rounded-lg hover:bg-white/10 transition"
          >
            Nous contacter
          </router-link>
        </div>
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
  .float-slow {
    animation: none;
  }
  .reveal {
    transition: none;
    opacity: 1;
    transform: none;
  }
}
</style>
