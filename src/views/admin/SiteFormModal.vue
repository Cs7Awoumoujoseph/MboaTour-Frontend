<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useSiteFormModal } from "../../composables/useSiteFormModal";
import { useAdminSites } from "../../composables/useAdminSites";
import { regionApi } from "../../api/regionApi";
import { categorieApi } from "../../api/categorieApi";
import { currentUser } from "../../composables/useAuth";

const { createSite, editSite, addSiteImage, removeSiteImage, setMainImage } =
  useAdminSites();

const existingImages = ref<{ id: number; url: string; principal?: boolean }[]>([]);

const { isOpen, mode, editingSite, close } = useSiteFormModal();

const regions = ref<{ id: number; nom: string }[]>([]);
const categories = ref<{ id: number; nom: string }[]>([]);

function extractEmbedded(data: any) {
  const embedded = data?._embedded;
  if (!embedded) return [];
  return (Object.values(embedded).find((v) => Array.isArray(v)) as any[]) ?? [];
}

onMounted(async () => {
  try {
    const [regRes, catRes] = await Promise.all([
      regionApi.getAll(),
      categorieApi.getAll(),
    ]);
    regions.value = extractEmbedded(regRes.data);
    categories.value = extractEmbedded(catRes.data);
  } catch (err) {
    console.error("Erreur chargement régions/catégories :", err);
  }
});

const emptyForm = {
  name: "",
  regionId: null as number | null,
  categoryId: null as number | null,
  price: "",
  hours: "",
  status: "Brouillon",
  idealFor: "",
  bestPeriod: "",
  description: "",
};
const form = ref({ ...emptyForm });
const photoFiles = ref<File[]>([]);
const photoPreviews = ref<string[]>([]);
const mainPhotoIndex = ref(0);
const error = ref("");
const fileError = ref("");
const MAX_PHOTOS = 3;
const photoInput = ref<HTMLInputElement | null>(null);
const submitting = ref(false);

watch(isOpen, (open) => {
  if (open) {
    error.value = "";
    fileError.value = "";
    photoFiles.value = [];
    existingImages.value = [];
    if (mode.value === "edit" && editingSite.value) {
      const s = editingSite.value;
      form.value = {
        name: s.name,
        regionId: s.regionId ?? null,
        categoryId: s.categoryId ?? null,
        price: s.price,
        hours: s.hours,
        status: s.status,
        idealFor: s.idealFor,
        bestPeriod: s.bestPeriod,
        description: s.description,
      };
      existingImages.value = s.images ? [...s.images] : [];
      photoPreviews.value = existingImages.value.map((img) => img.url);

      const principalIndex = existingImages.value.findIndex(
        (img) => img.principal,
      );
      mainPhotoIndex.value = principalIndex >= 0 ? principalIndex : 0;
    } else {
      form.value = { ...emptyForm };
      photoPreviews.value = [];
      mainPhotoIndex.value = 0;
    }
  }
});

async function handlePhotosChange(event: Event) {
  fileError.value = "";
  const files = Array.from((event.target as HTMLInputElement).files || []);

  for (const file of files) {
    if (existingImages.value.length + photoFiles.value.length >= MAX_PHOTOS) {
      fileError.value = `Maximum ${MAX_PHOTOS} photos par site.`;
      break;
    }
    if (!file.type.startsWith("image/")) {
      fileError.value = "Seules les images sont acceptées.";
      continue;
    }
    if (file.size > 5 * 1024 * 1024) {
      fileError.value = "Une image dépasse 5 Mo et a été ignorée.";
      continue;
    }

    if (mode.value === "edit" && editingSite.value) {
      try {
        const newImg = await addSiteImage(editingSite.value.id, file);
        existingImages.value.push({
          id: newImg.idImage,
          url: `http://localhost:8080/mboa/img/${newImg.idImage}/view`,
        });
        photoPreviews.value.push(
          `http://localhost:8080/mboa/img/${newImg.idImage}/view`,
        );
      } catch (err) {
        console.error("Erreur upload image :", err);
        fileError.value = "Erreur lors de l'ajout de l'image.";
      }
    } else {
      photoFiles.value.push(file);
      photoPreviews.value.push(URL.createObjectURL(file));
    }
  }

  if (photoInput.value) photoInput.value.value = "";
}

async function setAsMain(index: number) {
  mainPhotoIndex.value = index;

  if (mode.value === "edit" && existingImages.value[index]) {
    try {
      await setMainImage(existingImages.value[index].id);
    } catch (err) {
      console.error("Erreur définition photo principale :", err);
      fileError.value = "Erreur lors de la définition de la photo principale.";
    }
  }
}

async function removePhoto(index: number) {
  if (mode.value === "edit" && existingImages.value[index]) {
    const imgId = existingImages.value[index].id;
    try {
      await removeSiteImage(imgId);
    } catch (err) {
      console.error("Erreur suppression image :", err);
      fileError.value = "Erreur lors de la suppression de l'image.";
      return;
    }
    existingImages.value = existingImages.value.filter((_, i) => i !== index);
  } else {
    photoFiles.value = photoFiles.value.filter((_, i) => i !== index);
  }
  photoPreviews.value = photoPreviews.value.filter((_, i) => i !== index);
  if (mainPhotoIndex.value >= photoPreviews.value.length)
    mainPhotoIndex.value = 0;
}

async function handleSubmit() {
  error.value = "";

  if (!form.value.name || !form.value.regionId || !form.value.categoryId) {
    error.value = "Veuillez remplir tous les champs obligatoires.";
    return;
  }
  if (!currentUser.value?.id) {
    error.value = "Vous devez être connecté en tant qu'administrateur.";
    return;
  }

  const payload = {
    nom: form.value.name,
    description: form.value.description,
    phraseAccroche: form.value.description?.slice(0, 100) ?? "",
    localisation: "",
    horaires: form.value.hours,
    tarif: parseFloat(form.value.price) || 0,
    idealPour: form.value.idealFor,
    meilleurePeriode: form.value.bestPeriod,
    region: { id: form.value.regionId },
    categorie: { id: form.value.categoryId },
    administrateur: { id: currentUser.value.id },
    statutPublicationSite:
      form.value.status === "Publié" ? "PUBLIE" : "BROUILLON",
  };

  submitting.value = true;
  try {
    if (mode.value === "create") {
      if (photoFiles.value.length === 0) {
        error.value = "Ajoutez au moins une photo (obligatoire à la création).";
        submitting.value = false;
        return;
      }

      const createdSite = await createSite(
        payload,
        photoFiles.value,
        form.value.status === "Publié",
      );

      const createdImages = createdSite?.images ?? [];
      if (createdImages[mainPhotoIndex.value]) {
        try {
          await setMainImage(createdImages[mainPhotoIndex.value].idImage);
        } catch (err) {
          console.error(
            "Erreur définition photo principale à la création :",
            err,
          );
        }
      }
    } else {
      if (!editingSite.value) {
        error.value = "Site à modifier introuvable.";
        submitting.value = false;
        return;
      }
      await editSite(editingSite.value.id, payload);
    }
    close();
  } catch (err: any) {
    console.error("Erreur enregistrement site :", err);
    error.value =
      err?.response?.data?.message || "Erreur lors de l'enregistrement.";
  } finally {
    submitting.value = false;
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
        class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <!-- EN-TÊTE (fixe) -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0"
        >
          <div>
            <h2 class="text-xl font-bold text-mboa-green dark:text-mboa-gold">
              {{
                mode === "create"
                  ? "Ajouter un site touristique"
                  : "Modifier le site"
              }}
            </h2>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Les champs marqués d'un <span class="text-mboa-red">*</span> sont
              obligatoires.
            </p>
          </div>
          <button
            @click="close"
            class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg leading-none"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <!-- CORPS (scrollable) -->
        <form
          id="site-form"
          @submit.prevent="handleSubmit"
          class="overflow-y-auto px-6 py-6 space-y-8 flex-1"
        >
          <!-- SECTION : informations générales -->
          <section>
            <h3
              class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800"
            >
              Informations générales
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div class="md:col-span-2">
                <label
                  class="text-sm font-medium text-gray-700 block mb-1 dark:text-gray-300"
                >
                  Nom du site <span class="text-mboa-red">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="Ex : Palais Royal de Bafut"
                  class="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-mboa-green/30"
                />
              </div>

              <div>
                <label
                  class="text-sm font-medium text-gray-700 block mb-1 dark:text-gray-300"
                >
                  Région <span class="text-mboa-red">*</span>
                </label>
                <select
                  v-model="form.regionId"
                  required
                  class="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-mboa-green/30"
                >
                  <option :value="null" disabled>Choisir...</option>
                  <option v-for="r in regions" :key="r.id" :value="r.id">
                    {{ r.nom }}
                  </option>
                </select>
              </div>

              <div>
                <label
                  class="text-sm font-medium text-gray-700 block mb-1 dark:text-gray-300"
                >
                  Catégorie <span class="text-mboa-red">*</span>
                </label>
                <select
                  v-model="form.categoryId"
                  required
                  class="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-mboa-green/30"
                >
                  <option :value="null" disabled>Choisir...</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">
                    {{ c.nom }}
                  </option>
                </select>
              </div>
            </div>
          </section>

          <!-- SECTION : détails pratiques -->
          <section>
            <h3
              class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800"
            >
              Détails pratiques
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label
                  class="text-sm font-medium text-gray-700 block mb-1 dark:text-gray-300"
                >
                  Tarif d'entrée <span class="text-mboa-red">*</span>
                </label>
                <input
                  v-model="form.price"
                  type="text"
                  required
                  placeholder="Ex : 1 000 FCFA"
                  class="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-mboa-green/30"
                />
              </div>
              <div>
                <label
                  class="text-sm font-medium text-gray-700 block mb-1 dark:text-gray-300"
                >
                  Horaires <span class="text-mboa-red">*</span>
                </label>
                <input
                  v-model="form.hours"
                  type="text"
                  required
                  placeholder="Ex : 08:00 - 18:00"
                  class="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-mboa-green/30"
                />
              </div>
              <div>
                <label
                  class="text-sm font-medium text-gray-700 block mb-1 dark:text-gray-300"
                >
                  Meilleure période
                </label>
                <input
                  v-model="form.bestPeriod"
                  type="text"
                  placeholder="Ex : Nov. à Mars"
                  class="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-mboa-green/30"
                />
              </div>
              <div>
                <label
                  class="text-sm font-medium text-gray-700 block mb-1 dark:text-gray-300"
                >
                  Idéal pour
                </label>
                <input
                  v-model="form.idealFor"
                  type="text"
                  placeholder="Ex : Nature & Randonnée"
                  class="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-mboa-green/30"
                />
              </div>
            </div>
          </section>

          <!-- SECTION : description -->
          <section>
            <h3
              class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800"
            >
              Description
            </h3>
            <textarea
              v-model="form.description"
              rows="5"
              placeholder="Décrivez le site touristique..."
              class="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-mboa-green/30 resize-none"
            ></textarea>
          </section>

          <!-- SECTION : photos -->
          <section>
            <h3
              class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800"
            >
              Photos du site <span class="text-mboa-red">*</span>
              <span class="text-xs font-normal text-gray-400 dark:text-gray-500"
                >({{ photoPreviews.length }}/{{ MAX_PHOTOS }})</span
              >
            </h3>

            <div
              class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-2"
            >
              <div
                v-for="(img, index) in photoPreviews"
                :key="index"
                class="relative group aspect-square"
              >
                <img
                  :src="img"
                  @click="setAsMain(index)"
                  class="w-full h-full object-cover rounded-lg cursor-pointer border-2 transition-colors"
                  :class="
                    mainPhotoIndex === index
                      ? 'border-mboa-red'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  "
                />
                <span
                  v-if="mainPhotoIndex === index"
                  class="absolute bottom-1 left-1 bg-mboa-red text-white text-[9px] font-medium px-1.5 py-0.5 rounded"
                >
                  Principale
                </span>
                <button
                  type="button"
                  @click="removePhoto(index)"
                  class="absolute -top-1.5 -right-1.5 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  aria-label="Supprimer la photo"
                >
                  ✕
                </button>
              </div>

              <button
                v-if="photoPreviews.length < MAX_PHOTOS"
                type="button"
                @click="photoInput?.click()"
                class="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-mboa-green hover:text-mboa-green dark:hover:border-mboa-gold dark:hover:text-mboa-gold text-xs transition-colors"
              >
                <span class="text-xl leading-none mb-0.5">+</span>
                Ajouter
              </button>
            </div>

            <input
              ref="photoInput"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="handlePhotosChange"
            />

            <p v-if="fileError" class="text-xs text-mboa-red">
              {{ fileError }}
            </p>
            <p v-else class="text-xs text-gray-400 dark:text-gray-500">
              Cliquez sur une photo pour la définir comme principale.
            </p>
          </section>

          <!-- SECTION : statut -->
          <section>
            <h3
              class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800"
            >
              Statut de publication
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <label
                class="border rounded-lg px-4 py-3 text-sm text-center cursor-pointer transition-colors"
                :class="
                  form.status === 'Publié'
                    ? 'border-mboa-green bg-mboa-green/5 text-mboa-green font-medium'
                    : 'border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400'
                "
              >
                <input
                  type="radio"
                  value="Publié"
                  v-model="form.status"
                  class="hidden"
                />
                Publié
              </label>
              <label
                class="border rounded-lg px-4 py-3 text-sm text-center cursor-pointer transition-colors"
                :class="
                  form.status === 'Brouillon'
                    ? 'border-mboa-gold bg-mboa-gold/5 text-mboa-gold font-medium'
                    : 'border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400'
                "
              >
                <input
                  type="radio"
                  value="Brouillon"
                  v-model="form.status"
                  class="hidden"
                />
                Brouillon
              </label>
            </div>
          </section>

          <p
            v-if="error"
            class="text-sm text-mboa-red bg-mboa-red/5 rounded-lg px-3 py-2"
          >
            {{ error }}
          </p>
        </form>

        <!-- PIED DE PAGE (fixe) -->
        <div
          class="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900"
        >
          <button
            type="button"
            @click="close"
            class="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            form="site-form"
            type="submit"
            :disabled="submitting"
            class="flex-1 bg-mboa-red text-white font-medium py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {{
              submitting
                ? "Enregistrement..."
                : mode === "create"
                  ? "Ajouter le site"
                  : "Enregistrer"
            }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
