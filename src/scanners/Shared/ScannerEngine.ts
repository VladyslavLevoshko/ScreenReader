export abstract class ScannerEngine {
    abstract scan(buffer:ArrayBuffer): Promise<any>
}