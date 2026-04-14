<template>
  <div class="h-full flex flex-col items-center justify-center">
    <!-- Main Content -->
    <div class="text-center space-y-16 w-full">
      <!-- Title -->
      <h2 class="text-xl md:text-2xl text-gray-800 font-medium tracking-widest">
        {{ store.user ? `${store.user.name}的人生` : "人生三万天" }}
      </h2>

      <!-- Countdown Numbers -->
      <div class="flex items-baseline justify-center">
        <span class="text-gray-400 text-2xl md:text-3xl font-semibold mr-3 md:mr-5" v-if="store.token">剩余</span>
        <span class="text-8xl md:text-[10rem] font-semibold leading-none tracking-tighter text-gray-900 font-sans" style="font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif">
          {{ store.token ? remainingDays : 30000 }}
        </span>
        <span class="text-gray-400 text-2xl md:text-3xl font-semibold ml-3 md:ml-5">天</span>
      </div>

      <!-- Clock -->
      <div class="text-gray-400 text-sm md:text-base font-mono tracking-widest">
        {{ currentTime }}
      </div>

      <!-- Quote -->
      <div class="max-w-md mx-auto pt-8">
        <p class="text-gray-500 text-sm md:text-base leading-relaxed italic px-4">“{{ quote }}”</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useAppStore } from "@/store"
import { api } from "@/utils/api"
import dayjs from "dayjs"

const store = useAppStore()
const quote = ref("加载中...")
const currentTime = ref(dayjs().format("HH : mm : ss"))
let timer: ReturnType<typeof setInterval>

const totalDays = 30000

const passedDays = computed(() => {
  if (!store.birthDate) return 0
  return dayjs().diff(dayjs(store.birthDate), "day")
})

const remainingDays = computed(() => {
  return Math.max(0, totalDays - passedDays.value)
})

const fetchQuote = async () => {
  if (!store.token) {
    quote.value = "很不幸，时间的流逝永远不会停止。 时光如箭，你的过去在不停增多，你的未来在不断减少，未知的可能性只会越来越少，而无法改变的后悔在累积如山。 你明白了吗？"
    return
  }

  try {
    const data = await api.getQuote()
    quote.value = data.quote
  } catch (error) {
    quote.value = "每一个不曾起舞的日子，都是对生命的辜负。"
  }
}

onMounted(() => {
  fetchQuote()
  timer = setInterval(() => {
    currentTime.value = dayjs().format("HH : mm : ss")
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
