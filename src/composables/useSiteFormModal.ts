import { ref } from 'vue'
import type{Site} from'../types/index.ts'

const isOpen = ref(false)
const mode = ref<'create'|'edit'>('create') // 'create' ou 'edit'
const editingSite = ref<Site| null>(null)

export function useSiteFormModal() {
  function openCreate() {
    mode.value = 'create'
    editingSite.value = null
    isOpen.value = true
  }

  function openEdit(site:Site) {
    mode.value = 'edit'
    editingSite.value = site
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, mode, editingSite, openCreate, openEdit, close }
}