/**
 * File type detection: PDF, scanned PDF, photo, camera image, low-res, rotated.
 * Uses buffer magic bytes and image dimension analysis.
 */

export type FileType = "pdf" | "scanned_pdf" | "image_jpeg" | "image_png" | "image_webp" | "unknown";
export type ImageQuality = "high" | "medium" | "low" | "very_low";
export type ImageOrientation = "upright" | "rotated_90" | "rotated_180" | "rotated_270";

export interface FileAnalysis {
  type: FileType;
  isScanned: boolean;
  quality: ImageQuality;
  orientation: ImageOrientation;
  needsPreprocessing: boolean;
  needsRotation: boolean;
  needsUpscaling: boolean;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
}

const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;
const LOW_RES_THRESHOLD = 500;
const VERY_LOW_RES_THRESHOLD = 300;

/**
 * Analyze a file buffer to determine its type and quality.
 */
export function analyzeFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): FileAnalysis {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  const fileSize = buffer.length;

  // PDF detection
  if (mimeType === "application/pdf" || ext === "pdf") {
    const isScanned = detectScannedPdf(buffer);
    return {
      type: isScanned ? "scanned_pdf" : "pdf",
      isScanned,
      quality: "high",
      orientation: "upright",
      needsPreprocessing: isScanned,
      needsRotation: false,
      needsUpscaling: isScanned,
      width: 0,
      height: 0,
      fileSize,
      mimeType: "application/pdf",
    };
  }

  // Image detection
  const imageType = detectImageType(buffer, mimeType, ext);
  const dimensions = extractImageDimensions(buffer, imageType);
  const quality = assessQuality(dimensions.width, dimensions.height, fileSize);
  const orientation = detectOrientation(dimensions.width, dimensions.height);

  return {
    type: imageType,
    isScanned: false,
    quality,
    orientation,
    needsPreprocessing: quality !== "high",
    needsRotation: orientation !== "upright",
    needsUpscaling: quality === "low" || quality === "very_low",
    width: dimensions.width,
    height: dimensions.height,
    fileSize,
    mimeType: imageType === "image_jpeg" ? "image/jpeg" : imageType === "image_png" ? "image/png" : "image/webp",
  };
}

function detectScannedPdf(buffer: Buffer): boolean {
  // Heuristic: if PDF contains mostly image objects and little text, it's likely scanned
  const sample = buffer.slice(0, Math.min(buffer.length, 50000)).toString("latin1");
  const imageCount = (sample.match(/\/Image/g) || []).length;
  const textCount = (sample.match(/\/Text/g) || []).length;
  return imageCount > 2 && textCount < 2;
}

function detectImageType(buffer: Buffer, mimeType: string, ext: string): FileType {
  if (mimeType === "image/jpeg" || ext === "jpg" || ext === "jpeg") return "image_jpeg";
  if (mimeType === "image/png" || ext === "png") return "image_png";
  if (mimeType === "image/webp" || ext === "webp") return "image_webp";

  // Magic bytes
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image_jpeg";
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "image_png";
  if (buffer.length >= 12 && buffer.slice(8, 12).toString("ascii") === "WEBP") return "image_webp";

  return "unknown";
}

function extractImageDimensions(buffer: Buffer, type: FileType): { width: number; height: number } {
  try {
    if (type === "image_jpeg") return extractJpegDimensions(buffer);
    if (type === "image_png") return extractPngDimensions(buffer);
    if (type === "image_webp") return extractWebpDimensions(buffer);
  } catch {
    // ignore
  }
  return { width: 0, height: 0 };
}

function extractJpegDimensions(buffer: Buffer): { width: number; height: number } {
  let offset = 2;
  while (offset < buffer.length - 1) {
    if (buffer[offset] !== 0xff) { offset++; continue; }
    const marker = buffer[offset + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }
    const length = buffer.readUInt16BE(offset + 2);
    offset += 2 + length;
  }
  return { width: 0, height: 0 };
}

function extractPngDimensions(buffer: Buffer): { width: number; height: number } {
  if (buffer.length < 24) return { width: 0, height: 0 };
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

function extractWebpDimensions(buffer: Buffer): { width: number; height: number } {
  if (buffer.length < 30) return { width: 0, height: 0 };
  const chunkType = buffer.slice(12, 16).toString("ascii");
  if (chunkType === "VP8X") {
    const width = (buffer.readUInt32LE(24) & 0x3fff) + 1;
    const height = (buffer.readUInt32LE(27) & 0x3fff) + 1;
    return { width, height };
  }
  if (chunkType === "VP8L") {
    const width = ((buffer[21] | ((buffer[22] & 0x3f) << 8)) + 1);
    const height = (((buffer[22] >> 6) | (buffer[23] << 2) | ((buffer[24] & 0x0f) << 10)) + 1);
    return { width, height };
  }
  if (chunkType === "VP8 ") {
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return { width, height };
  }
  return { width: 0, height: 0 };
}

function assessQuality(width: number, height: number, fileSize: number): ImageQuality {
  if (width === 0 || height === 0) return "medium";
  const minDim = Math.min(width, height);
  const pixelsPerByte = (width * height) / fileSize;
  if (minDim < VERY_LOW_RES_THRESHOLD) return "very_low";
  if (minDim < LOW_RES_THRESHOLD) return "low";
  if (minDim < MIN_WIDTH && pixelsPerByte > 0.5) return "medium";
  return "high";
}

function detectOrientation(width: number, height: number): ImageOrientation {
  // Without EXIF parsing, we assume upright for server-side processing.
  // The deskew/autorotate logic in preprocessing handles actual rotation.
  return "upright";
}

/**
 * Validate MIME type for security.
 */
export function isValidMime(mimeType: string, fileName: string): boolean {
  const valid = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
  ];
  if (valid.includes(mimeType)) return true;
  const validExts = ["pdf", "jpg", "jpeg", "png", "webp"];
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  return validExts.includes(ext);
}

/**
 * Check for potentially malicious file content.
 */
export function isSafeFile(buffer: Buffer, mimeType: string): boolean {
  // Check for embedded scripts in PDFs
  if (mimeType === "application/pdf") {
    const sample = buffer.slice(0, Math.min(buffer.length, 10000)).toString("latin1");
    if (sample.includes("/JavaScript") || sample.includes("/JS")) return false;
    if (sample.includes("/EmbeddedFile")) return false;
  }
  // Check for polyglot files (files that are valid as multiple types)
  if (mimeType === "image/jpeg" && buffer.includes(Buffer.from("PDF"))) return false;
  // Check for excessively large files (>50MB)
  if (buffer.length > 50 * 1024 * 1024) return false;
  return true;
}
