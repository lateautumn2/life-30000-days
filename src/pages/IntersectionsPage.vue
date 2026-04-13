<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">交集人员</h2>
      <button 
        @click="showAddModal = true"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
      >
        <Plus class="w-4 h-4" /> 添加
      </button>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500">
      加载中...
    </div>

    <!-- Empty State -->
    <div v-else-if="connections.length === 0" class="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center space-y-4">
      <div class="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users class="w-8 h-8 text-blue-500" />
      </div>
      <h3 class="text-xl font-semibold text-gray-800">还没有添加交集人员</h3>
      <p class="text-gray-500 max-w-sm mx-auto">添加你生命中重要的人，看看你们在这三万天里，还有多少交集。</p>
    </div>

    <!-- Connections List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="person in connections" 
        :key="person.id"
        class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative group"
        @click="$router.push(`/intersections/${person.id}`)"
      >
        <button 
          @click.stop="deleteConnection(person.id)"
          class="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 class="w-4 h-4" />
        </button>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 rounded-full flex items-center justify-center text-xl font-bold">
            {{ person.name.charAt(0) }}
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              {{ person.name }}
              <span class="text-xs font-normal text-gray-400">({{ person.birth_date }})</span>
            </h3>
            <p class="text-sm text-gray-500 mt-0.5">剩余交集：<span class="font-mono text-blue-600 font-semibold">{{ calculateIntersection(person.birth_date) }}</span> 天</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-800">添加人员</h3>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input 
              v-model="newPerson.name" 
              type="text" 
              placeholder="例如：妈妈、李雷"
              class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">出生年月</label>
            <input 
              v-model="newPerson.birth_date" 
              type="date" 
              class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            @click="addConnection"
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
import { ref, onMounted } from 'vue'
import { Plus, Users, X, Trash2 } from 'lucide-vue-next'
import { useAppStore } from '@/store'
import { api } from '@/utils/api'
import dayjs from 'dayjs'

const store = useAppStore()
const showAddModal = ref(false)
const connections = ref<any[]>([])
const loading = ref(true)

const newPerson = ref({
  name: '',
  birth_date: ''
})

const fetchConnections = async () => {
  loading.value = true
  try {
    connections.value = await api.getConnections()
  } catch (error) {
    console.error('Failed to fetch connections', error)
  } finally {
    loading.value = false
  }
}

const addConnection = async () => {
  if (!newPerson.value.name || !newPerson.value.birth_date) return
  
  try {
    await api.addConnection(newPerson.value.name, newPerson.value.birth_date)
    showAddModal.value = false
    newPerson.value = { name: '', birth_date: '' }
    fetchConnections()
  } catch (error) {
    console.error('Failed to add connection', error)
  }
}

const deleteConnection = async (id: string) => {
  if (!confirm('确定要删除吗？')) return
  try {
    await api.deleteConnection(id)
    fetchConnections()
  } catch (error) {
    console.error('Failed to delete connection', error)
  }
}

const calculateIntersection = (otherBirthDate: string) => {
  if (!store.birthDate) return 0
  const myPassed = dayjs().diff(dayjs(store.birthDate), 'day')
  const otherPassed = dayjs().diff(dayjs(otherBirthDate), 'day')
  
  const myRemaining = Math.max(0, 30000 - myPassed)
  const otherRemaining = Math.max(0, 30000 - otherPassed)
  
  return Math.min(myRemaining, otherRemaining)
}

onMounted(() => {
  fetchConnections()
})
</script>
