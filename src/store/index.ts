import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const user = ref<any>(JSON.parse(localStorage.getItem('user') || 'null'))
  
  const setToken = (newToken: string) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  const setUser = (newUser: any) => {
    user.value = newUser
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('user')
    }
  }
  
  const setBirthDate = (date: string) => {
    if (user.value) {
      user.value.birth_date = date
      setUser({ ...user.value, birth_date: date })
    }
  }

  const birthDate = computed(() => user.value?.birth_date || '')

  const logout = () => {
    setToken('')
    setUser(null)
  }

  return {
    token,
    user,
    setToken,
    setUser,
    logout,
    birthDate,
    setBirthDate
  }
})