'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Notice, ListParams } from '@/types'

export function useNotices(params: ListParams = {}) {
  return useQuery({
    queryKey: ['notices', params],
    queryFn: () => api.getList<Notice>('notices', params),
  })
}

export function useNotice(id: number | string) {
  return useQuery({
    queryKey: ['notices', id],
    queryFn: () => api.getOne<Notice>('notices', id),
    enabled: !!id,
  })
}

export function useCreateNotice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { title: string; content: string; isPinned: boolean }) =>
      api.create<Notice>('notices', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
    },
  })
}

export function useUpdateNotice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Notice> }) =>
      api.update<Notice>('notices', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
    },
  })
}

export function useDeleteNotice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => api.remove('notices', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
    },
  })
}
