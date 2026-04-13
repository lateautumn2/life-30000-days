<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 tracking-wider mb-2">人生三万天</h1>
        <p class="text-gray-500">欢迎回来，继续记录你的旅程</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
          <input 
            v-model="form.email" 
            type="email" 
            required
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
          <input 
            v-model="form.password" 
            type="password" 
            required
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <div v-if="errorMsg" class="text-red-500 text-sm text-center">
          {{ errorMsg }}
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="mt-8 text-center text-sm text-gray-500">
        还没有账号？ 
        <router-link to="/register" class="text-blue-600 hover:underline font-medium">
          立即注册
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import { api } from '@/utils/api'

const router = useRouter()
const store = useAppStore()

const form = ref({
  email: '',
  password: ''
})
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await api.login(form.value)
    store.setToken(data.token)
    store.setUser(data.user)
    router.push('/')
  } catch (error: any) {
    errorMsg.value = error.message || '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>
