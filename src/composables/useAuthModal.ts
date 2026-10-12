import { ref } from 'vue'


const isOpen = ref(false)
const mode = ref<'login'|'register'> ('login')// 'login' ou 'register'

export function useAuthModal() {
  function openLogin():void {
    mode.value = 'login'
    isOpen.value = true
  }
  function openRegister():void {
    mode.value = 'register'
    isOpen.value = true
  }
  function close():void {
    isOpen.value = false
  }
  
  return { isOpen, mode, openLogin, openRegister, close}
}

