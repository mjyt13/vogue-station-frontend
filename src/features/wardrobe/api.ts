import { useQuery } from '@tanstack/react-query'
import { api } from '../../shared/api'

// The catalog the user can dress a garment in: their own items + global presets
// + approved public ones (the backend decides which). Swatches use the list's
// thumbnailUrl; the full-res pattern texture is fetched per-selection (see
// features/create/api.ts usePatternDetail).

export function useColors() {
  return useQuery({
    queryKey: ['colors'],
    queryFn: async () => {
      const { data, error } = await api.GET('/colors', {})
      if (error || !data) throw error ?? new Error('Failed to load colors')
      return data.items
    },
  })
}

export function usePatterns() {
  return useQuery({
    queryKey: ['patterns'],
    queryFn: async () => {
      const { data, error } = await api.GET('/patterns', {})
      if (error || !data) throw error ?? new Error('Failed to load patterns')
      return data.items
    },
  })
}
