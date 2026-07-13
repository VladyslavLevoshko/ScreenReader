export interface RendererAPI {
  ping: () => Promise<string>,
  processImage: (image:ArrayBuffer) => Promise<string>
}