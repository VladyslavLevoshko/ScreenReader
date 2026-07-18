import type { RendererAPI } from "./index"

declare global {
  interface Window {
    rendererAPI: RendererAPI;
  }
}
