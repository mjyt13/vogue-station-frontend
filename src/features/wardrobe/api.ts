import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

export function useCreateColor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { name: string; hex: string }) => {
      const { data, error } = await api.POST('/colors', { body })
      if (error || !data) throw error ?? new Error('Failed to create color')
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['colors'] }),
  })
}

type PatternMime = 'image/png' | 'image/jpeg' | 'image/webp'

// Dev-only trace of the multi-step upload, to make debugging it easy.
const debugUpload = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.debug('[pattern-upload]', ...args)
}

// These wrap api.POST in standalone functions so their (deep) openapi-fetch
// return types resolve here, not inside useMutation's generic inference — which
// otherwise collapses the /patterns response type to `never`.
async function createPatternRecord(name: string, mime: PatternMime) {
  const { data, error } = await api.POST('/patterns', { body: { name, mime } })
  if (error || !data) throw error ?? new Error('Failed to create pattern')
  return data
}

async function confirmPattern(id: string) {
  const { error } = await api.POST('/patterns/{id}/confirm', { params: { path: { id } } })
  if (error) throw error
}

// Direct-to-storage upload: create the record (→ presigned PUT URL), upload the
// raw bytes straight to storage, then confirm (server validates + thumbnails).
export function useUploadPattern() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, file }: { name: string; file: File }) => {
      const mime = file.type
      if (mime !== 'image/png' && mime !== 'image/jpeg' && mime !== 'image/webp') {
        throw new Error('Use a PNG, JPEG, or WebP image')
      }
      debugUpload('1/3 create record', { name, mime, size: file.size })
      const created = await createPatternRecord(name, mime)
      debugUpload('created', created.pattern.id)

      // No auth header — the presigned URL is the credential.
      debugUpload('2/3 PUT bytes → storage')
      const put = await fetch(created.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': mime },
      })
      debugUpload('PUT status', put.status, put.ok ? 'ok' : 'FAILED')
      if (!put.ok) throw new Error('Upload failed')

      debugUpload('3/3 confirm')
      await confirmPattern(created.pattern.id)
      debugUpload('done', created.pattern.id)
      return created.pattern
    },
    onError: (error) => debugUpload('error', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patterns'] }),
  })
}
