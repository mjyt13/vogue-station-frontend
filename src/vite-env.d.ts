/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the vogue-station-backend API (see .env). */
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
