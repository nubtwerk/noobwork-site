/** Allowlisted campaign params for inquiry email context only — never sent to analytics. */
export const INQUIRY_ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ref",
] as const;

export type InquiryAttributionKey = (typeof INQUIRY_ATTRIBUTION_KEYS)[number];
export type InquiryAttribution = Partial<Record<InquiryAttributionKey, string>>;

const MAX_VALUE_LENGTH = 120;

function sanitizeAttributionValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, MAX_VALUE_LENGTH);
  if (!trimmed || /[\r\n]/.test(trimmed)) return undefined;
  return trimmed;
}

export function isInquiryAttributionKey(value: string): value is InquiryAttributionKey {
  return (INQUIRY_ATTRIBUTION_KEYS as readonly string[]).includes(value);
}

/** Pull allowlisted UTM/`ref` values from a form body or query-like record. */
export function parseInquiryAttribution(raw: Record<string, unknown>): InquiryAttribution | undefined {
  const attribution: InquiryAttribution = {};
  for (const key of INQUIRY_ATTRIBUTION_KEYS) {
    const value = sanitizeAttributionValue(raw[key]);
    if (value) attribution[key] = value;
  }
  return Object.keys(attribution).length > 0 ? attribution : undefined;
}

/** Read allowlisted params from the current page URL (client only). */
export function readInquiryAttributionFromSearch(search: string): InquiryAttribution | undefined {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const raw: Record<string, unknown> = {};
  for (const key of INQUIRY_ATTRIBUTION_KEYS) {
    const value = params.get(key);
    if (value != null) raw[key] = value;
  }
  return parseInquiryAttribution(raw);
}

export function formatInquiryAttributionLines(attribution: InquiryAttribution | undefined): string[] {
  if (!attribution) return [];
  return INQUIRY_ATTRIBUTION_KEYS.filter((key) => attribution[key]).map(
    (key) => `${key}: ${attribution[key]}`,
  );
}
