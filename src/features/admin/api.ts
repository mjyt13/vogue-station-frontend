import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api'

type Action = 'approve' | 'reject'

// Resolving a pending look's dependencies needs every pattern/color/model
// (any owner, any status), not just the pending queue — the API caps a page
// at 50 (see cabinet/api.ts's MINE_LIMIT), so request the max.
const ALL_LIMIT = 50

// Moderation queues: patterns/models/colors that requested publish, and
// pending looks.
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

export function usePendingModels() {
  return useQuery({
    queryKey: ['admin', 'models', 'pending'],
    queryFn: async () => {
      const { data, error } = await api.GET('/admin/models', {
        params: { query: { requested: true, status: 'PENDING' } },
      })
      if (error || !data) throw error ?? new Error('Failed to load pending models')
      return data.items
    },
  })
}

export function usePendingColors() {
  return useQuery({
    queryKey: ['admin', 'colors', 'pending'],
    queryFn: async () => {
      const { data, error } = await api.GET('/admin/colors', {
        params: { query: { requested: true, status: 'PENDING' } },
      })
      if (error || !data) throw error ?? new Error('Failed to load pending colors')
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

// Every pattern/color/model regardless of owner or status, used to resolve a
// pending look's dependencies for the "approve these first" modal.
export function useAllPatterns() {
  return useQuery({
    queryKey: ['admin', 'patterns', 'all'],
    queryFn: async () => {
      const { data, error } = await api.GET('/admin/patterns', { params: { query: { limit: ALL_LIMIT } } })
      if (error || !data) throw error ?? new Error('Failed to load patterns')
      return data.items
    },
  })
}

export function useAllColors() {
  return useQuery({
    queryKey: ['admin', 'colors', 'all'],
    queryFn: async () => {
      const { data, error } = await api.GET('/admin/colors', { params: { query: { limit: ALL_LIMIT } } })
      if (error || !data) throw error ?? new Error('Failed to load colors')
      return data.items
    },
  })
}

export function useAllModels() {
  return useQuery({
    queryKey: ['admin', 'models', 'all'],
    queryFn: async () => {
      const { data, error } = await api.GET('/admin/models', { params: { query: { limit: ALL_LIMIT } } })
      if (error || !data) throw error ?? new Error('Failed to load models')
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
async function moderateModelReq(id: string, action: Action) {
  const { error } = await api.PATCH('/admin/models/{id}', {
    params: { path: { id } },
    body: { action },
  })
  if (error) throw error
}
async function moderateColorReq(id: string, action: Action) {
  const { error } = await api.PATCH('/admin/colors/{id}', {
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

export function useModerateModel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: Action }) => moderateModelReq(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['models'] })
    },
  })
}

export function useModerateColor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: Action }) => moderateColorReq(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['colors'] })
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
