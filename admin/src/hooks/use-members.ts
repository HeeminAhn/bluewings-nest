'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Member, ListParams } from '@/types'

export function useMembers(params: ListParams = {}) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: () => api.getList<Member>('members', params),
  })
}

export function useMember(id: number | string) {
  return useQuery({
    queryKey: ['members', id],
    queryFn: () => api.getOne<Member>('members', id),
    enabled: !!id,
  })
}

export function useBlockMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ memberId, reason }: { memberId: number; reason: string }) =>
      api.blockMember(memberId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}

export function useUnblockMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberId: number) => api.unblockMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}

export function useUpdateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: unknown }) =>
      api.update<Member>('members', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}
