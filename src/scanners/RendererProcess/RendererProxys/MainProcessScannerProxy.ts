import { ScannerEngine } from "../../Shared/ScannerEngine";

export class MainProcessScannerProxy extends ScannerEngine {
    async scan(buffer:ArrayBuffer){
        const answer = await window.rendererAPI.sendImageForProcessing(buffer);
        return answer    
    }
}