'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Post, ListParams } from '@/types'

export function usePosts(params: ListParams = {}) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => api.getList<Post>('posts', params),
  })
}

export function usePost(id: number | string) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => api.getOne<Post>('posts', id),
    enabled: !!id,
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => api.remove('posts', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useUpdatePostCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, categoryId }: { postId: number; categoryId: number | null }) =>
      api.updatePostCategory(postId, categoryId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
