<script setup>
import { useRoute } from "vue-router";
import { onMounted, ref, watch } from "vue";
import { useAuthModal } from "../../composables/useAuthModal";
import { useAuth } from "../../composables/useAuth";
import { useRouter } from "vue-router";
import { loginUser, useUsers } from "../../composables/useUsers.ts";

const { emailExists, registerUser, findByCredentials } = useUsers();
const router = useRouter();
const { isOpen, mode, close, goToAdmin } = useAuthModal();
const { setUser } = useAuth();
const name = ref("");
const role = ref("VISITEUR");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const rememberMe = ref(true);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const error = ref("");
//compte de demo
const DEMO_ADMIN = { email: "admin@gmail.com", password: "a" };

async function handleSubmit() {
  error.value = "";

  if (mode.value === "register") {
    if (
      !name.value ||
      !email.value ||
      !password.value ||
      !confirmPassword.value
    ) {
      error.value = "Veuillez remplir tous les champs.";
      return;
    }
    if (password.value !== confirmPassword.value) {
      error.value = "Les mots de passe ne correspondent pas.";
      return;
    }

    try {
      const newUser = await registerUser({
        nom: name.value,
        email: email.value,
        motDePasse: password.value,
        type: role.value,
      });
      setUser({
        id: newUser.id,
        nom: newUser.nom,
        email: newUser.email,
        type: newUser.type,
      });
      resetForm();
      close();
    } catch (err) {
      error.value = "Erreur lors de l'inscription.";
      console.error(err);
    }
    return;
  }

  // Connexion : on vérifie si c'est le compte admin de démo
  const isAdmin =
    email.value === DEMO_ADMIN.email && password.value === DEMO_ADMIN.password;

  if (isAdmin) {
    setUser({
      id: 0,
      nom: "Hermann&joseph",
      email: DEMO_ADMIN.email,
      type: "ADMIN",
    });
    resetForm();
    close();
    router.push("/admin");
    return;
  }

  try {
    const foundUser = await loginUser(email.value, password.value);
    setUser({
      id: foundUser.id,
      nom: foundUser.nom,
      email: foundUser.email,
      type: foundUser.type,
    });
    resetForm();
    close();
  } catch (err) {
    error.value = "Email ou mot de passe incorrect.";
    console.error(err);
  }
}

function resetForm() {
  name.value = "";
  email.value = "";
  password.value = "";
  confirmPassword.value = "";
  role.value = "VISITEUR";
  error.value = "";
}
watch(mode, () => {
  role.value = "VISITEUR";
  error.value = "";
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        @click.self="close"
        class="fixed inset-0 bg-mboa-green/30 backdrop-blur-sm z-[100] flex items-center justify-center px-4 py-8 overflow-y-auto"
      >
        <div
          class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative dark:bg-gray-900 overflow-hidden my-auto grid md:grid-cols-5"
        >
          <svg width="0" height="0" class="absolute">
            <defs>
              <pattern
                id="mboa-chevron-modal"
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

          <button
            @click="close"
            aria-label="Fermer"
            class="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-white flex items-center justify-center transition md:bg-white/10 md:hover:bg-white/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="w-4 h-4"
            >
              <path stroke-linecap="round" d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>

          <!-- Panneau latéral — identité de marque (desktop uniquement) -->
          <div
            class="relative hidden md:flex md:col-span-2 flex-col justify-between bg-mboa-green text-white p-9 overflow-hidden"
          >
            <svg
              width="100%"
              height="10"
              preserveAspectRatio="none"
              class="absolute top-0 left-0"
            >
              <rect width="100%" height="10" fill="url(#mboa-chevron-modal)" />
            </svg>

            <div
              class="absolute -right-14 -top-10 w-56 h-56 rounded-full border border-white/10"
            ></div>
            <div
              class="absolute -left-10 bottom-16 w-40 h-40 rounded-full border border-mboa-gold/15"
            ></div>
            <svg
              class="absolute right-6 bottom-24 w-20 h-20 text-white/5"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path
                d="M50 5 L85 25 L85 55 C85 75 68 90 50 95 C32 90 15 75 15 55 L15 25 Z"
              />
            </svg>

            <div class="relative z-10">
              <div
                class="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="w-6 h-6 text-mboa-gold"
                >
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path
                    d="M8 11 L8 7 C8 4.8 9.8 3 12 3 C14.2 3 16 4.8 16 7 L16 11"
                  />
                </svg>
              </div>
              <h2 class="font-poppins text-2xl font-bold leading-snug mb-3">
                {{ mode === "login" ? "Content de vous revoir" : "Rejoignez" }}
                <span class="text-mboa-gold">{{
                  mode === "login" ? "" : " MboaTour"
                }}</span>
              </h2>
              <p class="text-white/70 text-sm max-w-xs">
                {{
                  mode === "login"
                    ? "Connectez-vous pour retrouver vos favoris, vos avis et vos administrateurs préférés."
                    : "Créez votre compte pour voir l'itinéraire et sauvegarder vos sites favoris ."
                }}
              </p>
            </div>

            <div
              class="relative z-10 flex flex-col gap-2 text-xs text-white/60"
            >
              <span class="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D4A017"
                  stroke-width="2"
                  class="w-3.5 h-3.5"
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
                  class="w-3.5 h-3.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
                Amins vérifiés
              </span>
            </div>
          </div>

          <!-- Formulaire -->
          <div
            class="md:col-span-3 px-7 sm:px-10 py-9 max-h-[85vh] overflow-y-auto"
          >
            <div class="mb-6">
              <h2
                class="font-poppins text-2xl font-bold text-mboa-green dark:text-mboa-gold"
              >
                {{ mode === "login" ? "Se connecter" : "Créer un compte" }}
              </h2>
              <p class="text-sm text-gray-500 mt-1 dark:text-gray-400">
                {{
                  mode === "login"
                    ? "Bienvenue sur MboaTour ! Connectez-vous à votre compte."
                    : "Rejoignez MboaTour en quelques secondes."
                }}
              </p>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-5">
              <div
                :class="mode === 'register' ? 'grid sm:grid-cols-2 gap-5' : ''"
              >
                <div v-if="mode === 'register'">
                  <label
                    class="text-xs font-medium text-gray-600 block mb-1.5 dark:text-gray-400"
                    >Nom complet</label
                  >
                  <div class="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9CA3AF"
                      stroke-width="1.8"
                      class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                    >
                      <circle cx="12" cy="8" r="3.5" />
                      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
                    </svg>
                    <input
                      v-model="name"
                      type="text"
                      required
                      placeholder="Votre nom"
                      class="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mboa-gold/40 focus:border-mboa-gold transition dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label
                    class="text-xs font-medium text-gray-600 block mb-1.5 dark:text-gray-400"
                    >Email</label
                  >
                  <div class="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9CA3AF"
                      stroke-width="1.8"
                      class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                    >
                      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
                      <path d="M4 6.5 L12 13 L20 6.5" />
                    </svg>
                    <input
                      v-model="email"
                      type="email"
                      required
                      placeholder="votre@email.com"
                      class="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mboa-gold/40 focus:border-mboa-gold transition dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div
                :class="mode === 'register' ? 'grid sm:grid-cols-2 gap-5' : ''"
              >
                <div>
                  <label
                    class="text-xs font-medium text-gray-600 block mb-1.5 dark:text-gray-400"
                    >Mot de passe</label
                  >
                  <div class="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9CA3AF"
                      stroke-width="1.8"
                      class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                    >
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path
                        d="M8 11 L8 7 C8 4.8 9.8 3 12 3 C14.2 3 16 4.8 16 7 L16 11"
                      />
                    </svg>
                    <input
                      v-model="password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      placeholder="••••••••••"
                      class="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mboa-gold/40 focus:border-mboa-gold transition dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500"
                      :aria-label="
                        showPassword
                          ? 'Masquer le mot de passe'
                          : 'Afficher le mot de passe'
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        class="w-4 h-4"
                      >
                        <path
                          d="M2 12 C4 7 8 4.5 12 4.5 C16 4.5 20 7 22 12 C20 17 16 19.5 12 19.5 C8 19.5 4 17 2 12 Z"
                        />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div v-if="mode === 'register'">
                  <label
                    class="text-xs font-medium text-gray-600 block mb-1.5 dark:text-gray-400"
                    >Confirmer le mot de passe</label
                  >
                  <div class="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9CA3AF"
                      stroke-width="1.8"
                      class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                    >
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path
                        d="M8 11 L8 7 C8 4.8 9.8 3 12 3 C14.2 3 16 4.8 16 7 L16 11"
                      />
                    </svg>
                    <input
                      v-model="confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      required
                      placeholder="••••••••••"
                      class="w-full border rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mboa-gold/40 transition dark:bg-gray-800 dark:text-gray-200"
                      :class="
                        confirmPassword && password !== confirmPassword
                          ? 'border-mboa-red focus:border-mboa-red'
                          : 'border-gray-200 focus:border-mboa-gold'
                      "
                    />
                    <button
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500"
                      :aria-label="
                        showConfirmPassword
                          ? 'Masquer le mot de passe'
                          : 'Afficher le mot de passe'
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        class="w-4 h-4"
                      >
                        <path
                          d="M2 12 C4 7 8 4.5 12 4.5 C16 4.5 20 7 22 12 C20 17 16 19.5 12 19.5 C8 19.5 4 17 2 12 Z"
                        />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                  <p
                    v-if="confirmPassword && password !== confirmPassword"
                    class="text-xs text-mboa-red mt-1.5 flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="w-3.5 h-3.5"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8v5" />
                      <path d="M12 16h.01" />
                    </svg>
                    Les mots de passe ne correspondent pas.
                  </p>
                </div>
              </div>

              <div v-if="mode === 'register'">
                <label
                  class="text-xs font-medium text-gray-600 block mb-2 dark:text-gray-400"
                  >Je m'inscris en tant que</label
                >
                <div class="grid grid-cols-2 gap-4">
                  <label
                    class="flex items-center gap-3 border rounded-xl px-4 py-3 text-sm cursor-pointer transition"
                    :class="
                      role === 'VISITEUR'
                        ? 'border-mboa-green bg-mboa-green/5 text-mboa-green font-medium'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
                    "
                  >
                    <input
                      type="radio"
                      value="VISITEUR"
                      v-model="role"
                      class="hidden"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      class="w-5 h-5 flex-shrink-0"
                    >
                      <circle cx="12" cy="8" r="3.5" />
                      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
                    </svg>
                    Utilisateur
                  </label>
                  <label
                    class="flex items-center gap-3 border rounded-xl px-4 py-3 text-sm cursor-pointer transition"
                    :class="
                      role === 'GUIDE'
                        ? 'border-mboa-green bg-mboa-green/5 text-mboa-green font-medium'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
                    "
                  >
                    <input
                      type="radio"
                      value="GUIDE"
                      v-model="role"
                      class="hidden"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      class="w-5 h-5 flex-shrink-0"
                    >
                      <path
                        d="M12 21 C12 21 19 14.5 19 9.5 C19 5.4 15.9 2.5 12 2.5 C8.1 2.5 5 5.4 5 9.5 C5 14.5 12 21 12 21 Z"
                      />
                      <circle cx="12" cy="9.5" r="2.8" />
                    </svg>
                    Guide touristique
                  </label>
                </div>
                <p
                  v-if="role === 'guide'"
                  class="text-xs text-gray-400 mt-2 dark:text-gray-500"
                >
                  Ce profil nécessite un abonnement, activable depuis votre
                  tableau de bord après inscription.
                </p>
              </div>

              <div
                v-if="mode === 'login'"
                class="flex items-center justify-between text-xs"
              >
                <label
                  class="flex items-center gap-2 text-gray-500 dark:text-gray-400"
                >
                  <input
                    type="checkbox"
                    v-model="rememberMe"
                    class="accent-mboa-green w-3.5 h-3.5 rounded"
                  />
                  Se souvenir de moi
                </label>
                <a href="#" class="text-mboa-red font-medium hover:underline"
                  >Mot de passe oublié ?</a
                >
              </div>

              <div
                v-if="error"
                class="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 dark:bg-red-950/30 dark:border-red-900/40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C0392B"
                  stroke-width="2"
                  class="w-4 h-4 flex-shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5" />
                  <path d="M12 16h.01" />
                </svg>
                <p class="text-sm text-mboa-red">{{ error }}</p>
              </div>

              <button
                type="submit"
                class="w-full bg-mboa-green text-white font-semibold py-3 rounded-xl hover:bg-green-900 transition shadow-sm"
              >
                {{ mode === "login" ? "Se connecter" : "Créer mon compte" }}
              </button>
            </form>

            <p
              class="text-center text-sm text-gray-500 mt-6 dark:text-gray-400"
            >
              <template v-if="mode === 'login'">
                Pas encore de compte ?
                <button
                  @click="mode = 'register'"
                  class="text-mboa-green font-semibold hover:underline dark:text-mboa-gold"
                >
                  Inscrivez-vous
                </button>
              </template>
              <template v-else>
                Déjà inscrit ?
                <button
                  @click="mode = 'login'"
                  class="text-mboa-green font-semibold hover:underline dark:text-mboa-gold"
                >
                  Connectez-vous
                </button>
              </template>
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active > div,
.modal-fade-leave-active > div {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.modal-fade-enter-from > div,
.modal-fade-leave-to > div {
  transform: scale(0.96) translateY(8px);
  opacity: 0;
}
</style>
