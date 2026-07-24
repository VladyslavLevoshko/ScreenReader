/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MICROBLINK_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}