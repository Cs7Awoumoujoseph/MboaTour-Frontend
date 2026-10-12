import { ref, computed } from 'vue'
import { siteApi } from '../api/siteApi'
import type { Site } from '../types/index.ts'
import { currentUser } from './useAuth'


const sites = ref<Site[]>([])
const loading = ref(false)
const error = ref('')

function mapBackendSite(s: any): Site {
  const mainImg = (s.images ?? []).find((img: any) => img.principal) ?? s.images?.[0]
  return {
    id: s.id,
    name: s.nom ?? '',
    category: s.categorie?.nom ?? '',
    categoryId: s.categorie?.id,
    price: s.tarif != null ? `${s.tarif} FCFA` : '',
    hours: s.horaires ?? '',
    image: mainImg?.idImage
      ? `http://localhost:8080/mboa/img/${mainImg.idImage}/view`
      : '',
    region: s.region?.nom ?? '',
    regionId: s.region?.id,
    idealFor: s.idealPour ?? '',
    bestPeriod: s.meilleurePeriode ?? '',
    description: s.description ?? s.phraseAccroche ?? '',
    status: s.statutPublicationSite === 'PUBLIE' ? 'Publié' : 'Brouillon',
    rating: 0,
    gallery: (s.images ?? []).map((img: any) => `http://localhost:8080/mboa/img/${img.idImage}/view`),
    images: (s.images ?? []).map((img: any) => ({
      id: img.idImage,
      url: `http://localhost:8080/mboa/img/${img.idImage}/view`,
      principal: !!img.principal, // NOUVEAU
    })),
    reviews: [],
    ratingBreakdown: [],
  }
}

async function loadSites() {
  loading.value = true
  error.value = ''
  try {
    if (!currentUser.value?.id) {
      sites.value = []
      return
    }
    const response = await siteApi.getByAdmin(currentUser.value.id, { size: 100 })
    const rawSites = response.data.content ?? []
    sites.value = rawSites.map(mapBackendSite)
  } catch (err) {
    console.error('Erreur chargement sites admin :', err)
    error.value = 'Impossible de charger les sites.'
  } finally {
    loading.value = false
  }
}

// payload : ce qu'on envoie au backend, construit dans SiteFormModal.vue
async function createSite(payload: object, images: File[], publish: boolean) {
  const res = publish
    ? await siteApi.createPublished(payload, images)
    : await siteApi.createDraft(payload, images)
  await loadSites()
  return res.data
}

async function editSite(id: number, payload: object) {
  await siteApi.update(id, payload)
  await loadSites()
}

// NOUVEAU : ajoute une image à un site existant
async function addSiteImage(siteId: number, file: File) {
  const res = await siteApi.addImage(siteId, file)
  await loadSites()
  return res.data
}

// NOUVEAU : supprime une image existante
async function removeSiteImage(imageId: number) {
  await siteApi.deleteImage(imageId)
  await loadSites()
}

async function removeSite(id: number) {
  await siteApi.delete(id)
  await loadSites()
}

const publishedCount = computed(() => sites.value.filter((s) => s.status === 'Publié').length)

async function setMainImage(imageId: number) {
  await siteApi.setMainImage(imageId)
  await loadSites()
}

const draftCount = computed(() => sites.value.filter((s) => s.status === 'Brouillon').length) // NOUVEAU

export function useAdminSites() {
  return { sites, loading, error, loadSites, createSite, editSite, removeSite, addSiteImage, removeSiteImage, setMainImage, publishedCount, draftCount }
}