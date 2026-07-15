import { PassportData, PassportScanner } from "../types/docReaderTypes";
import { loadBlinkIdCore } from "@microblink/blinkid-core";

async function arrayBufferToImageData(buffer: ArrayBuffer): Promise<ImageData> {
  const blob = new Blob([buffer]);
  const url = URL.createObjectURL(blob);
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
    licenseKey: process.env.LICENSE_KEY,
    });

    const session = await blinkIdCore.createScanningSession({
    inputImageSource: "photo",
    scanningMode: "single",
    });

    return session
}

export class BlinkIDScanner implements PassportScanner {
    async scan(image: ArrayBuffer): Promise<PassportData> {
        const imageData = await arrayBufferToImageData(image);
        await session.process(imageData);
        const result = await session.getResult();
    }
}