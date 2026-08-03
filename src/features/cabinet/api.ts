import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api'

// `mine` lists are paginated server-side (default limit 20, API max 50). The
// cabinet's own listings and the publish-blocking dependency check both need
// the caller's *whole* collection, not just a page of it — request the max so
// an owner with >20 patterns/colors/models doesn't silently drop some (a look
// referencing item #21 would otherwise never be flagged as needing publish).
const MINE_LIMIT = 50

// The caller's own saved looks (cabinet view).
export function useMyLooks() {
  return useQuery({
    queryKey: ['looks', 'mine'],
    queryFn: async () => {
      const { data, error } = await api.GET('/looks', {
        params: { query: { mine: true, limit: MINE_LIMIT } },
      })
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
      const { data, error } = await api.GET('/patterns', {
        params: { query: { mine: true, limit: MINE_LIMIT } },
      })
      if (error || !data) throw error ?? new Error('Failed to load patterns')
      return data.items
    },
  })
}

// The caller's own colors (used to check whether a look's color blocks publish).
export function useMyColors() {
  return useQuery({
    queryKey: ['colors', 'mine'],
    queryFn: async () => {
      const { data, error } = await api.GET('/colors', {
        params: { query: { mine: true, limit: MINE_LIMIT } },
      })
      if (error || !data) throw error ?? new Error('Failed to load colors')
      return data.items
    },
  })
}

// The caller's own models (used to check whether a look's model blocks publish).
export function useMyModels() {
  return useQuery({
    queryKey: ['models', 'mine'],
    queryFn: async () => {
      const { data, error } = await api.GET('/models', {
        params: { query: { mine: true, limit: MINE_LIMIT } },
      })
      if (error || !data) throw error ?? new Error('Failed to load models')
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
async function publishColorReq(id: string) {
  const { error } = await api.POST('/colors/{id}/publish', { params: { path: { id } } })
  if (error) throw error
}
async function publishModelReq(id: string) {
  const { error } = await api.POST('/models/{id}/publish', { params: { path: { id } } })
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

export function usePublishColor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: publishColorReq,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['colors'] }),
  })
}

export function usePublishModel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: publishModelReq,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['models'] }),
  })
}
