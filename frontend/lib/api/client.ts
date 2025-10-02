import axios from 'axios'
import { auth } from '@/lib/firebase/config'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const apiClient = axios.create({
  baseURL: API_URL,
})

apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const blogApi = {
  getBlogs: (params?: any) => apiClient.get('/blogs', { params }),
  getBlog: (slug: string) => apiClient.get(`/blogs/${slug}`),
  getBlogById: (id: string) => apiClient.get(`/blogs/id/${id}`),
  getPopularBlogs: (limit?: number) => apiClient.get('/blogs/popular', { params: { limit } }),
  createBlog: (data: any) => apiClient.post('/blogs', data),
  updateBlog: (id: string, data: any) => apiClient.patch(`/blogs/${id}`, data),
  deleteBlog: (id: string) => apiClient.delete(`/blogs/${id}`),
  likeBlog: (id: string) => apiClient.post(`/blogs/${id}/like`),
}

export const commentApi = {
  getComments: (blogId: string) => apiClient.get(`/comments/blog/${blogId}`),
  createComment: (data: any) => apiClient.post('/comments', data),
  deleteComment: (id: string) => apiClient.delete(`/comments/${id}`),
}

export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const authApi = {
  verifyToken: (token: string) => apiClient.post('/auth/verify', { token }),
  getCurrentUser: () => apiClient.post('/auth/me'),
}