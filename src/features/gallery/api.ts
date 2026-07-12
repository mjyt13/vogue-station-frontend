import { useQuery } from '@tanstack/react-query'
import { api } from '../../shared/api'

// Approved public looks. Keyed under ['looks', …] so look mutations and admin
// moderation (which invalidate ['looks']) refresh the gallery too.
export function useGallery() {
  return useQuery({
    queryKey: ['looks', 'gallery'],
    queryFn: async () => {
      const { data, error } = await api.GET('/looks/gallery', {
        params: { query: { limit: 50 } },
      })
      if (error || !data) throw error ?? new Error('Failed to load the gallery')
      return data.items
    },
  })
}
