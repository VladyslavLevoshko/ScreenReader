import { contextBridge, ipcRenderer } from 'electron';
import type { RendererAPI } from './types/ipc';

const api: RendererAPI = {
  ping: () => ipcRenderer.invoke('ping'),
  sendFile: (arg:ArrayBuffer) => ipcRenderer.invoke('SendFile', arg)
};

contextBridge.exposeInMainWorld("api", api);