'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AccessLog, ListParams } from '@/types'

export function useAccessLogs(params: ListParams = {}) {
  return useQuery({
    queryKey: ['access-logs', params],
    queryFn: () => api.getList<AccessLog>('access-logs', params),
  })
}
