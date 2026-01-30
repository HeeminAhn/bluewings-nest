'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DashboardStats } from '@/types'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardStats>('/admin/stats'),
  })
}
