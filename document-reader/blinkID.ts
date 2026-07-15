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

const blinkIdCore = await loadBlinkIdCore({
  licenseKey: '',
});

const session = await blinkIdCore.createScanningSession({
  inputImageSource: "photo",
  scanningMode: "single",
});

const imageData = await arrayBufferToImageData(frontArrayBuffer);
await session.process(imageData);

const result = await session.getResult();
console.log("First name:", result.firstName?.latin?.value);
console.log("Document number:", result.documentNumber?.latin?.value);
console.log("Date of expiry:", result.dateOfExpiry?.originalString?.latin?.value);

export {};

////////////////////////////////////////////////////

import { loadBlinkIdCore } from "@microblink/blinkid-core";

let blinkIdCore: Awaited<ReturnType<typeof loadBlinkIdCore>> | null = null;

async function getCore() {
  if (!blinkIdCore) {
    blinkIdCore = await loadBlinkIdCore({
      licenseKey: process.env.LICENSE_KEY,
    });
  }
  return blinkIdCore;
}

export class BlinkIDScanner implements PassportScanner {
  async scan(image: ArrayBuffer): Promise<PassportData> {
    const core = await getCore();

    // Новая сессия для каждого документа
    const session = await core.createBlinkIdScanningSession({
      inputImageSource: "photo",
      scanningMode: "single",
    });

    try {
      const imageData = await arrayBufferToImageData(image);
      await session.process(imageData);
      const result = await session.getResult();
      // обработка result...
      return result;
    } finally {
      // Всегда закрываем сессию после использования
      await session.delete();
    }
  }
}