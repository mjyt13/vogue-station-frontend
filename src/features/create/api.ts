import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api'
import type { CreateLookDto } from '../../shared/api'

// Presigned URLs (glbUrl / patternUrl) live ~10 min, so the detail queries use a
// short staleTime and refetch to hand out fresh URLs.
const PRESIGNED_STALE = 5 * 60_000

export function useModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const { data, error } = await api.GET('/models', {})
      if (error || !data) throw error ?? new Error('Failed to load models')
      return data.items
    },
  })
}

// The garment's presigned .glb URL. Enabled once we know which model to load.
export function useModel(id: string | undefined) {
  return useQuery({
    queryKey: ['model', id],
    enabled: !!id,
    staleTime: PRESIGNED_STALE,
    queryFn: async () => {
      const { data, error } = await api.GET('/models/{id}', { params: { path: { id: id! } } })
      if (error || !data) throw error ?? new Error('Failed to load model')
      return data
    },
  })
}

// The selected pattern's full-res presigned texture URL (patternUrl).
export function usePatternDetail(id: string | null) {
  return useQuery({
    queryKey: ['pattern', id],
    enabled: !!id,
    staleTime: PRESIGNED_STALE,
    queryFn: async () => {
      const { data, error } = await api.GET('/patterns/{id}', { params: { path: { id: id! } } })
      if (error || !data) throw error ?? new Error('Failed to load pattern')
      return data
    },
  })
}

// A saved look, for reopening it in the editor.
export function useLook(id: string | null) {
  return useQuery({
    queryKey: ['look', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await api.GET('/looks/{id}', { params: { path: { id: id! } } })
      if (error || !data) throw error ?? new Error('Failed to load look')
      return data
    },
  })
}

export function useSaveLook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateLookDto) => {
      const { data, error } = await api.POST('/looks', { body })
      if (error || !data) throw error ?? new Error('Failed to save look')
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['looks'] }),
  })
}

// Update an existing look in place (PUT). UpdateLookDto is the same fields, all
// optional, so a full CreateLookDto payload is a valid update body.
export function useUpdateLook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: CreateLookDto }) => {
      const { data, error } = await api.PUT('/looks/{id}', { params: { path: { id } }, body })
      if (error || !data) throw error ?? new Error('Failed to update look')
      return data
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['looks'] })
      queryClient.invalidateQueries({ queryKey: ['look', id] })
    },
  })
}
