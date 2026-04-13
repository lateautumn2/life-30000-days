<template>
  <div class="space-y-6 pt-4">
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <h2 class="text-2xl font-bold text-gray-800">日程备忘录</h2>
      <div class="flex items-center gap-2">
        <div class="relative">
          <input 
            type="month" 
            v-model="filterMonth"
            class="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-600"
            title="按月份筛选"
          />
          <button v-if="filterMonth" @click="filterMonth = ''" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-white pr-1">
            <X class="w-4 h-4" />
          </button>
        </div>
        <button 
          @click="openAddModal"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
        >
          <Plus class="w-4 h-4" /> 记录
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500">
      加载中...
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredMemos.length === 0" class="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center space-y-4">
      <div class="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen class="w-8 h-8 text-blue-500" />
      </div>
      <h3 class="text-xl font-semibold text-gray-800">还没有任何记录</h3>
      <p class="text-gray-500 max-w-sm mx-auto">记录下每天的生活点滴、感悟或者重要的日程安排。</p>
    </div>

    <!-- Memos List -->
    <div v-else class="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
      <div 
        v-for="memo in paginatedMemos" 
        :key="memo.id"
        class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
      >
        <!-- Timeline dot -->
        <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
          <CalendarDays class="w-4 h-4" />
        </div>
        
        <!-- Card -->
        <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white shadow-sm border border-gray-100 relative transition-all hover:shadow-md flex flex-col md:flex-row gap-4 items-start">
          <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 backdrop-blur rounded-lg p-1">
            <button 
              @click="openEditModal(memo)"
              class="text-gray-400 hover:text-blue-500 p-1"
              title="编辑"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button 
              @click="deleteMemo(memo.id)"
              class="text-gray-400 hover:text-red-500 p-1"
              title="删除"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <div class="flex-1 w-full">
            <div class="flex flex-col gap-1 mb-3">
              <time class="text-sm font-mono text-blue-500 font-semibold">{{ memo.date }}</time>
              <span v-if="memo.connection_name" class="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full w-fit flex items-center gap-1">
                <User class="w-3 h-3" /> {{ memo.connection_name }}
              </span>
            </div>
            <div class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ memo.content }}</div>
          </div>

          <div v-if="memo.image" class="w-full md:w-32 h-32 shrink-0 rounded-xl overflow-hidden border border-gray-100 cursor-pointer" @click="previewImage = memo.image">
            <img :src="memo.image" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 mt-8">
      <button 
        @click="currentPage > 1 && currentPage--"
        :disabled="currentPage === 1"
        class="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-500 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-all"
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
        class="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-500 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-all"
        title="下一页"
      >
        <ChevronRight class="w-5 h-5" />
      </button>
    </div>

    <!-- Modal (Add/Edit) -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-800">{{ isEdit ? '编辑记录' : '写点什么...' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="space-y-5">
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">日期</label>
              <input 
                v-model="form.date" 
                type="date" 
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">交集人员 (可选)</label>
              <div class="relative">
                <select 
                  v-model="form.connection_id"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all bg-white"
                >
                  <option value="">无</option>
                  <option v-for="conn in connections" :key="conn.id" :value="conn.id">{{ conn.name }}</option>
                </select>
                <ChevronDown class="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">内容</label>
            <textarea 
              v-model="form.content" 
              rows="4"
              placeholder="今天发生了什么有趣的事情？"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">图片 (可选)</label>
            <div 
              class="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all relative overflow-hidden group"
              @click="fileInput?.click()"
            >
              <input 
                type="file" 
                ref="fileInput" 
                class="hidden" 
                accept="image/*"
                @change="handleImageUpload"
              />
              <template v-if="form.image">
                <img :src="form.image" class="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                <div class="relative z-10 flex flex-col items-center gap-2">
                  <div class="bg-white/80 backdrop-blur p-2 rounded-full shadow-sm text-gray-700">
                    <Image class="w-5 h-5" />
                  </div>
                  <span class="text-sm font-medium text-gray-700 bg-white/80 px-2 py-0.5 rounded">点击更换图片</span>
                </div>
                <button 
                  @click.stop="form.image = ''" 
                  class="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors z-20 shadow-sm"
                >
                  <X class="w-3 h-3" />
                </button>
              </template>
              <template v-else>
                <div class="flex flex-col items-center gap-2 text-gray-400">
                  <div class="bg-gray-50 p-3 rounded-full group-hover:bg-blue-100 transition-colors">
                    <ImagePlus class="w-6 h-6 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <span class="text-sm">点击上传图片 (将自动压缩)</span>
                </div>
              </template>
            </div>
          </div>

          <button 
            @click="saveMemo"
            :disabled="saving"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all shadow-md active:scale-[0.98] mt-2"
          >
            {{ saving ? '保存中...' : '保存记录' }}
          </button>
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

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { Plus, BookOpen, X, Trash2, CalendarDays, Pencil, ChevronDown, User, ImagePlus, Image, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { api } from '@/utils/api'
import dayjs from 'dayjs'

const showModal = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const memos = ref<any[]>([])
const connections = ref<any[]>([])
const filterMonth = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const previewImage = ref('')

const currentPage = ref(1)
const pageSize = 10
const loading = ref(true)

const form = ref({
  id: '',
  date: dayjs().format('YYYY-MM-DD'),
  content: '',
  connection_id: '',
  image: ''
})

const filteredMemos = computed(() => {
  if (!filterMonth.value) return memos.value
  return memos.value.filter(memo => memo.date.startsWith(filterMonth.value))
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

const fetchMemos = async () => {
  loading.value = true
  try {
    memos.value = await api.getMemos()
  } catch (error) {
    console.error('Failed to fetch memos', error)
  } finally {
    loading.value = false
  }
}

const fetchConnections = async () => {
  try {
    connections.value = await api.getConnections()
  } catch (error) {
    console.error('Failed to fetch connections', error)
  }
}

const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = (e) => {
    const img = new window.Image()
    img.src = e.target?.result as string
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX_WIDTH = 800
      const MAX_HEIGHT = 800
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height
          height = MAX_HEIGHT
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Compress to WebP format, 0.7 quality
      const compressedDataUrl = canvas.toDataURL('image/webp', 0.7)
      form.value.image = compressedDataUrl
    }
  }
}

const openAddModal = () => {
  isEdit.value = false
  form.value = {
    id: '',
    date: dayjs().format('YYYY-MM-DD'),
    content: '',
    connection_id: '',
    image: ''
  }
  showModal.value = true
}

const openEditModal = (memo: any) => {
  isEdit.value = true
  form.value = {
    id: memo.id,
    date: memo.date,
    content: memo.content,
    connection_id: memo.connection_id || '',
    image: memo.image || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveMemo = async () => {
  if (!form.value.date || !form.value.content) return
  
  saving.value = true
  try {
    const payload = {
      date: form.value.date,
      content: form.value.content,
      connection_id: form.value.connection_id || undefined,
      image: form.value.image || undefined
    }

    if (isEdit.value) {
      await api.updateMemo(form.value.id, payload)
    } else {
      await api.addMemo(payload)
    }
    closeModal()
    fetchMemos()
  } catch (error) {
    console.error('Failed to save memo', error)
  } finally {
    saving.value = false
  }
}

const deleteMemo = async (id: string) => {
  if (!confirm('确定要删除这条记录吗？')) return
  try {
    await api.deleteMemo(id)
    fetchMemos()
  } catch (error) {
    console.error('Failed to delete memo', error)
  }
}

onMounted(() => {
  fetchMemos()
  fetchConnections()
})
</script>
