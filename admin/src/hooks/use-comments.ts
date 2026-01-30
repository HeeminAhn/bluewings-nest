'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Comment, ListParams } from '@/types'

export function useComments(params: ListParams = {}) {
  return useQuery({
    queryKey: ['comments', params],
    queryFn: () => api.getList<Comment>('comments', params),
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => api.remove('comments', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
  })
}
