<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col items-center justify-center relative pb-20">
    
    <!-- Main Content Area -->
    <main class="w-full h-full max-w-6xl mx-auto flex-1 flex flex-col p-4 md:p-8 relative">
      <!-- User / Admin Top Bar (Only visible on home page) -->
      <div v-if="isHomePage" class="fixed top-4 right-4 md:top-8 md:right-8 flex gap-3 md:gap-4 z-50 bg-white/50 backdrop-blur px-3 py-2 rounded-2xl shadow-sm border border-white/60">
        
        <!-- Not logged in -->
        <router-link v-if="!store.token" to="/login" class="text-gray-500 hover:text-blue-600 transition-colors p-1" title="登录">
          <LogIn class="w-5 h-5" />
        </router-link>

        <!-- Logged in -->
        <template v-else>
          <router-link v-if="store.user?.role === 'admin'" to="/admin" class="text-gray-500 hover:text-purple-600 transition-colors p-1" title="管理控制台">
            <Shield class="w-5 h-5" />
          </router-link>
          
          <button @click="showEditProfile = true" class="text-gray-500 hover:text-blue-600 transition-colors p-1" title="修改个人信息">
            <Settings class="w-5 h-5" />
          </button>

          <button @click="handleLogout" class="text-gray-500 hover:text-red-500 transition-colors p-1" title="退出登录">
            <LogOut class="w-5 h-5" />
          </button>
        </template>
      </div>

      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Unified Bottom Tab Bar for PC & Mobile -->
    <nav class="fixed bottom-0 w-full max-w-6xl bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around items-center h-16 z-40 safe-area-bottom pb-env">
      <router-link 
        to="/" 
        class="mobile-tab" 
        active-class="mobile-tab-active"
      >
        <Clock class="w-6 h-6" />
      </router-link>
      <router-link 
        to="/intersections" 
        class="mobile-tab" 
        active-class="mobile-tab-active"
      >
        <Users class="w-6 h-6" />
      </router-link>
      <router-link 
        to="/memos" 
        class="mobile-tab" 
        active-class="mobile-tab-active"
      >
        <Calendar class="w-6 h-6" />
      </router-link>
    </nav>

    <!-- Edit Profile Modal -->
    <div v-if="showEditProfile" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-800">修改个人信息</h3>
          <button @click="showEditProfile = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">昵称</label>
            <input 
              v-model="editForm.name" 
              type="text" 
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">出生日期</label>
            <input 
              v-model="editForm.birth_date" 
              type="date" 
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button 
            @click="saveProfile"
            class="w-full bg-gray-900 hover:bg-black text-white font-medium py-3 rounded-xl transition-all mt-4"
          >
            保存修改
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Clock, Users, Calendar, LogOut, LogIn, Settings, Shield, X } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import { api } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const isHomePage = computed(() => route.path === '/')

const showEditProfile = ref(false)
const editForm = ref({
  name: store.user?.name || '',
  birth_date: store.user?.birth_date || ''
})

watch(() => showEditProfile.value, (val) => {
  if (val) {
    editForm.value.name = store.user?.name || ''
    editForm.value.birth_date = store.user?.birth_date || ''
  }
})

const handleLogout = () => {
  store.logout()
  router.push('/')
}

const saveProfile = async () => {
  if (!editForm.value.name || !editForm.value.birth_date) return
  try {
    await api.updateUser(editForm.value)
    if (store.user) {
      store.setUser({ ...store.user, ...editForm.value })
    }
    showEditProfile.value = false
  } catch (error) {
    console.error('Failed to update profile', error)
  }
}
</script>

<style>
/* Global Styles */
.mobile-tab {
  @apply flex flex-col items-center justify-center w-full h-full text-gray-400 transition-all duration-300 hover:text-gray-600;
}
.mobile-tab-active {
  @apply text-gray-900;
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.pb-env {
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(4rem + env(safe-area-inset-bottom));
}
</style>
