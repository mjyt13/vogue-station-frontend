// Normalizes a Nest error body (`{ message: string | string[], ... }`) or a
// thrown Error into a display string for forms/toasts.
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message
    if (Array.isArray(message)) return message.filter((m) => typeof m === 'string').join(', ')
    if (typeof message === 'string') return message
  }
  if (error instanceof Error) return error.message
  return fallback
}
