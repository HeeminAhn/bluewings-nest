'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Category, ListParams } from '@/types'

export function useCategories(params: ListParams = {}) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => api.getList<Category>('categories', params),
  })
}

export function useCategory(id: number | string) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => api.getOne<Category>('categories', id),
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; description?: string; displayOrder: number; color: string }) =>
      api.create<Category>('categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) =>
      api.update<Category>('categories', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => api.remove('categories', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
