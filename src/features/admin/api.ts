import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api'

type Action = 'approve' | 'reject'

// Moderation queues: patterns that requested publish, and pending looks.
export function usePendingPatterns() {
  return useQuery({
    queryKey: ['admin', 'patterns', 'pending'],
    queryFn: async () => {
      const { data, error } = await api.GET('/admin/patterns', {
        params: { query: { requested: true, status: 'PENDING' } },
      })
      if (error || !data) throw error ?? new Error('Failed to load pending patterns')
      return data.items
    },
  })
}

export function usePendingLooks() {
  return useQuery({
    queryKey: ['admin', 'looks', 'pending'],
    queryFn: async () => {
      const { data, error } = await api.GET('/admin/looks', {
        params: { query: { status: 'PENDING' } },
      })
      if (error || !data) throw error ?? new Error('Failed to load pending looks')
      return data.items
    },
  })
}

// Standalone helpers keep openapi-fetch's response types out of useMutation's
// generic inference (which otherwise collapses them to `never`).
async function moderatePatternReq(id: string, action: Action) {
  const { error } = await api.PATCH('/admin/patterns/{id}', {
    params: { path: { id } },
    body: { action },
  })
  if (error) throw error
}
async function moderateLookReq(id: string, action: Action) {
  const { error } = await api.PATCH('/admin/looks/{id}', {
    params: { path: { id } },
    body: { action },
  })
  if (error) throw error
}

export function useModeratePattern() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: Action }) => moderatePatternReq(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['patterns'] })
    },
  })
}

export function useModerateLook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: Action }) => moderateLookReq(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['looks'] })
    },
  })
}
