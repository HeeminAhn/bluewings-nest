'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Report, ListParams } from '@/types'

export function useReports(params: ListParams = {}) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: () => api.getList<Report>('reports', params),
  })
}

export function useReport(id: number | string) {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: () => api.getOne<Report>('reports', id),
    enabled: !!id,
  })
}

export function useUpdateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status: string; adminNote?: string } }) =>
      api.update<Report>('reports', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
