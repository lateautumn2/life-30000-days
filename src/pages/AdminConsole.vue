<template>
  <div class="min-h-screen bg-gray-50 flex flex-col md:flex-row">
    <!-- Sidebar -->
    <aside class="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-auto md:h-screen">
      <div class="p-6 flex items-center justify-between md:block">
        <h1 class="text-xl font-bold text-gray-800 tracking-wider">管理控制台</h1>
        <router-link to="/" class="text-blue-500 text-sm hover:underline md:hidden">返回首页</router-link>
      </div>
      <nav class="flex flex-row md:flex-col px-4 md:px-0 gap-2 md:gap-1 overflow-x-auto md:flex-1 border-b md:border-none border-gray-200 pb-2 md:pb-0">
        <button 
          @click="activeTab = 'quotes'"
          :class="['whitespace-nowrap px-4 py-3 md:mx-4 md:rounded-xl text-left transition-colors font-medium text-sm md:text-base', activeTab === 'quotes' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50']"
        >
          劝勉语管理
        </button>
        <button 
          @click="activeTab = 'users'"
          :class="['whitespace-nowrap px-4 py-3 md:mx-4 md:rounded-xl text-left transition-colors font-medium text-sm md:text-base', activeTab === 'users' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50']"
        >
          用户管理
        </button>
        <button 
          @click="activeTab = 'backup'"
          :class="['whitespace-nowrap px-4 py-3 md:mx-4 md:rounded-xl text-left transition-colors font-medium text-sm md:text-base', activeTab === 'backup' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50']"
        >
          数据备份
        </button>
      </nav>
      <div class="hidden md:block p-4 mt-auto border-t border-gray-100">
        <router-link to="/" class="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors w-full px-4 py-2">
          <ArrowLeft class="w-4 h-4" /> 返回首页
        </router-link>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-4 md:p-8 overflow-y-auto h-auto md:h-screen">
      
      <!-- Quotes Management -->
      <div v-if="activeTab === 'quotes'" class="max-w-4xl mx-auto space-y-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold text-gray-800 mb-4">劝勉语来源设置</h2>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="quoteSource" value="local" @change="updateQuoteSource" class="text-blue-500 focus:ring-blue-500">
              <span class="text-gray-700">本地列表</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="quoteSource" value="online" @change="updateQuoteSource" class="text-blue-500 focus:ring-blue-500">
              <span class="text-gray-700">在线一言 (Hitokoto)</span>
            </label>
          </div>
        </div>

        <div v-if="quoteSource === 'local'" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 class="text-lg font-bold text-gray-800">本地劝勉语列表</h2>
            <button @click="showAddQuoteModal = true" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
              添加劝勉语
            </button>
          </div>
          <ul class="divide-y divide-gray-100">
            <li v-for="quote in quotes" :key="quote.id" class="p-4 md:p-6 flex justify-between items-start gap-4 hover:bg-gray-50 transition-colors">
              <div>
                <p class="text-gray-800">{{ quote.content }}</p>
                <p class="text-xs text-gray-400 mt-1" v-if="quote.source">—— {{ quote.source }}</p>
              </div>
              <button @click="deleteQuote(quote.id)" class="text-gray-400 hover:text-red-500 p-2 shrink-0">
                <Trash2 class="w-4 h-4" />
              </button>
            </li>
            <li v-if="quotes.length === 0" class="p-8 text-center text-gray-500">暂无数据</li>
          </ul>
        </div>
      </div>

      <!-- Users Management -->
      <div v-if="activeTab === 'users'" class="max-w-4xl mx-auto space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 class="text-lg font-bold text-gray-800">注册账户管理</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 text-gray-500 text-sm">
                  <th class="p-4 font-medium">昵称</th>
                  <th class="p-4 font-medium">邮箱</th>
                  <th class="p-4 font-medium">角色</th>
                  <th class="p-4 font-medium">注册时间</th>
                  <th class="p-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                  <td class="p-4 text-gray-800">{{ user.name }}</td>
                  <td class="p-4 text-gray-600">{{ user.email }}</td>
                  <td class="p-4">
                    <span :class="['px-2 py-1 text-xs rounded-md font-medium', user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700']">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="p-4 text-gray-500 text-sm">{{ new Date(user.created_at).toLocaleDateString() }}</td>
                  <td class="p-4">
                    <button 
                      @click="deleteUser(user.id)" 
                      class="text-gray-400 hover:text-red-500 transition-colors"
                      :disabled="user.id === store.user?.id"
                      :class="{'opacity-30 cursor-not-allowed': user.id === store.user?.id}"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Backup & Restore -->
      <div v-if="activeTab === 'backup'" class="max-w-4xl mx-auto space-y-6">
        <!-- Export Section -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold text-gray-800 mb-4">导出备份</h2>
          <p class="text-sm text-gray-500 mb-4">将数据库数据导出为文件，建议定期备份。</p>
          <div class="flex flex-wrap gap-3">
            <button
              @click="exportSqlite"
              :disabled="backingUp"
              class="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Download class="w-4 h-4" />
              {{ backingUp && backupFormat === 'sqlite' ? '导出中...' : '导出 SQLite 文件' }}
            </button>
            <button
              @click="exportJson"
              :disabled="backingUp"
              class="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Download class="w-4 h-4" />
              {{ backingUp && backupFormat === 'json' ? '导出中...' : '导出 JSON 文件' }}
            </button>
          </div>
        </div>

        <!-- Import Section -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 class="text-lg font-bold text-gray-800 mb-4">导入恢复</h2>
          <p class="text-sm text-red-500 mb-4 font-medium">
            警告：恢复操作将替换当前所有数据，请确认备份文件无误后再执行。
          </p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选择备份文件（.sqlite 或 .json）</label>
              <input
                ref="fileInputRef"
                type="file"
                accept=".sqlite,.json"
                @change="onFileSelected"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
            </div>
            <div v-if="selectedFile" class="flex items-center gap-3">
              <span class="text-sm text-gray-600">已选择: {{ selectedFile.name }}</span>
              <button
                @click="restoreFile"
                :disabled="restoring"
                class="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Upload class="w-4 h-4" />
                {{ restoring ? '恢复中...' : '确认恢复' }}
              </button>
              <button
                @click="clearFile"
                :disabled="restoring"
                class="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                取消
              </button>
            </div>
            <div v-if="restoreMessage" :class="['text-sm p-3 rounded-xl', restoreError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600']">
              {{ restoreMessage }}
            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- Add Quote Modal -->
    <div v-if="showAddQuoteModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">添加劝勉语</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">内容</label>
            <textarea v-model="newQuote.content" rows="3" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">来源/作者 (可选)</label>
            <input v-model="newQuote.source" type="text" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div class="flex gap-3 pt-2">
            <button @click="showAddQuoteModal = false" class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">取消</button>
            <button @click="addQuote" class="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600">保存</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft, Trash2, Download, Upload } from 'lucide-vue-next'
import { api } from '@/utils/api'
import { useAppStore } from '@/store'

const store = useAppStore()
const activeTab = ref('quotes')
const quoteSource = ref('local')

const quotes = ref<any[]>([])
const users = ref<any[]>([])

const showAddQuoteModal = ref(false)
const newQuote = ref({ content: '', source: '' })

// Backup & Restore state
const backingUp = ref(false)
const backupFormat = ref('')
const restoring = ref(false)
const restoreMessage = ref('')
const restoreError = ref(false)
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const exportSqlite = async () => {
  backingUp.value = true
  backupFormat.value = 'sqlite'
  try {
    await api.adminBackupSqlite()
  } catch (error: any) {
    alert(error.message || '导出失败')
  } finally {
    backingUp.value = false
    backupFormat.value = ''
  }
}

const exportJson = async () => {
  backingUp.value = true
  backupFormat.value = 'json'
  try {
    await api.adminBackupJson()
  } catch (error: any) {
    alert(error.message || '导出失败')
  } finally {
    backingUp.value = false
    backupFormat.value = ''
  }
}

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    restoreMessage.value = ''
    restoreError.value = false
  }
}

const clearFile = () => {
  selectedFile.value = null
  restoreMessage.value = ''
  restoreError.value = false
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const restoreFile = async () => {
  if (!selectedFile.value) return
  if (!confirm('警告：此操作将替换当前所有数据，且不可撤销。确定继续吗？')) return

  restoring.value = true
  restoreMessage.value = ''
  restoreError.value = false

  try {
    const file = selectedFile.value
    const isSqlite = file.name.endsWith('.sqlite')

    if (isSqlite) {
      const buffer = await file.arrayBuffer()
      const base64 = arrayBufferToBase64(buffer)
      const result = await api.adminRestore('sqlite', base64)
      restoreMessage.value = result.message || '恢复成功'
    } else {
      const text = await file.text()
      const json = JSON.parse(text)
      // Extract data from the API response wrapper or use the raw object
      const backupData = json.data || json
      const result = await api.adminRestore('json', backupData)
      restoreMessage.value = result.message || '恢复成功'
    }
  } catch (error: any) {
    restoreError.value = true
    restoreMessage.value = error.message || '恢复失败'
  } finally {
    restoring.value = false
    selectedFile.value = null
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

const fetchSettings = async () => {
  try {
    const data = await api.adminGetSettings()
    if (data) {
      quoteSource.value = data.quote_source || 'local'
    }
  } catch (error) {
    console.error(error)
  }
}

const updateQuoteSource = async () => {
  try {
    await api.adminUpdateSettings({ quote_source: quoteSource.value })
  } catch (error) {
    console.error(error)
  }
}

const fetchQuotes = async () => {
  try {
    quotes.value = await api.adminGetQuotes()
  } catch (error) {
    console.error(error)
  }
}

const addQuote = async () => {
  if (!newQuote.value.content) return
  try {
    await api.adminAddQuote(newQuote.value)
    showAddQuoteModal.value = false
    newQuote.value = { content: '', source: '' }
    fetchQuotes()
  } catch (error) {
    console.error(error)
  }
}

const deleteQuote = async (id: string) => {
  if (!confirm('确定删除此劝勉语？')) return
  try {
    await api.adminDeleteQuote(id)
    fetchQuotes()
  } catch (error) {
    console.error(error)
  }
}

const fetchUsers = async () => {
  try {
    users.value = await api.adminGetUsers()
  } catch (error) {
    console.error(error)
  }
}

const deleteUser = async (id: string) => {
  if (id === store.user?.id) return
  if (!confirm('确定删除此用户？删除后不可恢复。')) return
  try {
    await api.adminDeleteUser(id)
    fetchUsers()
  } catch (error: any) {
    alert(error.message || '删除失败')
  }
}

onMounted(() => {
  fetchSettings()
  fetchQuotes()
  fetchUsers()
})
</script>
