// The access token lives only in memory (module scope) — never localStorage,
// per the backend integration guide. This module is the API singleton's memory.
let accessToken: string | null = null

export const getAccessToken = () => accessToken
export const setAccessToken = (token: string | null) => {
  accessToken = token
}
export const clearAccessToken = () => {
  accessToken = null
}
