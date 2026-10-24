/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional Visual Crossing key baked in at build time. */
  readonly VITE_VISUAL_CROSSING_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
