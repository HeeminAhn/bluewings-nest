'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Match, ListParams } from '@/types'

export function useMatches(params: ListParams = {}) {
  return useQuery({
    queryKey: ['matches', params],
    queryFn: () => api.getList<Match>('matches', params),
  })
}

export function useMatch(id: number | string) {
  return useQuery({
    queryKey: ['matches', id],
    queryFn: () => api.getOne<Match>('matches', id),
    enabled: !!id,
  })
}

export function useCreateMatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: unknown) => api.create<Match>('matches', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
    },
  })
}

export function useUpdateMatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      api.update<Match>('matches', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
    },
  })
}

export function useDeleteMatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => api.remove('matches', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
    },
  })
}
