<template>
  <div class="h-full flex flex-col">
    <div v-if="loading" class="text-center py-12 text-gray-500">加载中...</div>

    <div v-else-if="person" class="bg-gray-50 rounded-3xl px-6 md:px-12 pb-6 md:pb-12 w-full flex-1 relative flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-start mb-8">
        <div>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 tracking-wider flex items-end gap-3">
            {{ person.name }}
            <span class="text-base font-normal text-gray-400 tracking-normal mb-1">({{ person.birth_date }})</span>
          </h2>
        </div>
        <div class="flex gap-4">
          <button @click="$router.back()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft class="w-6 h-6" />
          </button>
          <button @click="openEditModal" class="text-gray-400 hover:text-blue-500 transition-colors">
            <Pencil class="w-6 h-6" />
          </button>
          <button @click="handleDelete" class="text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Numbers -->
      <div class="flex-1 flex flex-col justify-center items-center space-y-4 mt-2 md:mt-4">
        <div class="flex items-baseline justify-center">
          <span class="text-gray-400 text-lg md:text-xl mr-4">剩余</span>
          <span class="text-7xl md:text-8xl font-light tracking-tighter text-gray-900 font-sans" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            {{ remainingIntersection }}
          </span>
          <span class="text-gray-400 text-lg md:text-xl ml-4">天</span>
        </div>

        <div class="relative flex items-baseline justify-center">
          <span class="text-gray-400 text-base mr-2">剩余可见</span>
          <button
            type="button"
            class="mr-3 text-gray-400 hover:text-gray-600 transition-colors"
            title="查看计算方式"
            aria-label="查看剩余可见次数计算方式"
            @click="showMeetingCalc = !showMeetingCalc"
          >
            <CircleHelp class="w-4 h-4" />
          </button>
          <span class="text-4xl md:text-5xl font-light tracking-tighter text-gray-800 font-sans">
            {{ estimatedMeetings }}
          </span>
          <span class="text-gray-400 text-base ml-3">次</span>
          <div
            v-if="showMeetingCalc"
            class="absolute top-full mt-3 w-72 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur px-4 py-3 text-left shadow-lg z-20"
          >
            <div class="text-xs text-gray-700 leading-relaxed space-y-1">
              <p>计算方式：</p>
              <p>1. 若无交集记录：按每 30 天可见 1 次估算。</p>
              <p>2. 若有交集记录：按历史频率估算。</p>
              <p>公式：剩余可见 = floor(剩余交集天数 × 记录次数 ÷ 首次记录至今天数)。</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Intersection Graph -->
      <div class="mt-16 space-y-8 w-full max-w-2xl mx-auto pb-8">
        <h3 class="text-gray-600 text-lg">人生交集</h3>
        
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full bg-gray-400"></div>
            <span class="text-gray-800 font-medium">{{ person.name }}</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full bg-black"></div>
            <span class="text-gray-800 font-medium">{{ store.user?.name || '我' }}</span>
          </div>
        </div>

        <div class="relative pt-12 pb-6">
          <!-- Background Tracks (Gray Extension) -->
          <div class="absolute w-full h-4 bg-gray-200 rounded-full top-12"></div>
          <div class="absolute w-full h-4 bg-gray-200 rounded-full top-20"></div>

          <!-- Highlight Intersection Area (Light Blue Background) -->
          <div 
            class="absolute h-24 bg-blue-100/50 rounded-xl top-5 transition-all duration-1000 border-x border-blue-200"
            :style="{ left: intersectionStartPercent + '%', width: intersectionWidthPercent + '%' }"
          ></div>

          <!-- Interaction Bubbles -->
          <div 
            v-for="(count, year) in yearlyInteractions" 
            :key="year"
            class="absolute top-17 -translate-y-1/2 -translate-x-1/2 rounded-full bg-blue-400/60 mix-blend-multiply transition-all duration-500 z-10"
            :style="{ 
              left: getYearPercent(year) + '%',
              width: getBubbleSize(count) + 'px',
              height: getBubbleSize(count) + 'px'
            }"
            :title="`${year}年: ${count}次交集`"
          ></div>

          <!-- Other Person Bar -->
          <div 
            class="absolute h-4 bg-gray-400 rounded-full top-12 transition-all duration-1000 z-10"
            :style="{ left: otherStartPercent + '%', width: otherWidthPercent + '%' }"
          ></div>

          <!-- My Bar -->
          <div 
            class="absolute h-4 bg-black rounded-full top-20 transition-all duration-1000 z-10"
            :style="{ left: myStartPercent + '%', width: myWidthPercent + '%' }"
          ></div>

          <!-- Current Time Indicator -->
          <div 
            class="absolute top-12 bottom-6 w-px bg-gray-400 z-20 transition-all duration-1000"
            :style="{ left: currentPercent + '%' }"
          >
            <div class="absolute -top-2 -translate-x-1/2 w-3 h-3 rounded-full bg-gray-500 border-2 border-white shadow-sm"></div>
            <div class="absolute -bottom-6 -translate-x-1/2 text-xs text-gray-400">{{ currentYear }}</div>
          </div>

          <div class="flex justify-between mt-16 text-sm text-gray-500">
            <span>{{ startYear }}</span>
            <span>{{ endYear }}</span>
          </div>
          <div class="text-xs text-gray-400 mt-1">时间轴展示了您与{{ person.name }}的人生轨迹，蓝色区域表示你们的人生交集，圆点代表交集记录</div>
        </div>

        <div class="space-y-4 pt-4 border-t border-gray-200">
          <div class="flex justify-between items-center text-gray-600">
            <span class="text-lg">共同生活</span>
            <span class="text-xl font-medium text-gray-800">{{ totalIntersectionDays }} 天</span>
          </div>
          <div class="flex justify-between items-center text-gray-600">
            <span class="text-lg">剩余交集</span>
            <span class="text-xl font-medium text-gray-800">{{ remainingIntersection }} 天</span>
          </div>
        </div>
      </div>

      <!-- Memos List with this person -->
      <div class="mt-8 w-full max-w-2xl mx-auto pt-8 border-t border-gray-200 pb-12">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-gray-600 text-lg">与 {{ person.name }} 的交集记录</h3>
          <div class="relative">
            <input 
              type="month" 
              v-model="filterMonth"
              class="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-600 bg-white"
              title="按月份筛选"
            />
            <button v-if="filterMonth" @click="filterMonth = ''" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-white pr-1">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div v-if="filteredMemos.length === 0" class="text-center text-gray-400 py-8 bg-white/50 rounded-2xl border border-dashed border-gray-200">
          暂无交集记录
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="memo in paginatedMemos" 
            :key="memo.id"
            class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-start"
          >
            <div class="flex-1 w-full">
              <div class="flex items-center gap-2 mb-2">
                <CalendarDays class="w-4 h-4 text-blue-500" />
                <time class="text-sm font-mono text-blue-500 font-semibold">{{ memo.date }}</time>
              </div>
              <div class="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{{ memo.content }}</div>
            </div>
            
            <div v-if="memo.image" class="w-full md:w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-gray-100 cursor-pointer" @click="previewImage = memo.image">
              <img :src="memo.image" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          </div>

          <!-- Pagination Controls -->
          <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 mt-8 pt-4">
            <button 
              @click="currentPage > 1 && currentPage--"
              :disabled="currentPage === 1"
              class="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-500 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-all bg-white"
              title="上一页"
            >
              <ChevronLeft class="w-5 h-5" />
            </button>
            <span class="text-sm text-gray-600 font-medium">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button 
              @click="currentPage < totalPages && currentPage++"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-500 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-all bg-white"
              title="下一页"
            >
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div v-if="previewImage" class="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 cursor-pointer" @click="previewImage = ''">
      <button class="absolute top-6 right-6 text-white/70 hover:text-white p-2 bg-black/20 rounded-full backdrop-blur transition-all">
        <X class="w-6 h-6" />
      </button>
      <img :src="previewImage" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" @click.stop />
    </div>

    <!-- Edit Connection Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-800">编辑交集人员</h3>
          <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input
              v-model="editForm.name"
              type="text"
              class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">出生年月</label>
            <input
              v-model="editForm.birth_date"
              type="date"
              class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            @click="saveConnection"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-xl transition-all mt-4"
          >
            保存
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Trash2, CalendarDays, X, ChevronLeft, ChevronRight, CircleHelp, Pencil } from 'lucide-vue-next'
import { useAppStore } from '@/store'
import { api } from '@/utils/api'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const person = ref<any>(null)
const loading = ref(true)
const allMemos = ref<any[]>([])
const previewImage = ref('')
const showMeetingCalc = ref(false)
const showEditModal = ref(false)
const editForm = ref({
  name: '',
  birth_date: '',
})

const filterMonth = ref('')
const currentPage = ref(1)
const pageSize = 5

const fetchPerson = async () => {
  try {
    person.value = await api.getConnection(route.params.id as string)
  } catch (error) {
    console.error('Failed to fetch person', error)
  } finally {
    loading.value = false
  }
}

const fetchMemos = async () => {
  try {
    allMemos.value = await api.getMemos()
  } catch (error) {
    console.error('Failed to fetch memos', error)
  }
}

const relatedMemos = computed(() => {
  return allMemos.value.filter(m => m.connection_id === person.value?.id)
})

const filteredMemos = computed(() => {
  let list = relatedMemos.value
  if (filterMonth.value) {
    list = list.filter(m => m.date.startsWith(filterMonth.value))
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredMemos.value.length / pageSize) || 1)

const paginatedMemos = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredMemos.value.slice(start, end)
})

watch(filterMonth, () => {
  currentPage.value = 1
})

const yearlyInteractions = computed(() => {
  const counts: Record<string, number> = {}
  relatedMemos.value.forEach(memo => {
    const year = memo.date.substring(0, 4)
    counts[year] = (counts[year] || 0) + 1
  })
  return counts
})

const getBubbleSize = (count: number) => {
  const minSize = 8
  const maxSize = 24
  const maxCount = Math.max(...Object.values(yearlyInteractions.value)) || 1
  return minSize + (count / maxCount) * (maxSize - minSize)
}

const getYearPercent = (yearStr: string) => {
  const date = dayjs(`${yearStr}-06-01`) // roughly middle of year
  return calculatePercent(date)
}

const estimatedMeetings = computed(() => {
  // Simple estimation logic based on remaining days / 30 
  // (Assuming meeting roughly once a month, you can adjust this logic)
  if (!remainingIntersection.value) return 0
  const count = relatedMemos.value.length
  
  if (count === 0) {
    return Math.floor(remainingIntersection.value / 30) // Default: once a month
  } else {
    // If there are records, calculate frequency
    const firstMeeting = dayjs(relatedMemos.value[relatedMemos.value.length - 1].date)
    const daysSinceFirst = dayjs().diff(firstMeeting, 'day') || 1
    const frequency = count / daysSinceFirst // meetings per day
    return Math.floor(remainingIntersection.value * frequency)
  }
})

const handleDelete = async () => {
  if (!confirm('确定要删除吗？')) return
  try {
    await api.deleteConnection(person.value.id)
    router.replace('/intersections')
  } catch (error) {
    console.error('Failed to delete connection', error)
  }
}

const openEditModal = () => {
  if (!person.value) return
  editForm.value.name = person.value.name || ''
  editForm.value.birth_date = person.value.birth_date || ''
  showEditModal.value = true
}

const saveConnection = async () => {
  if (!person.value || !editForm.value.name || !editForm.value.birth_date) return
  try {
    await api.updateConnection(person.value.id, editForm.value.name, editForm.value.birth_date)
    showEditModal.value = false
    await fetchPerson()
  } catch (error) {
    console.error('Failed to update connection', error)
  }
}

// Logic for overlapping bars
const myBirth = computed(() => dayjs(store.birthDate))
const otherBirth = computed(() => dayjs(person.value?.birth_date))
const myEnd = computed(() => myBirth.value.add(30000, 'day'))
const otherEnd = computed(() => otherBirth.value.add(30000, 'day'))

const timelineStart = computed(() => myBirth.value.isBefore(otherBirth.value) ? myBirth.value : otherBirth.value)
const timelineEnd = computed(() => myEnd.value.isAfter(otherEnd.value) ? myEnd.value : otherEnd.value)

const totalTimelineDays = computed(() => timelineEnd.value.diff(timelineStart.value, 'day'))

const startYear = computed(() => timelineStart.value.format('YYYY'))
const endYear = computed(() => timelineEnd.value.format('YYYY'))
const currentYear = computed(() => dayjs().format('YYYY'))

const calculatePercent = (date: dayjs.Dayjs) => {
  const days = date.diff(timelineStart.value, 'day')
  return Math.min(100, Math.max(0, (days / totalTimelineDays.value) * 100))
}

const myStartPercent = computed(() => calculatePercent(myBirth.value))
const myWidthPercent = computed(() => calculatePercent(myEnd.value) - myStartPercent.value)

const otherStartPercent = computed(() => calculatePercent(otherBirth.value))
const otherWidthPercent = computed(() => calculatePercent(otherEnd.value) - otherStartPercent.value)

const currentPercent = computed(() => calculatePercent(dayjs()))

const intersectionStartPercent = computed(() => Math.max(myStartPercent.value, otherStartPercent.value))
const intersectionEndPercent = computed(() => Math.min(myStartPercent.value + myWidthPercent.value, otherStartPercent.value + otherWidthPercent.value))
const intersectionWidthPercent = computed(() => Math.max(0, intersectionEndPercent.value - intersectionStartPercent.value))

const totalIntersectionDays = computed(() => {
  const start = myBirth.value.isAfter(otherBirth.value) ? myBirth.value : otherBirth.value
  const end = myEnd.value.isBefore(otherEnd.value) ? myEnd.value : otherEnd.value
  return Math.max(0, end.diff(start, 'day'))
})

const remainingIntersection = computed(() => {
  if (!person.value) return 0
  const myPassed = dayjs().diff(myBirth.value, 'day')
  const otherPassed = dayjs().diff(otherBirth.value, 'day')
  
  const myRemaining = Math.max(0, 30000 - myPassed)
  const otherRemaining = Math.max(0, 30000 - otherPassed)
  
  return Math.min(myRemaining, otherRemaining)
})

onMounted(() => {
  fetchPerson()
  fetchMemos()
})
</script>
