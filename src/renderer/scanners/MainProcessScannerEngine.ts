import { ScannerEngine } from "./ScannerEngine";

export class MainScannerEngine extends ScannerEngine{
    async scan(file:File){
        const buffer = await file.arrayBuffer();
        const answer = await window.rendererAPI.sendImageForProcessing(buffer);
        return answer
    }
}