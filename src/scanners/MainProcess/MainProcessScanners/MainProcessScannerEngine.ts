import { ScannerEngine } from "../../Shared";

export class MainScannerEngine extends ScannerEngine{
    async scan(buffer:ArrayBuffer){
        return buffer.byteLength
    }
}