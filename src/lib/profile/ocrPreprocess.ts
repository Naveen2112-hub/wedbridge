"use client";

export type PreprocessProgress = (step: string, progress: number) => void;

const MAX_DIMENSION = 2000;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  let { naturalWidth: w, naturalHeight: h } = img;
  if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

function grayscale(ctx: CanvasRenderingContext2D, w: number, h: number): ImageData {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    d[i] = d[i + 1] = d[i + 2] = gray;
  }
  ctx.putImageData(imageData, 0, 0);
  return imageData;
}

function increaseContrast(ctx: CanvasRenderingContext2D, w: number, h: number, factor = 1.4): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const intercept = 128 * (1 - factor);
  for (let i = 0; i < d.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      d[i + c] = Math.max(0, Math.min(255, d[i + c] * factor + intercept));
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function denoise(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data;
  const d = dst.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
        d[i] = s[i]; d[i + 1] = s[i + 1]; d[i + 2] = s[i + 2]; d[i + 3] = s[i + 3];
        continue;
      }
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          sum += s[((y + dy) * w + (x + dx)) * 4];
        }
      }
      const avg = Math.round(sum / 9);
      d[i] = d[i + 1] = d[i + 2] = avg;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(dst, 0, 0);
}

function sharpen(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data;
  const d = dst.data;
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      let acc = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ni = ((y + dy) * w + (x + dx)) * 4;
          acc += s[ni] * kernel[(dy + 1) * 3 + (dx + 1)];
        }
      }
      const v = Math.max(0, Math.min(255, acc));
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(dst, 0, 0);
}

function removeBorders(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const borderRatio = 0.04;
  const bw = Math.round(w * borderRatio);
  const bh = Math.round(h * borderRatio);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, bh);
  ctx.fillRect(0, h - bh, w, bh);
  ctx.fillRect(0, 0, bw, h);
  ctx.fillRect(w - bw, 0, bw, h);
}

function detectSkewAngle(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const bin: number[] = new Array(w * h);
  for (let i = 0, j = 0; i < d.length; i += 4, j++) {
    bin[j] = d[i] < 128 ? 1 : 0;
  }
  const angles = [-3, -2, -1, -0.5, 0, 0.5, 1, 2, 3];
  let bestAngle = 0;
  let bestScore = -Infinity;
  const step = Math.max(1, Math.floor(h / 100));
  for (const angle of angles) {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    let score = 0;
    for (let y = 0; y < h; y += step) {
      let runStart = -1;
      for (let x = 0; x < w; x++) {
        const sx = Math.round(x * cos - y * sin);
        const sy = Math.round(x * sin + y * cos);
        if (sx < 0 || sx >= w || sy < 0 || sy >= h) continue;
        const idx = sy * w + sx;
        if (bin[idx]) {
          if (runStart < 0) runStart = x;
        } else {
          if (runStart >= 0) { score += (x - runStart) ** 2; runStart = -1; }
        }
      }
    }
    if (score > bestScore) { bestScore = score; bestAngle = angle; }
  }
  return bestAngle;
}

function deskew(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const angle = detectSkewAngle(ctx, w, h);
  if (angle === 0) return;
  const rad = (angle * Math.PI) / 180;
  const canvas = ctx.canvas;
  const tmp = document.createElement("canvas");
  tmp.width = w;
  tmp.height = h;
  const tctx = tmp.getContext("2d")!;
  tctx.fillStyle = "#ffffff";
  tctx.fillRect(0, 0, w, h);
  tctx.translate(w / 2, h / 2);
  tctx.rotate(rad);
  tctx.drawImage(canvas, -w / 2, -h / 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(tmp, 0, 0);
}

function removePhotoRegions(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const visited = new Uint8Array(w * h);
  const minArea = Math.max(400, Math.round(w * h * 0.005));
  const maxArea = Math.round(w * h * 0.25);
  const stack: number[] = [];
  for (let startY = 0; startY < h; startY += 3) {
    for (let startX = 0; startX < w; startX += 3) {
      const startIdx = startY * w + startX;
      if (visited[startIdx] || d[startIdx * 4] < 128) continue;
      stack.length = 0;
      stack.push(startIdx);
      let count = 0;
      let minX = w, maxX = 0, minY = h, maxY = 0;
      while (stack.length > 0 && count < maxArea) {
        const idx = stack.pop()!;
        if (visited[idx]) continue;
        visited[idx] = 1;
        if (d[idx * 4] < 128) continue;
        count++;
        const px = idx % w;
        const py = Math.floor(idx / w);
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
        if (px > 0) stack.push(idx - 1);
        if (px < w - 1) stack.push(idx + 1);
        if (py > 0) stack.push(idx - w);
        if (py < h - 1) stack.push(idx + w);
      }
      if (count >= minArea && count < maxArea) {
        const bw = maxX - minX;
        const bh = maxY - minY;
        const aspect = bw / Math.max(1, bh);
        if (aspect > 0.5 && aspect < 2.5) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(minX - 2, minY - 2, bw + 4, bh + 4);
        }
      }
    }
  }
}

function removeQrCodes(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const blockSize = Math.max(8, Math.round(Math.min(w, h) * 0.02));
  for (let y = 0; y < h - blockSize; y += blockSize) {
    for (let x = 0; x < w - blockSize; x += blockSize) {
      let dark = 0;
      let total = 0;
      for (let dy = 0; dy < blockSize; dy++) {
        for (let dx = 0; dx < blockSize; dx++) {
          total++;
          if (d[((y + dy) * w + (x + dx)) * 4] < 128) dark++;
        }
      }
      const ratio = dark / total;
      if (ratio > 0.35 && ratio < 0.65) {
        const checkSize = blockSize * 5;
        if (x + checkSize < w && y + checkSize < h) {
          let edgeTransitions = 0;
          let prevDark = d[(y * w + x) * 4] < 128;
          for (let i = 0; i < checkSize; i++) {
            const isDark = d[((y + Math.floor(i / 2)) * w + (x + i)) * 4] < 128;
            if (isDark !== prevDark) edgeTransitions++;
            prevDark = isDark;
          }
          if (edgeTransitions > 6) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x, y, checkSize, checkSize);
          }
        }
      }
    }
  }
}

function removeWatermarks(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const grayVals: number[] = [];
  for (let i = 0; i < d.length; i += 4) grayVals.push(d[i]);
  grayVals.sort((a, b) => a - b);
  const p10 = grayVals[Math.floor(grayVals.length * 0.1)];
  const p90 = grayVals[Math.floor(grayVals.length * 0.9)];
  if (p90 - p10 < 30) return;
  const lowThreshold = p10 + Math.round((p90 - p10) * 0.15);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] > lowThreshold && d[i] < 200) {
      d[i] = d[i + 1] = d[i + 2] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

export async function preprocessImage(
  file: File,
  progress?: PreprocessProgress,
): Promise<Blob> {
  const report = (step: string, p: number) => progress?.(step, p);

  report("Loading image", 0.05);
  const img = await loadImage(file);

  report("Converting to grayscale", 0.15);
  const canvas = imageToCanvas(img);
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const { width: w, height: h } = canvas;
  grayscale(ctx, w, h);

  report("Increasing contrast", 0.25);
  increaseContrast(ctx, w, h, 1.4);

  report("Denoising", 0.35);
  denoise(ctx, w, h);

  report("Removing decorative borders", 0.45);
  removeBorders(ctx, w, h);

  report("Removing profile photos & logos", 0.55);
  removePhotoRegions(ctx, w, h);

  report("Removing QR codes", 0.6);
  removeQrCodes(ctx, w, h);

  report("Removing watermarks", 0.65);
  removeWatermarks(ctx, w, h);

  report("Deskewing", 0.75);
  deskew(ctx, w, h);

  report("Sharpening", 0.85);
  sharpen(ctx, w, h);

  report("Finalizing", 0.95);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob"))),
      "image/png",
    );
  });
}
