import {Scanner, ScannerEngine, MicroblinkScannerEngine, MainScannerEngine} from "../renderer/scanners";


const scannerMode = new MicroblinkScannerEngine()


function createScanner(mode:ScannerEngine) {
    return new Scanner(mode)
}


export const scanner = createScanner(scannerMode);
