import { contextBridge, ipcRenderer } from 'electron';

export interface RendererAPI {
  initMainScanner: () => Promise<string>,
  sendImageForProcessing: (image:ArrayBuffer) => Promise<string>,
  initMicroblinkResourceServer: () => void
}

const rendererAPI: RendererAPI = {
  initMainScanner: () => ipcRenderer.invoke('initMainScanner'),
  sendImageForProcessing: (arrayBuffer:ArrayBuffer) => ipcRenderer.invoke('sendImage', arrayBuffer),
  initMicroblinkResourceServer: () => ipcRenderer.invoke('initMicroblinkResourceServer')
};

contextBridge.exposeInMainWorld("rendererAPI", rendererAPI)

