import type { RendererAPI } from "./ipc";

declare global {
  interface Window {
    rendererAPI: RendererAPI;
  }
}

export {};