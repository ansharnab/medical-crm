/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API origin, e.g. http://localhost:4001 */
  readonly VITE_API_URL: string;
  /** Vite dev-server proxy target for /api */
  readonly VITE_PROXY_TARGET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
