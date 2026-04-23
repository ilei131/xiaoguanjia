import { create } from 'zustand'

interface User {
  id: number
  email: string
  role: string
  name?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      if (!response.ok) {
        throw new Error('登录失败')
      }
      
      const data = await response.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        id: data.user_id,
        email: data.email,
        role: data.role,
        name: data.name
      }))
      
      set({
        user: {
          id: data.user_id,
          email: data.email,
          role: data.role,
          name: data.name
        },
        token: data.token,
        isLoading: false,
        isAuthenticated: true
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '登录失败',
        isLoading: false 
      })
    }
  },
  
  register: async (name, email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: name, email, password }),
      })
      
      if (!response.ok) {
        throw new Error('注册失败')
      }
      
      const data = await response.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        id: data.user_id,
        email: data.email,
        role: data.role,
        name: data.name
      }))
      
      set({
        user: {
          id: data.user_id,
          email: data.email,
          role: data.role,
          name: data.name
        },
        token: data.token,
        isLoading: false,
        isAuthenticated: true
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '注册失败',
        isLoading: false 
      })
    }
  },
  
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },
  
  clearError: () => {
    set({ error: null })
  }
}))
