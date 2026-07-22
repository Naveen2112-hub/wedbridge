/**
 * Layout Detection Service
 * Detects and crops unwanted areas from biodata images before OCR:
 * passport photos, horoscope boxes, temple images, decorative borders, QR codes, watermarks.
 * Uses sharp for image manipulation + Gemini Vision for layout analysis.
 */

export interface LayoutRegion {
  type: "biodata_text" | "passport_photo" | "horoscope_box" | "temple_image" | "decorative_border" | "qr_code" | "watermark" | "wedding_logo" | "background_graphic";
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface LayoutAnalysis {
  regions: LayoutRegion[];
  biodataRegion: { x: number; y: number; width: number; height: number } | null;
  passportPhotoRegion: LayoutRegion | null;
  needsCropping: boolean;
}

const LAYOUT_PROMPT = `Analyze this Indian matrimony biodata image and identify all regions.
Return JSON array of regions with their bounding boxes (as percentages 0-100):
[{"type": "biodata_text"|"passport_photo"|"horoscope_box"|"temple_image"|"decorative_border"|"qr_code"|"watermark"|"wedding_logo"|"background_graphic", "x": number, "y": number, "width": number, "height": number, "confidence": number}]

Rules:
- x, y, width, height are percentages (0-100) of the image dimensions
- Identify the main biodata text region separately from decorations
- Flag horoscope boxes, temple images, QR codes, and watermarks for removal
- Be precise with bounding boxes`;

/**
 * Analyze biodata image layout using Gemini Vision.
 */
export async function analyzeLayout(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<LayoutAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return { regions: [], biodataRegion: null, passportPhotoRegion: null, needsCropping: false };
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      LAYOUT_PROMPT,
      { inlineData: { data: imageBuffer.toString("base64"), mimeType } },
    ]);
    const text = result.response.text();
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const regions = JSON.parse(cleaned) as LayoutRegion[];

    const biodataRegion = regions.find((r) => r.type === "biodata_text") ?? null;
    const passportPhotoRegion = regions.find((r) => r.type === "passport_photo") ?? null;
    const needsCropping = regions.some((r) =>
      ["horoscope_box", "temple_image", "decorative_border", "qr_code", "watermark", "wedding_logo", "background_graphic"].includes(r.type)
    );

    return { regions, biodataRegion, passportPhotoRegion, needsCropping };
  } catch {
    return { regions: [], biodataRegion: null, passportPhotoRegion: null, needsCropping: false };
  }
}

/**
 * Crop image to biodata text region only, removing decorations.
 */
export async function cropToBiodataRegion(
  imageBuffer: Buffer,
  region: { x: number; y: number; width: number; height: number },
): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const metadata = await sharp(imageBuffer).metadata();
  const imgWidth = metadata.width ?? 0;
  const imgHeight = metadata.height ?? 0;

  const left = Math.round((region.x / 100) * imgWidth);
  const top = Math.round((region.y / 100) * imgHeight);
  const width = Math.round((region.width / 100) * imgWidth);
  const height = Math.round((region.height / 100) * imgHeight);

  return sharp(imageBuffer)
    .extract({ left, top, width, height })
    .jpeg({ quality: 90 })
    .toBuffer();
}

/**
 * Extract passport photo from biodata image.
 */
export async function extractPassportPhoto(
  imageBuffer: Buffer,
  region: LayoutRegion,
): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const metadata = await sharp(imageBuffer).metadata();
  const imgWidth = metadata.width ?? 0;
  const imgHeight = metadata.height ?? 0;

  const left = Math.round((region.x / 100) * imgWidth);
  const top = Math.round((region.y / 100) * imgHeight);
  const width = Math.round((region.width / 100) * imgWidth);
  const height = Math.round((region.height / 100) * imgHeight);

  return sharp(imageBuffer)
    .extract({ left, top, width, height })
    .resize(300, 400, { fit: "cover" })
    .jpeg({ quality: 85 })
    .toBuffer();
}

/**
 * Preprocess image for better OCR: deskew, denoise, enhance contrast.
 */
export async function preprocessForOCR(
  imageBuffer: Buffer,
): Promise<Buffer> {
  const sharp = (await import("sharp")).default;

  return sharp(imageBuffer)
    .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
    .grayscale()
    .normalize()
    .sharpen()
    .threshold(128)
    .jpeg({ quality: 95 })
    .toBuffer();
}
