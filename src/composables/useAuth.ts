import { ref } from 'vue'
import api from '../api/axios'
import type { User } from '../types/index.ts'

const STORAGE_KEY = 'mboatour_user'

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

const storedUser = loadStoredUser()
export const isLoggedIn = ref(!!storedUser)
export const currentUser = ref<User | null>(storedUser)

export function useAuth() {
  // Appelle le backend avec email/mot de passe (utilisé par LoginView.vue)
  async function login(email: string, password: string): Promise<User> {
    const response = await api.post('/user/login', { email, password })
    const user: User = response.data
    setUser(user)
    return user
  }

  // Pose directement un utilisateur déjà obtenu (register/login déjà fait ailleurs)
  function setUser(user: User): void {
    currentUser.value = user
    isLoggedIn.value = true
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }

  function logout(): void {
    currentUser.value = null
    isLoggedIn.value = false
    localStorage.removeItem(STORAGE_KEY)
  }

  return { isLoggedIn, currentUser, login, setUser, logout }
}