import { contextBridge, ipcRenderer } from 'electron';

export interface RendererAPI {
  initMainScanner: () => Promise<string>,
  sendImageForProcessing: (image:ArrayBuffer) => Promise<string>
}

const rendererAPI: RendererAPI = {
  initMainScanner: () => ipcRenderer.invoke('initMainScanner'),
  sendImageForProcessing: (arrayBuffer:ArrayBuffer) => ipcRenderer.invoke('sendImage', arrayBuffer)
};

contextBridge.exposeInMainWorld("rendererAPI", rendererAPI)

