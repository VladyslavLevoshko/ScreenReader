export interface RendererAPI {
  ping: () => Promise<string>,
  sendFile: (file:ArrayBuffer) => Promise<string>
}