export abstract class ScannerEngine {
    abstract scan(file:File): Promise<any>
}