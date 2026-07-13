import { contextBridge, ipcRenderer } from 'electron';
import type { RendererAPI } from './types/ipc';

const rendererAPI: RendererAPI = {
  ping: () => ipcRenderer.invoke('ping'),
  processImage: (arrayBuffer:ArrayBuffer) => ipcRenderer.invoke('sendImage', arrayBuffer)
};

contextBridge.exposeInMainWorld("rendererAPI", rendererAPI);