import { useAppStore } from '../store'

const API_BASE = '/api'

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const store = useAppStore()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  }

  if (store.token) {
    headers['Authorization'] = `Bearer ${store.token}`
  }
  
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  })
  
  if (response.status === 401) {
    store.logout()
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || result.message || '请求失败')
  }

  return result.data !== undefined ? result.data : result
}

export const api = {
  login: (data: any) => fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  register: (data: any) => fetchWithAuth('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getQuote: () => fetchWithAuth('/quote'),
  
  getUser: () => fetchWithAuth('/users/me'),
  updateUser: (data: any) => fetchWithAuth('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  getConnections: () => fetchWithAuth('/connections'),
  getConnection: (id: string) => fetchWithAuth(`/connections/${id}`),
  addConnection: (name: string, birth_date: string) => fetchWithAuth('/connections', {
    method: 'POST',
    body: JSON.stringify({ name, birth_date })
  }),
  deleteConnection: (id: string) => fetchWithAuth(`/connections/${id}`, {
    method: 'DELETE'
  }),
  
  getMemos: () => fetchWithAuth('/memos'),
  addMemo: (data: { date: string, content: string, image?: string, connection_id?: string }) => fetchWithAuth('/memos', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateMemo: (id: string, data: { date: string, content: string, image?: string, connection_id?: string }) => fetchWithAuth(`/memos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteMemo: (id: string) => fetchWithAuth(`/memos/${id}`, {
    method: 'DELETE'
  }),

  // Admin APIs
  adminGetUsers: () => fetchWithAuth('/admin/users'),
  adminAddUser: (data: any) => fetchWithAuth('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  adminDeleteUser: (id: string) => fetchWithAuth(`/admin/users/${id}`, {
    method: 'DELETE'
  }),

  adminGetSettings: () => fetchWithAuth('/admin/settings'),
  adminUpdateSettings: (data: any) => fetchWithAuth('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  adminGetQuotes: () => fetchWithAuth('/admin/quotes'),
  adminAddQuote: (data: any) => fetchWithAuth('/admin/quotes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  adminDeleteQuote: (id: string) => fetchWithAuth(`/admin/quotes/${id}`, {
    method: 'DELETE'
  })
}
