import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Auto-refresh token on 401
let isRefreshing = false
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      if (isRefreshing) return Promise.reject(error)
      isRefreshing = true
      original._retry = true
      try {
        await api.post('/auth/refresh')
        isRefreshing = false
        return api(original)
      } catch {
        isRefreshing = false
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

export const resumesApi = {
  list: () => api.get('/resumes'),
  get: (id: string) => api.get(`/resumes/${id}`),
  create: (data?: { title?: string }) => api.post('/resumes', data),
  update: (id: string, data: { title?: string; content?: unknown }) =>
    api.patch(`/resumes/${id}`, data),
  exportPdf: (id: string, data: { html: string; fileName?: string }) =>
    api.post(`/resumes/${id}/export/pdf`, data, { responseType: 'blob' }),
  delete: (id: string) => api.delete(`/resumes/${id}`),
  duplicate: (id: string) => api.post(`/resumes/${id}/duplicate`),
  share: (id: string) => api.post(`/resumes/${id}/share`),
}

export const aiApi = {
  compress: (id: string, data: { overflowingSections?: string[]; level?: 'light' | 'medium' | 'aggressive' }) =>
    api.post(`/ai/compress/${id}`, data),
}
