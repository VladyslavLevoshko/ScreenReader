import {app, BrowserWindow, ipcMain} from 'electron'
import path from 'path'

import "dotenv/config"
const key = process.env.LICENSE_KEY;


const createWindow = () => {
  const win = new BrowserWindow({
    width: 700,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(createWindow);

ipcMain.handle('ping', () => 'pong');
ipcMain.handle('sendImage', (_event, arrayBuffer:ArrayBuffer ) => {
  return arrayBuffer.byteLength
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
