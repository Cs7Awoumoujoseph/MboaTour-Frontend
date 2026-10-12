import { ref } from 'vue'
import type { UserMedia } from '../types/index.ts'

const media = ref<UserMedia[]>([])
let nextId = 1

function addMedia(siteId: number, url: string, type: 'photo' | 'video', authorId:number,authorName: string): void {
  media.value.push({ id: nextId++, siteId, url, type,authorId, authorName })
}

function removeMedia(id: number): void {
  media.value = media.value.filter((m) => m.id !== id)
}

function getMediaForSite(siteId: number) {
  return media.value.filter((m) => m.siteId === siteId)
}

export function useUserMedia() {
  return { media, addMedia, removeMedia, getMediaForSite }
}