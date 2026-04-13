<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 tracking-wider mb-2">人生三万天</h1>
        <p class="text-gray-500">创建账号，开启你的时光倒影</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input 
            v-model="form.email" 
            type="email" 
            required
            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input 
            v-model="form.password" 
            type="password" 
            required
            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">昵称</label>
          <input 
            v-model="form.name" 
            type="text" 
            required
            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="你的名字"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">出生日期</label>
          <input 
            v-model="form.birth_date" 
            type="date" 
            required
            class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div v-if="errorMsg" class="text-red-500 text-sm text-center">
          {{ errorMsg }}
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl shadow-md transition-all active:scale-[0.98] mt-2"
        >
          {{ loading ? '注册中...' : '注册账号' }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-gray-500">
        已有账号？ 
        <router-link to="/login" class="text-blue-600 hover:underline font-medium">
          直接登录
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
  password: '',
  name: '',
  birth_date: ''
})
const loading = ref(false)
const errorMsg = ref('')

const handleRegister = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await api.register(form.value)
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
