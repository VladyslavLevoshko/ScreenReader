import { ScannerEngine } from "./ScannerEngine";
import { loadBlinkIdCore } from "@microblink/blinkid-core";

export class MicroblinkScannerEngine extends ScannerEngine{
    async scan(file:File){
        async function preprocessedImage(file){
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.src = url;
            try {
                await new Promise<void>((resolve) => {
                img.onload = () => resolve();
                });
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                if (!ctx) throw new Error("Could not get canvas context");
                ctx.drawImage(img, 0, 0);
                return ctx.getImageData(0, 0, canvas.width, canvas.height);
            } finally {
                URL.revokeObjectURL(url);
            }
        }

        async function init(){
            const blinkIdCore = await loadBlinkIdCore({
                licenseKey: import.meta.env.VITE_MICROBLINK_KEY,
                resourcesLocation: "http://localhost:5173/resources",
            });
            const session = await blinkIdCore.createScanningSession({
                inputImageSource: "photo",
                scanningMode: "single",
            });
            return session
        }

        const session = await init();
        const preImage = await preprocessedImage(file)
        await session.process(preImage);
        const result = await session.getResult();
        console.log(result)
        return result
    }
}
