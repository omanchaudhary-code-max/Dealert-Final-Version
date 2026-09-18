import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/hooks/useAuth'
import { useToastStore } from '@/hooks/useToast'

export interface NotificationItem {
  id: string
  title?: string
  message?: string
  read: boolean
  link?: string
  createdAt?: string
  sentAt?: string
  alertedAt?: string
  alerted_at?: string
  email?: string
  status?: string
}

export interface UnreadCountResponse {
  unreadCount: number
}

function showErrorToast(error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : fallbackMessage
  useToastStore.getState().showToast({
    message,
    variant: 'warning',
  })
}

export function useNotifications() {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Query 1: Full notifications list
  const { data: notifications = [], isLoading, error } = useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notification')
      if (!res.ok) {
        if (res.status === 401) return []
        throw new Error('Failed to fetch notifications')
      }
      return await res.json()
    },
    enabled: isAuthenticated,
    retry: false,
  })

  // Query 2: Unread badge count query
  const { data: countData } = useQuery<UnreadCountResponse>({
    queryKey: ['notifications-count'],
    queryFn: async () => {
      const res = await fetch('/api/notification/count')
      if (!res.ok) {
        return { unreadCount: notifications.filter((n) => !n.read).length }
      }
      return await res.json()
    },
    enabled: isAuthenticated,
  })

  // Computed unread count from API or list fallback
  const unreadCount = countData?.unreadCount ?? notifications.filter((n) => !n.read).length

  // Mutation 1: Mark single notification as read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notification/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to mark notification as read')
      }
      return data
    },
    onSuccess: () => {
      // Invalidate BOTH query keys together after marking read
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
    },
    onError: (err) => {
      showErrorToast(err, 'Failed to mark notification as read')
    },
  })

  // Mutation 2: Mark ALL notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notification', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to mark all notifications as read')
      }
      return data
    },
    onSuccess: () => {
      // Invalidate BOTH query keys together
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
    },
    onError: (err) => {
      showErrorToast(err, 'Failed to mark all notifications as read')
    },
  })

  // Mutation 3: Clear all notifications
  const clearNotificationsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notification', {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to clear notifications')
      }
      return data
    },
    onSuccess: () => {
      // Invalidate BOTH query keys together
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
    },
    onError: (err) => {
      showErrorToast(err, 'Failed to clear notifications')
    },
  })

  const markNotificationRead = (id: string) => {
    return markReadMutation.mutateAsync(id).catch(() => undefined)
  }

  const markAllNotificationsRead = () => {
    return markAllReadMutation.mutateAsync().catch(() => undefined)
  }

  const clearNotifications = () => {
    return clearNotificationsMutation.mutateAsync().catch(() => undefined)
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    isPending:
      markReadMutation.isPending || markAllReadMutation.isPending || clearNotificationsMutation.isPending,
  }
}
