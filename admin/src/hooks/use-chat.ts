'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ChatMessage, ListParams } from '@/types'

export function useChatMessages(params: ListParams = {}) {
  return useQuery({
    queryKey: ['chat', params],
    queryFn: () => api.getList<ChatMessage>('chat/messages', params),
  })
}

export function useDeleteChatMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => api.remove('chat/messages', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat'] })
    },
  })
}
