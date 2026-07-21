import type { FieldKey, ExtractedField, ProfileWithConfidence, PartialProfile } from "./ocrTypes";
import { confidenceLevel } from "./ocrTypes";
import { FIELD_LABELS, type FieldLabel } from "./ocrPatterns";

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ").replace(/[^\p{L}\p{N} :\-'/]/gu, "");
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[n];
}

function fuzzyMatch(token: string, label: string, threshold = 0.75): boolean {
  if (token === label) return true;
  if (label.length >= 4 && token.includes(label)) return true;
  if (token.length >= 4 && label.includes(token)) return true;
  if (token.length < 3 || label.length < 3) return false;
  const dist = levenshtein(token, label);
  const maxLen = Math.max(token.length, label.length);
  return 1 - dist / maxLen >= threshold;
}

function matchLabel(token: string, field: FieldLabel): boolean {
  const normToken = normalize(token);
  for (const label of field.labels) {
    if (fuzzyMatch(normToken, label)) return true;
  }
  for (const label of field.tamilLabels) {
    if (fuzzyMatch(token, label, 0.85)) return true;
  }
  return false;
}

function validateValue(value: string, type: FieldLabel["type"]): boolean {
  const v = value.trim();
  if (!v) return false;
  switch (type) {
    case "number":
      return /\d/.test(v);
    case "date":
      return /\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}/.test(v) || /\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2}/.test(v);
    case "phone":
      return /\+?\d[\d\s\-]{8,14}/.test(v);
    case "email":
      return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/.test(v);
    case "text":
      return v.length >= 2;
    case "longtext":
      return v.length >= 5;
    default:
      return true;
  }
}

function extractValue(line: string): string {
  const colonIdx = line.search(/[:\-–—]/);
  if (colonIdx >= 0) {
    return line.slice(colonIdx + 1).trim();
  }
  return "";
}

function findLabelToken(line: string): string {
  const colonIdx = line.search(/[:\-–—]/);
  if (colonIdx >= 0) {
    return line.slice(0, colonIdx).trim();
  }
  return line.trim();
}

function calculateConfidence(
  field: FieldLabel,
  value: string,
  ocrConfidence: number,
  matchType: "exact" | "fuzzy",
  lineIdx: number,
  totalLines: number,
): number {
  const base = field.baseConfidence;
  const matchPenalty = matchType === "fuzzy" ? 0.08 : 0;
  const ocrFactor = Math.max(0.3, ocrConfidence);
  const lengthFactor = Math.min(1, value.trim().length / 4);
  const positionFactor = lineIdx < totalLines * 0.7 ? 1 : 0.92;
  const score = base * (0.65 + 0.35 * lengthFactor) * ocrFactor * positionFactor - matchPenalty;
  return Math.max(0.1, Math.min(1, score));
}

interface ParsedLine {
  raw: string;
  labelPart: string;
  valuePart: string;
  index: number;
}

function parseLines(text: string): ParsedLine[] {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  return lines.map((raw, index) => {
    const colonIdx = raw.search(/[:\-–—]/);
    if (colonIdx >= 0 && colonIdx < 40) {
      return { raw, labelPart: raw.slice(0, colonIdx).trim(), valuePart: raw.slice(colonIdx + 1).trim(), index };
    }
    return { raw, labelPart: raw, valuePart: "", index };
  });
}

function tryColonValue(parsed: ParsedLine, field: FieldLabel): { value: string; matchType: "exact" | "fuzzy" } | null {
  if (!parsed.valuePart) return null;
  if (matchLabel(parsed.labelPart, field)) {
    const matchType = field.labels.includes(normalize(parsed.labelPart)) || field.tamilLabels.includes(parsed.labelPart) ? "exact" : "fuzzy";
    return { value: parsed.valuePart, matchType };
  }
  return null;
}

function tryNextLineValue(parsed: ParsedLine, allParsed: ParsedLine[], field: FieldLabel): { value: string; matchType: "exact" | "fuzzy" } | null {
  if (parsed.valuePart) return null;
  if (!matchLabel(parsed.labelPart, field)) return null;
  const next = allParsed[parsed.index + 1];
  if (next && next.valuePart === "" && next.raw.length > 0 && next.raw.length < 100) {
    return { value: next.raw, matchType: "fuzzy" };
  }
  return null;
}

function tryInlineValue(parsed: ParsedLine, field: FieldLabel): { value: string; matchType: "exact" | "fuzzy" } | null {
  const norm = normalize(parsed.raw);
  for (const label of field.labels) {
    const idx = norm.indexOf(label);
    if (idx >= 0 && idx < 30) {
      const after = parsed.raw.slice(idx + label.length).trim();
      const cleaned = after.replace(/^[:\-–—\s]+/, "").trim();
      if (cleaned && cleaned.length >= 2) {
        return { value: cleaned, matchType: "fuzzy" };
      }
    }
  }
  for (const label of field.tamilLabels) {
    const idx = parsed.raw.indexOf(label);
    if (idx >= 0 && idx < 30) {
      const after = parsed.raw.slice(idx + label.length).trim();
      const cleaned = after.replace(/^[:\-–—\s]+/, "").trim();
      if (cleaned && cleaned.length >= 2) {
        return { value: cleaned, matchType: "fuzzy" };
      }
    }
  }
  return null;
}

function tryContextualValue(parsed: ParsedLine, allParsed: ParsedLine[], field: FieldLabel): { value: string; matchType: "exact" | "fuzzy" } | null {
  const prev = allParsed[parsed.index - 1];
  if (prev && matchLabel(prev.labelPart, field) && !prev.valuePart && parsed.valuePart === "" && parsed.raw.length > 0 && parsed.raw.length < 100) {
    return { value: parsed.raw, matchType: "fuzzy" };
  }
  return null;
}

function scanForEmailPhone(text: string, ocrConfidence: number): ProfileWithConfidence {
  const result: ProfileWithConfidence = {};
  const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    result.email = {
      value: emailMatch[0],
      confidence: Math.min(1, 0.9 * Math.max(0.4, ocrConfidence)),
      level: confidenceLevel(0.9 * Math.max(0.4, ocrConfidence)),
      source: "scan",
    };
  }
  const phoneMatch = text.match(/\+?91[\d\s\-]{10,12}|\+?\d[\d\s\-]{8,14}/);
  if (phoneMatch) {
    const phoneField = FIELD_LABELS.find((f) => f.key === "phone")!;
    const score = Math.min(1, phoneField.baseConfidence * Math.max(0.4, ocrConfidence));
    result.phone = {
      value: phoneMatch[0].trim(),
      confidence: score,
      level: confidenceLevel(score),
      source: "scan",
    };
  }
  return result;
}

export function parseBiodata(
  text: string,
  ocrConfidence: number,
  existing: ProfileWithConfidence = {},
): ProfileWithConfidence {
  const result: ProfileWithConfidence = { ...existing };
  const parsed = parseLines(text);
  const totalLines = parsed.length;

  for (const field of FIELD_LABELS) {
    let bestMatch: { value: string; confidence: number; matchType: "exact" | "fuzzy"; source: string } | null = null;

    for (const line of parsed) {
      let match: { value: string; matchType: "exact" | "fuzzy" } | null =
        tryColonValue(line, field) ||
        tryNextLineValue(line, parsed, field) ||
        tryInlineValue(line, field) ||
        tryContextualValue(line, parsed, field);

      if (!match) continue;
      if (!validateValue(match.value, field.type)) continue;

      const confidence = calculateConfidence(field, match.value, ocrConfidence, match.matchType, line.index, totalLines);
      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = { value: match.value, confidence, matchType: match.matchType, source: "parser" };
      }
    }

    if (bestMatch) {
      const existingField = result[field.key];
      if (!existingField || bestMatch.confidence > existingField.confidence) {
        result[field.key] = {
          value: bestMatch.value.trim(),
          confidence: Math.round(bestMatch.confidence * 100) / 100,
          level: confidenceLevel(bestMatch.confidence),
          source: bestMatch.source,
        };
      }
    }
  }

  const scanned = scanForEmailPhone(text, ocrConfidence);
  for (const [key, field] of Object.entries(scanned)) {
    if (!field) continue;
    const k = key as FieldKey;
    const existingField = result[k];
    if (!existingField || field.confidence > existingField.confidence) {
      result[k] = field;
    }
  }

  return result;
}

export function withConfidenceToProfile(data: ProfileWithConfidence): PartialProfile {
  const out: PartialProfile = {};
  for (const [key, field] of Object.entries(data)) {
    if (field && field.value) {
      out[key as FieldKey] = field.value;
    }
  }
  return out;
}

export { extractValue, findLabelToken };
export type { ExtractedField };
