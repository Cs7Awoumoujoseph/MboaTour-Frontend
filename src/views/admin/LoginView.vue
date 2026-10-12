<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import logoMboa from '../../assets/icons/icon-mboaTour.jpg'

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const user = await login(email.value, password.value)
    if (user.type !== 'ADMIN') {
      error.value = "Ce compte n'a pas les droits administrateur."
      return
    }
    router.push('/admin')
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Email ou mot de passe incorrect.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-mboa-cream flex items-center justify-center p-4 dark:bg-gray-950">
    <svg width="0" height="0" class="absolute">
      <defs>
        <pattern id="mboa-chevron" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#F5E9D6" />
          <polygon points="0,16 8,4 16,16" fill="#1B3D2A" />
          <polygon points="0,16 8,8 16,16" fill="#D4A017" />
          <polygon points="4,16 8,10 12,16" fill="#C0392B" />
        </pattern>
      </defs>
    </svg>

    <div class="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 dark:bg-gray-900">

      <!-- Panneau latéral — identité de marque -->
      <div class="relative hidden md:flex flex-col justify-between bg-mboa-green text-white p-10 overflow-hidden">
        <svg width="100%" height="10" preserveAspectRatio="none" class="absolute top-0 left-0"><rect width="100%" height="10" fill="url(#mboa-chevron)" /></svg>

        <!-- Motifs décoratifs -->
        <div class="absolute -right-14 -top-10 w-56 h-56 rounded-full border border-white/10"></div>
        <div class="absolute -left-10 bottom-16 w-40 h-40 rounded-full border border-mboa-gold/15"></div>
        <svg class="absolute right-6 bottom-24 w-20 h-20 text-white/5" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 5 L85 25 L85 55 C85 75 68 90 50 95 C32 90 15 75 15 55 L15 25 Z" />
        </svg>

        <div class="relative z-10">
          <img :src="logoMboa" alt="MboaTour" class="w-12 h-12 rounded-full object-cover mb-6" />
          <h2 class="font-poppins text-2xl font-bold leading-snug mb-3">
            Espace <span class="text-mboa-gold">Administrateur</span>
          </h2>
          <p class="text-white/70 text-sm max-w-xs">
            Gérez les sites touristiques, le contenu culturel de la plateforme MboaTour.
          </p>
        </div>

        <div class="relative z-10 flex items-center gap-2 text-xs text-white/60">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4">
            <rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          Connexion réservée au personnel autorisé
        </div>
      </div>

      <!-- Formulaire -->
      <div class="p-8 sm:p-10 flex flex-col justify-center">
        <div class="flex flex-col items-center md:hidden mb-6">
          <img :src="logoMboa" alt="MboaTour" class="w-14 h-14 rounded-full object-cover mb-2" />
          <h1 class="font-poppins text-lg font-bold text-mboa-green dark:text-mboa-gold">Espace Administrateur</h1>
        </div>

        <h1 class="hidden md:block font-poppins text-xl font-bold text-mboa-green mb-1 dark:text-mboa-gold">
          Connexion
        </h1>
        <p class="hidden md:block text-sm text-gray-500 mb-7 dark:text-gray-400">
          Entrez vos identifiants pour accéder au tableau de bord.
        </p>

        <!-- Erreur -->
        <div v-if="error" class="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl p-3.5 mb-5 dark:bg-red-950/30 dark:border-red-900/40">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C0392B" stroke-width="2" class="w-4.5 h-4.5 flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><path d="M12 16h.01" />
          </svg>
          <p class="text-sm text-mboa-red">{{ error }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="text-xs font-medium text-gray-600 block mb-1.5 dark:text-gray-400">Adresse email</label>
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.8" class="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2">
                <path d="M2.25 6.75c0-.966.784-1.75 1.75-1.75h16c.966 0 1.75.784 1.75 1.75v10.5c0 .966-.784 1.75-1.75 1.75h-16a1.75 1.75 0 0 1-1.75-1.75V6.75Z" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              <input
                v-model="email"
                type="email"
                required
                placeholder="admin@mboatour.cm"
                class="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mboa-gold/40 focus:border-mboa-gold transition dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div>
            <label class="text-xs font-medium text-gray-600 block mb-1.5 dark:text-gray-400">Mot de passe</label>
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.8" class="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2">
                <rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full border border-gray-200 rounded-xl pl-11 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mboa-gold/40 focus:border-mboa-gold transition dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4.5 h-4.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4.5 h-4.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs">
            <label class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <input type="checkbox" class="accent-mboa-green w-3.5 h-3.5 rounded" />
              Se souvenir de moi
            </label>
            <a href="#" class="text-mboa-red font-medium hover:underline">Mot de passe oublié ?</a>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-mboa-green text-white font-semibold py-3 rounded-xl hover:bg-green-900 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M12 3a9 9 0 1 0 9 9" />
            </svg>
            {{ loading ? 'Connexion en cours…' : 'Se connecter' }}
          </button>
        </form>

        <p class="text-center text-xs text-gray-400 mt-7">
          Accès réservé aux membres de l'équipe MboaTour.
        </p>
      </div>
    </div>
  </div>
</template>