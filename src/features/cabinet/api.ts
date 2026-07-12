import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api'

// The caller's own saved looks (cabinet view).
export function useMyLooks() {
  return useQuery({
    queryKey: ['looks', 'mine'],
    queryFn: async () => {
      const { data, error } = await api.GET('/looks', { params: { query: { mine: true } } })
      if (error || !data) throw error ?? new Error('Failed to load looks')
      return data.items
    },
  })
}

// The caller's own patterns (cabinet view).
export function useMyPatterns() {
  return useQuery({
    queryKey: ['patterns', 'mine'],
    queryFn: async () => {
      const { data, error } = await api.GET('/patterns', { params: { query: { mine: true } } })
      if (error || !data) throw error ?? new Error('Failed to load patterns')
      return data.items
    },
  })
}

// Standalone request helpers keep openapi-fetch's response types out of
// useMutation's generic inference (which otherwise collapses them to `never`).
async function publishLookReq(id: string) {
  const { error } = await api.POST('/looks/{id}/publish', { params: { path: { id } } })
  if (error) throw error
}
async function publishPatternReq(id: string) {
  const { error } = await api.POST('/patterns/{id}/publish', { params: { path: { id } } })
  if (error) throw error
}

export function useDeleteLook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE('/looks/{id}', { params: { path: { id } } })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['looks'] }),
  })
}

export function useDeletePattern() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE('/patterns/{id}', { params: { path: { id } } })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patterns'] }),
  })
}

export function usePublishLook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: publishLookReq,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['looks'] }),
  })
}

export function usePublishPattern() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: publishPatternReq,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patterns'] }),
  })
}
