import { create } from 'zustand'

export interface User {
  id: string
  fullName: string
  email: string
  role: string
  isVerified: boolean
  phoneNumber?: string
  avatarUrl?: string
  savedAmount?: number
}

export interface Notification {
  id: string
  title?: string
  message?: string
  read?: boolean
  link?: string
  createdAt?: string
  sentAt?: string
  alertedAt?: string
  alerted_at?: string
  email?: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  notifications: Notification[]
  error: string | null
  loading: boolean
  initialized: boolean
  isLoggingOut: boolean
  login: (data: any) => Promise<User>
  register: (data: any) => Promise<void>
  logout: (redirectTo?: string) => Promise<void>
  checkSession: () => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  clearNotifications: () => Promise<void>
  updateProfile: (data: { fullName: string; phoneNumber: string }) => Promise<void>
}

let inFlightCheckSessionPromise: Promise<void> | null = null

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  notifications: [],
  error: null,
  loading: true,
  initialized: false,
  isLoggingOut: false,

  login: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const res = await response.json()
      if (!response.ok) {
        throw new Error(res.error || 'Login failed')
      }

      set({
        user: res.user,
        isAuthenticated: true,
        loading: false,
        initialized: true,
      })

      await get().checkSession()

      return res.user
    } catch (err: any) {
      set({ error: err.message || 'Login failed', loading: false })
      throw err
    }
  },

  register: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const res = await response.json()
      if (!response.ok) {
        throw new Error(res.error || 'Registration failed')
      }
      set({ loading: false })
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', loading: false })
      throw err
    }
  },

  logout: async (redirectTo = '/login') => {
    set({ isLoggingOut: true, loading: true })
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore network errors on logout API call
    } finally {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo
      } else {
        set({
          user: null,
          isAuthenticated: false,
          notifications: [],
          loading: false,
          initialized: true,
          isLoggingOut: false,
        })
      }
    }
  },

  checkSession: async () => {
    // MEMORY LEAK FIX: Deduplicate concurrent session check calls!
    // When multiple components mount simultaneously using useAuth(), checkSession()
    // could be called in parallel. Reusing the active in-flight promise prevents
    // duplicate network requests and redundant Zustand state update thrashing.
    if (inFlightCheckSessionPromise) {
      return inFlightCheckSessionPromise
    }

    inFlightCheckSessionPromise = (async () => {
      set({ loading: true })
      try {
        const sessionRes = await fetch('/api/auth/me')
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json()
          if (sessionData.user) {
            let notifications: Notification[] = []
            try {
              const notifRes = await fetch('/api/notification')
              if (notifRes.ok) {
                notifications = await notifRes.json()
              }
            } catch {
              // Silence notification fetch failures
            }

            set({
              user: sessionData.user,
              isAuthenticated: true,
              notifications,
              initialized: true,
              loading: false,
            })
            return
          }
        }
        set({ user: null, isAuthenticated: false, initialized: true, loading: false })
      } catch {
        set({ user: null, isAuthenticated: false, initialized: true, loading: false })
      } finally {
        inFlightCheckSessionPromise = null
      }
    })()

    return inFlightCheckSessionPromise
  },

  markNotificationRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }))
  },

  clearNotifications: async () => {
    set({ notifications: [] })
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const res = await response.json()
      if (!response.ok) {
        throw new Error(res.error || 'Failed to update profile')
      }
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
        loading: false,
      }))
    } catch (err: any) {
      set({ error: err.message || 'Failed to update profile', loading: false })
      throw err
    }
  },
}))

import { useEffect } from 'react'

export function useAuth() {
  const store = useAuthStore()

  useEffect(() => {
    if (!store.initialized && store.loading) {
      store.checkSession()
    }
  }, [store.initialized, store.loading, store.checkSession])

  return store
}