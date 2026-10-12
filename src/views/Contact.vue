<script setup lang="ts">
import heroContact from "../assets/hero-landscape.svg";
import { ref, type Directive } from "vue";

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

const contactInfo = [
  {
    title: "Adresse",
    value: "Akwa, Douala — Littoral, Cameroun",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 C12 21 19 14.5 19 9.5 C19 5.4 15.9 2.5 12 2.5 C8.1 2.5 5 5.4 5 9.5 C5 14.5 12 21 12 21 Z" /><circle cx="12" cy="9.5" r="2.8" /></svg>`,
  },
  {
    title: "Téléphone",
    value: "+237 6 XX XX XX XX",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 0 0 2.25-2.25v-1.372a1.5 1.5 0 0 0-1.157-1.46l-3.507-.876a1.5 1.5 0 0 0-1.516.42l-1.02 1.02a11.25 11.25 0 0 1-5.876-5.876l1.02-1.02a1.5 1.5 0 0 0 .42-1.516l-.876-3.507a1.5 1.5 0 0 0-1.46-1.157H4.5A2.25 2.25 0 0 0 2.25 6.75Z" /></svg>`,
  },
  {
    title: "Email",
    value: "contact@mboatour.cm",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.25 6.75c0-.966.784-1.75 1.75-1.75h16c.966 0 1.75.784 1.75 1.75v10.5c0 .966-.784 1.75-1.75 1.75h-16a1.75 1.75 0 0 1-1.75-1.75V6.75Z" /><path d="m3 7 9 6 9-6" /></svg>`,
  },
  {
    title: "Horaires",
    value: "Lun – Ven, 8h – 18h",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>`,
  },
];

const subjects = [
  "Question générale",
  "Devenir guide partenaire",
  "Signaler un site touristique",
  "Partenariat / presse",
  "Support technique",
];

const faqs = [
  {
    q: "Comment devenir guide partenaire sur MboaTour ?",
    a: "Choisissez « Devenir guide partenaire » dans le formulaire ci-dessus, ou rendez-vous directement sur notre page dédiée. Notre équipe vous recontacte sous 48h pour la vérification de votre profil.",
  },
  {
    q: "MboaTour est-il disponible en dehors du Cameroun ?",
    a: "La plateforme référence des sites au Cameroun, mais elle est accessible aux voyageurs du monde entier souhaitant préparer leur visite.",
  },
  {
    q: "Puis-je signaler une erreur sur une fiche de site ?",
    a: "Oui, utilisez le sujet « Signaler un site touristique » dans le formulaire : votre message est transmis directement à l'équipe contenu.",
  },
];

const form = ref({ name: "", email: "", subject: subjects[0], message: "" });
const status = ref<"idle" | "sending" | "sent" | "error">("idle");

async function submitForm() {
  status.value = "sending";
  try {
    // TODO: brancher sur l'endpoint backend réel (ex: contactApi.send(form.value))
    await new Promise((resolve) => setTimeout(resolve, 900));
    status.value = "sent";
    form.value = { name: "", email: "", subject: subjects[0], message: "" };
  } catch {
    status.value = "error";
  }
}
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
    <!-- HÉRO — CONTACT                                   -->
    <!-- =============================================== -->
    <section
      class="relative bg-mboa-green text-white pt-6 pb-20 px-6 overflow-hidden min-h-[45vh] flex items-center"
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
          :style="{ backgroundImage: 'url(' + heroContact + ')' }"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-b from-mboa-green/90 via-mboa-green/75 to-mboa-green/95"
        ></div>
      </div>

      <div class="relative max-w-3xl mx-auto text-center z-10">
        <span
          v-reveal
          class="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-xs font-medium tracking-wide uppercase px-3 py-1.5 rounded-full mb-6"
        >
          <span class="w-2 h-2 rounded-full bg-mboa-gold"></span>
          Contact
        </span>
        <h1
          v-reveal="{ delay: 100 }"
          class="font-poppins text-4xl md:text-5xl font-bold leading-tight mb-4"
        >
          Parlons de votre
          <span class="text-mboa-gold">prochaine découverte</span>
        </h1>
        <p
          v-reveal="{ delay: 200 }"
          class="text-lg text-white/80 max-w-2xl mx-auto"
        >
          Une question, un partenariat, ou envie de devenir guide ? Notre équipe
          vous répond sous 48h.
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
    <!-- FORMULAIRE + INFOS DE CONTACT                    -->
    <!-- =============================================== -->
    <section class="bg-mboa-cream py-16 dark:bg-gray-800">
      <div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-5 gap-8">
        <!-- Formulaire -->
        <div
          v-reveal
          class="lg:col-span-3 bg-white rounded-2xl shadow-sm p-6 md:p-8 dark:bg-gray-900"
        >
          <h2 class="font-poppins text-xl font-bold text-mboa-green mb-1 dark:text-mboa-gold">
            Envoyez-nous un message
          </h2>
          <p class="text-sm text-gray-500 mb-6 dark:text-gray-400">
            Tous les champs marqués d'un * sont obligatoires.
          </p>

          <!-- Confirmation d'envoi -->
          <div
            v-if="status === 'sent'"
            class="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4 mb-6 dark:bg-green-900/20 dark:border-green-800/40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="w-5 h-5 flex-shrink-0 mt-0.5 text-mboa-green dark:text-mboa-gold"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
            <div>
              <p class="text-sm font-medium text-mboa-green dark:text-mboa-gold">
                Message envoyé avec succès
              </p>
              <p class="text-xs text-gray-500 mt-0.5 dark:text-gray-400">
                Nous vous répondrons à l'adresse indiquée sous 48h.
              </p>
            </div>
          </div>

          <!-- Erreur d'envoi -->
          <div
            v-if="status === 'error'"
            class="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 mb-6 dark:bg-red-900/20 dark:border-red-800/40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="w-5 h-5 flex-shrink-0 mt-0.5 text-mboa-red dark:text-red-400"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5" />
              <path d="M12 16h.01" />
            </svg>
            <div>
              <p class="text-sm font-medium text-mboa-red dark:text-red-400">
                Une erreur est survenue
              </p>
              <p class="text-xs text-gray-500 mt-0.5 dark:text-gray-400">
                Merci de réessayer, ou de nous écrire directement par email.
              </p>
            </div>
          </div>

          <form @submit.prevent="submitForm" class="space-y-5">
            <div class="grid sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5 dark:text-gray-400"
                  >Nom complet *</label
                >
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="Votre nom"
                  class="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mboa-gold/50 focus:border-mboa-gold dark:border-gray-700"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1.5 dark:text-gray-400"
                  >Email *</label
                >
                <input
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="vous@exemple.com"
                  class="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mboa-gold/50 focus:border-mboa-gold dark:border-gray-700"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5 dark:text-gray-400"
                >Sujet *</label
              >
              <select
                v-model="form.subject"
                class="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mboa-gold/50 focus:border-mboa-gold bg-white dark:bg-gray-900 dark:border-gray-700"
              >
                <option v-for="s in subjects" :key="s" :value="s">
                  {{ s }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1.5 dark:text-gray-400"
                >Message *</label
              >
              <textarea
                v-model="form.message"
                required
                rows="5"
                placeholder="Décrivez votre demande…"
                class="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-mboa-gold/50 focus:border-mboa-gold dark:border-gray-700"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="status === 'sending'"
              class="w-full sm:w-auto bg-mboa-green text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-900 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg
                v-if="status === 'sending'"
                class="w-4 h-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" d="M12 3a9 9 0 1 0 9 9" />
              </svg>
              {{
                status === "sending" ? "Envoi en cours…" : "Envoyer le message"
              }}
            </button>
          </form>
        </div>

        <!-- Infos de contact -->
        <div class="lg:col-span-2 flex flex-col gap-4">
          <div
            v-for="(info, i) in contactInfo"
            :key="info.title"
            v-reveal="{ delay: i * 100 }"
            class="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm dark:bg-gray-900"
          >
            <div
              class="w-11 h-11 rounded-full bg-mboa-green/10 text-mboa-green flex items-center justify-center flex-shrink-0 dark:text-mboa-gold"
            >
              <div class="w-5 h-5" v-html="info.icon"></div>
            </div>
            <div>
              <p class="text-xs text-gray-400 dark:text-gray-500">{{ info.title }}</p>
              <p class="text-sm font-medium text-gray-800 mt-0.5 dark:text-gray-200">
                {{ info.value }}
              </p>
            </div>
          </div>

          <!-- Réseaux sociaux -->
          <div
            v-reveal="{ delay: 400 }"
            class="bg-mboa-green rounded-2xl p-5 text-white"
          >
            <p class="text-sm font-medium mb-3">Suivez-nous</p>
            <div class="flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    d="M13.5 22v-8.5h2.85l.43-3.31h-3.28V8.05c0-.96.27-1.61 1.64-1.61h1.75V3.49c-.3-.04-1.34-.13-2.55-.13-2.52 0-4.25 1.54-4.25 4.36v2.43H7v3.31h2.59V22h3.91Z"
                  />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  class="w-4 h-4"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="0.5"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.4-1.42a9.9 9.9 0 0 0 4.64 1.18h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.17-1.55-1.17-2.96 0-1.4.74-2.09 1-2.38.26-.28.57-.35.76-.35h.55c.18 0 .42-.03.65.5.24.55.8 1.92.87 2.06.07.14.12.3.02.49-.1.19-.15.3-.29.46-.14.16-.3.36-.43.48-.14.14-.29.29-.13.57.17.28.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.32 1.44.28.14.44.12.6-.07.17-.19.7-.82.89-1.1.19-.28.38-.23.64-.14.26.1 1.65.78 1.94.92.28.14.47.21.54.33.07.12.07.68-.16 1.36Z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <svg width="100%" height="14" preserveAspectRatio="none" class="block">
      <rect width="100%" height="14" fill="url(#mboa-chevron)" />
    </svg>

    <!-- =============================================== -->
    <!-- CARTE (placeholder)                              -->
    <!-- =============================================== -->
    <section class="bg-white py-16 dark:bg-gray-900">
      <div class="max-w-6xl mx-auto px-6">
        <div v-reveal class="text-center mb-8">
          <span
            class="text-xs font-semibold tracking-widest uppercase text-mboa-red"
            >Nous trouver</span
          >
          <h2
            class="font-poppins text-2xl md:text-3xl font-bold text-mboa-green mt-2 dark:text-mboa-gold"
          >
            Notre localisation
          </h2>
        </div>
        <div
          v-reveal="{ delay: 150 }"
          class="relative rounded-2xl overflow-hidden h-72 md:h-96 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <!-- TODO: remplacer par une vraie iframe Google Maps / Mapbox une fois l'adresse définitive connue -->
          <iframe
            title="Localisation MboaTour"
            class="w-full h-full"
            style="border: 0"
            loading="lazy"
            src="https://www.openstreetmap.org/export/embed.html?bbox=9.65%2C4.03%2C9.75%2C4.09&layer=mapnik&marker=4.06%2C9.70"
          ></iframe>
        </div>
      </div>
    </section>

    <!-- =============================================== -->
    <!-- FAQ                                              -->
    <!-- =============================================== -->
    <section class="bg-mboa-cream py-16 dark:bg-gray-800">
      <div class="max-w-3xl mx-auto px-6">
        <div v-reveal class="text-center mb-10">
          <span
            class="text-xs font-semibold tracking-widest uppercase text-mboa-red"
            >Avant d'écrire</span
          >
          <h2
            class="font-poppins text-2xl md:text-3xl font-bold text-mboa-green mt-2 dark:text-mboa-gold"
          >
            Questions fréquentes
          </h2>
        </div>
        <div class="space-y-4">
          <details
            v-for="(faq, i) in faqs"
            :key="faq.q"
            v-reveal="{ delay: i * 100 }"
            class="group bg-white rounded-xl p-5 shadow-sm dark:bg-gray-900"
          >
            <summary
              class="flex items-center justify-between cursor-pointer list-none font-medium text-mboa-green text-sm dark:text-mboa-gold"
            >
              {{ faq.q }}
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
              {{ faq.a }}
            </p>
          </details>
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
