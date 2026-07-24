import { ipcMain } from "electron";
import { Scanner } from "../../scanners/Shared";
import { MainScannerEngine } from "../../scanners/MainProcess";

export function registerScannerIPC(){
    let scanner:Scanner | null = null;

    ipcMain.handle('initMainScanner', () => {
    scanner = new Scanner(new MainScannerEngine())
    });

    ipcMain.handle('sendImage', (_event, arrayBuffer:ArrayBuffer ) => {
    return scanner?.scan(arrayBuffer)
    });
}