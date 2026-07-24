export abstract class ScannerEngine {
    abstract scan(arrayBuffer:ArrayBuffer): Promise<any>
}