import { ScannerEngine } from "./ScannerEngine";

export class Scanner {
    private scannerEngine:ScannerEngine;
    constructor(scannerEngine:ScannerEngine){
        this.scannerEngine = scannerEngine;
    }

    async scan(file:ArrayBuffer){
        return await this.scannerEngine.scan(file)
    }
}