import { MicroblinkScannerEngine, MainProcessScannerProxy } from "../scanners/RendererProcess";
import { Scanner } from "../scanners/Shared";

const scannerMode = "microblink"

async function createScanner(mode: "microblink" | "mainprocess") {
    switch (mode) {
        case "microblink":
            window.rendererAPI.initMicroblinkResourceServer();
            return new Scanner(new MicroblinkScannerEngine());

        case "mainprocess":
            await window.rendererAPI.initMainScanner();
            return new Scanner(new MainProcessScannerProxy());

        default:
            throw new Error("Unknown scanner mode");
    }
}

export const scanner = await createScanner(scannerMode);
