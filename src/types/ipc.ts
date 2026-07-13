export interface RendererAPI {
  ping: () => Promise<string>,
  sendImageForProcessing: (image:ArrayBuffer) => Promise<string>
}