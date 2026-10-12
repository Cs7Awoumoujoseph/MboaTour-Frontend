<script setup>
import { ref } from 'vue'
import logoMboa from '../../assets/icons/icon-mboaTour.jpg'

const newsletterEmail = ref('')
const subscribed = ref(false)

function subscribeNewsletter() {
  if (!newsletterEmail.value) return
  // TODO: brancher sur l'endpoint newsletter réel
  subscribed.value = true
  newsletterEmail.value = ''
}
</script>

<template>
  <footer class="relative bg-mboa-green text-white dark:bg-gray-900 overflow-hidden">
    <svg width="0" height="0" class="absolute">
      <defs>
        <pattern id="mboa-chevron-footer" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#F5E9D6" />
          <polygon points="0,16 8,4 16,16" fill="#1B3D2A" />
          <polygon points="0,16 8,8 16,16" fill="#D4A017" />
          <polygon points="4,16 8,10 12,16" fill="#C0392B" />
        </pattern>
      </defs>
    </svg>

    <!-- Liseré chevron en tête de footer -->
    <svg width="100%" height="10" preserveAspectRatio="none" class="block"><rect width="100%" height="10" fill="url(#mboa-chevron-footer)" /></svg>

    <!-- Motif décoratif discret -->
    <svg class="absolute -right-10 bottom-0 w-56 h-56 text-white/[0.03] hidden lg:block" viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 5 L85 25 L85 55 C85 75 68 90 50 95 C32 90 15 75 15 55 L15 25 Z" />
    </svg>

    <div class="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 gap-10 md:grid-cols-4 relative">

      <!-- Logo + description -->
      <div class="col-span-2 md:col-span-1">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-mboa-cream flex items-center justify-center overflow-hidden flex-shrink-0">
            <img :src="logoMboa" alt="MboaTour Logo" class="w-full h-full object-cover" />
          </div>
          <div>
            <span class="font-poppins font-bold text-lg leading-none block">MboaTour</span>
            <span class="text-[10px] font-semibold tracking-wide text-mboa-gold">CULTURAL TOURISM APP</span>
          </div>
        </div>
        <p class="text-sm text-white/60 leading-relaxed mb-5">
          La plateforme qui vous connecte au meilleur du tourisme culturel camerounais.
        </p>

        <!-- Réseaux sociaux -->
        <div class="flex gap-2.5">
          <a href="#" aria-label="Facebook" class="w-9 h-9 rounded-full bg-white/10 hover:bg-mboa-gold hover:text-mboa-green transition flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M13.5 22v-8.5h2.85l.43-3.31h-3.28V8.05c0-.96.27-1.61 1.64-1.61h1.75V3.49c-.3-.04-1.34-.13-2.55-.13-2.52 0-4.25 1.54-4.25 4.36v2.43H7v3.31h2.59V22h3.91Z"/></svg>
          </a>
          <a href="#" aria-label="Instagram" class="w-9 h-9 rounded-full bg-white/10 hover:bg-mboa-gold hover:text-mboa-green transition flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" /></svg>
          </a>
          <a href="#" aria-label="WhatsApp" class="w-9 h-9 rounded-full bg-white/10 hover:bg-mboa-gold hover:text-mboa-green transition flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.4-1.42a9.9 9.9 0 0 0 4.64 1.18h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.17-1.55-1.17-2.96 0-1.4.74-2.09 1-2.38.26-.28.57-.35.76-.35h.55c.18 0 .42-.03.65.5.24.55.8 1.92.87 2.06.07.14.12.3.02.49-.1.19-.15.3-.29.46-.14.16-.3.36-.43.48-.14.14-.29.29-.13.57.17.28.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.32 1.44.28.14.44.12.6-.07.17-.19.7-.82.89-1.1.19-.28.38-.23.64-.14.26.1 1.65.78 1.94.92.28.14.47.21.54.33.07.12.07.68-.16 1.36Z"/></svg>
          </a>
        </div>
      </div>

      <!-- Liens utiles -->
      <div>
        <h4 class="font-poppins font-semibold text-sm mb-4 pb-2 border-b-2 border-mboa-gold inline-block">Liens utiles</h4>
        <ul class="space-y-2.5 text-sm text-white/70">
          <li><router-link to="/" class="hover:text-mboa-gold transition">Accueil</router-link></li>
          <li><router-link to="/explorer" class="hover:text-mboa-gold transition">Explorer</router-link></li>
          <li><router-link to="/a-propos" class="hover:text-mboa-gold transition">À propos</router-link></li>
          <li><router-link to="/faq" class="hover:text-mboa-gold transition">Foire aux questions</router-link></li>
        </ul>
      </div>

      <!-- Contact -->
      <div>
        <h4 class="font-poppins font-semibold text-sm mb-4 pb-2 border-b-2 border-mboa-gold inline-block">Contact</h4>
        <ul class="space-y-2.5 text-sm text-white/70">
          <li><router-link to="/contact" class="hover:text-mboa-gold transition">Nous contacter</router-link></li>
          <li>
            <a href="mailto:contact@mboatour.cm" class="hover:text-mboa-gold transition">contact@mboatour.cm</a>
          </li>
          <li>
            <a href="tel:+237600000000" class="hover:text-mboa-gold transition">+237 6 XX XX XX XX</a>
          </li>
          <li class="text-white/50">Akwa, Douala — Cameroun</li>
        </ul>
      </div>

      <!-- Newsletter -->
      <div class="col-span-2 md:col-span-1">
        <h4 class="font-poppins font-semibold text-sm mb-2">Restez informé</h4>
        <p class="text-xs text-white/50 mb-4">
          Recevez nos meilleures offres et idées de voyage.
        </p>

        <form v-if="!subscribed" @submit.prevent="subscribeNewsletter" class="flex">
          <input
            v-model="newsletterEmail"
            type="email"
            required
            placeholder="Votre adresse e-mail"
            class="rounded-l-xl px-3.5 py-2.5 bg-white text-gray-800 text-sm w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-mboa-gold dark:bg-gray-800 dark:text-gray-200 dark:border dark:border-gray-700"
          />
          <button
            type="submit"
            class="bg-mboa-gold text-mboa-green font-semibold px-4 hover:bg-yellow-500 rounded-r-xl text-sm transition whitespace-nowrap"
          >
            S'abonner
          </button>
        </form>
        <div v-else class="flex items-center gap-2 bg-white/10 rounded-xl px-3.5 py-2.5 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#D4A017" stroke-width="2" class="w-4 h-4 flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          Merci ! Vous êtes inscrit(e).
        </div>
      </div>
    </div>

    <!-- Copyright -->
    <div class="relative max-w-7xl mx-auto px-6 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
      <p>© 2026 MboaTour. Tous droits réservés.</p>
      <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
        <router-link to="/mentions-legales" class="hover:text-mboa-gold transition">Mentions légales</router-link>
        <router-link to="/confidentialite" class="hover:text-mboa-gold transition">Politique de confidentialité</router-link>
        <router-link to="/conditions" class="hover:text-mboa-gold transition">Conditions d'utilisation</router-link>
      </div>
    </div>
  </footer>
</template>