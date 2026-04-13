<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/store'
import { api } from '@/utils/api'

const store = useAppStore()

onMounted(async () => {
  if (store.token) {
    try {
      const data = await api.getUser()
      if (data) {
        store.setBirthDate(data.birth_date)
        store.setUser(data)
      }
    } catch (error) {
      console.error('Failed to fetch user data', error)
    }
  }
})
</script>

<style>
/* Global Styles */
.nav-item {
  @apply flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 font-medium transition-all duration-200 hover:bg-blue-50 hover:text-blue-600;
}
.nav-item-active {
  @apply bg-blue-50 text-blue-600 shadow-sm;
}
.mobile-tab {
  @apply flex flex-col items-center justify-center w-full h-full text-gray-500 transition-colors duration-200;
}
.mobile-tab-active {
  @apply text-blue-600;
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Safe area for mobile devices */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
