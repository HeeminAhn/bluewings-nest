'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'

interface User {
  id: number
  email: string
  nickname: string
  role: string
  profileImageUrl?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const data = await api.login(email, password)

          if (data.member.role !== 'ADMIN') {
            throw new Error('관리자 권한이 없습니다.')
          }

          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)

          set({
            user: data.member,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, isAuthenticated: false })
      },

      checkAuth: () => {
        const token = localStorage.getItem('accessToken')
        const { user } = get()

        if (!token || !user) {
          set({ isAuthenticated: false, user: null })
          return false
        }

        if (user.role !== 'ADMIN') {
          set({ isAuthenticated: false, user: null })
          return false
        }

        set({ isAuthenticated: true })
        return true
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
