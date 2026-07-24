import { ScannerEngine } from "./ScannerEngine";

export class Scanner {
    private scannerEngine:ScannerEngine;
    constructor(scannerEngine:ScannerEngine){
        this.scannerEngine = scannerEngine;
    }

    async scan(buffer:ArrayBuffer){
        return await this.scannerEngine.scan(buffer)
    }
}