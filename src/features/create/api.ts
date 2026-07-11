import { useQuery } from '@tanstack/react-query'
import { api } from '../../shared/api'

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
