import { contextBridge, ipcRenderer } from 'electron';
import preload from '@electron-toolkit/preload'

export interface RendererAPI {
  initMainScanner: () => Promise<string>,
  sendImageForProcessing: (image:ArrayBuffer) => Promise<string>
}

const rendererAPI: RendererAPI = {
  initMainScanner: () => ipcRenderer.invoke('initMainScanner'),
  sendImageForProcessing: (arrayBuffer:ArrayBuffer) => ipcRenderer.invoke('sendImage', arrayBuffer)
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", preload.electronAPI)
    contextBridge.exposeInMainWorld("rendererAPI", rendererAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // fallback for non-isolated contexts
  // @ts-ignore
  window.electron = preload.electronAPI
  // @ts-ignore
  window.rendererAPI = rendererAPI
}