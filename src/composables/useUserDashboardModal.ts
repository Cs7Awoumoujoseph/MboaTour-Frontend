
import { ref } from 'vue'

const isOpen = ref(false)
const activeTab = ref<'favorites' | 'reviews'>('favorites')

export function useUserDashboardModal() {
  function open(): void {
    activeTab.value = 'favorites'
    isOpen.value = true
  }
  function close(): void {
    isOpen.value = false
  }
  return { isOpen, activeTab, open, close }
}




