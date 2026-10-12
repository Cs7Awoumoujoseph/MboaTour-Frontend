import { ref } from 'vue'
import type { RegisteredUser } from '../types/index.ts'
import api from '../api/axios.ts'


const registeredUsers = ref<RegisteredUser[]>([])

function emailExists(email: string): boolean {
  return registeredUsers.value.some((u) => u.email.toLowerCase() === email.toLowerCase())
}

export async function registerUser(data: {
  nom: string
  email: string
  motDePasse: string
  type?: string
}): Promise<RegisteredUser> {
  const response = await api.post<RegisteredUser>('/user/register', data)
  console.log(response.data)
  return response.data
}

export async function loginUser(email: string, password: string): Promise<RegisteredUser> {
  const response = await api.post<RegisteredUser>('/user/login', { email, password })
  return response.data
}

export function useUsers() {
  return { registeredUsers, emailExists, registerUser, loginUser }
}
 
