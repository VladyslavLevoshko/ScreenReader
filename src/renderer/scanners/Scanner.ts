import { ScannerEngine } from "./ScannerEngine";

export class Scanner {
    private scanner:ScannerEngine;
    constructor(scanner:ScannerEngine){
        this.scanner = scanner;
    }

    async scan(file:File){
        return await this.scanner.scan(file)
    }
}