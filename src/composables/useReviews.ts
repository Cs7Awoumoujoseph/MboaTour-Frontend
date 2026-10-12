import { ref } from 'vue'
import type { StoredReview } from '../types/index.ts'
import { siteApi } from '../api/siteApi.ts'

const reviews = ref<StoredReview[]>([])

function mergeReviews(newReviews: StoredReview[]) {
  const map = new Map(reviews.value.map((r) => [r.id, r]))
  for (const nr of newReviews) map.set(nr.id, nr)
  reviews.value = Array.from(map.values())
}

// Synchronise les avis affichés sur la fiche d'un site (tous auteurs confondus)
function setReviewsForSite(siteId: number, apiReviews: any[]) {
  const mapped: StoredReview[] = apiReviews.map((c) => ({
    id: c.id,
    siteId,
    authorId: c.utilisateurId,
    authorName: c.nom,
    rating: c.note,
    comment: c.comment,
    date: c.dateComment,
  }))
  mergeReviews(mapped)
}

// Charge tous les avis d'un utilisateur donné (pour "Mon espace")
async function loadReviewsForUser(userId: number, authorName: string): Promise<void> {
  try {
    const response = await siteApi.getReviewsByUserApi(userId)
    const mapped: StoredReview[] = (response.data ?? []).map((r: any) => ({
      id: r.id,
      siteId: r.siteId,
      authorId: userId,
      authorName,
      rating: r.note,
      comment: r.commentaire,
      date: r.datePublication,
    }))
    mergeReviews(mapped)
  } catch (err) {
    console.error("Erreur lors du chargement de vos avis :", err)
  }
}

async function addReview(
  siteId: number,
  authorId: number,
  authorName: string,
  rating: number,
  comment: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await siteApi.addReview({
      utilisateurId: authorId,
      siteId,
      note: rating,
      commentaire: comment,
    })
    mergeReviews([{
      id: response.data.id,
      siteId,
      authorId,
      authorName,
      rating,
      comment,
      date: response.data.dateComment,
    }])
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err?.response?.data ?? "Erreur lors de la publication de l'avis." }
  }
}

async function updateReview(
  id: number,
  rating: number,
  comment: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await siteApi.updateReview(id, { note: rating, commentaire: comment })
    reviews.value = reviews.value.map((r) =>
      r.id === id ? { ...r, rating, comment } : r
    )
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err?.response?.data ?? "Erreur lors de la modification de l'avis." }
  }
}

async function removeReview(id: number): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await siteApi.deleteReview(id)
    reviews.value = reviews.value.filter((r) => r.id !== id)
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err?.response?.data ?? "Erreur lors de la suppression de l'avis." }
  }
}

function getReviewsForSite(siteId: number) {
  return reviews.value.filter((r) => r.siteId === siteId)
}

function getReviewsByUser(authorId: number) {
  return reviews.value.filter((r) => r.authorId === authorId)
}

function hasUserReviewed(siteId: number, authorId: number): boolean {
  return reviews.value.some((r) => r.siteId === siteId && r.authorId === authorId)
}

export function useReviews() {
  return {
    reviews,
    addReview,
    updateReview,
    removeReview,
    setReviewsForSite,
    loadReviewsForUser,
    getReviewsForSite,
    getReviewsByUser,
    hasUserReviewed,
  }
}