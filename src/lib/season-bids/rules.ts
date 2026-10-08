import { findSeasonSpot, isBiddable, seasonBidding, type SeasonSpot } from "@/data/season";
import type { Bid, PublicSpotBids } from "./types";

/** Bids that count toward the price: confirmed by the bidder and not rejected. */
const LIVE: ReadonlySet<Bid["status"]> = new Set(["approved", "winner"]);
/** Bids that can extend the close: confirmed in time, not rejected. */
const CONFIRMED: ReadonlySet<Bid["status"]> = new Set(["pending", "approved", "winner"]);

export const FREE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com", "msn.com", "yahoo.com",
  "ymail.com", "icloud.com", "me.com", "mac.com", "aol.com", "proton.me", "protonmail.com", "pm.me",
  "gmx.com", "gmx.net", "mail.com", "zoho.com", "yandex.com", "yandex.ru", "naver.com", "daum.net",
  "hanmail.net", "kakao.com", "qq.com", "163.com", "126.com", "hey.com", "fastmail.com", "tutanota.com",
  "online.no", "hotmail.no", "live.no",
]);

export function spotBids(bids: readonly Bid[], spotId: string): Bid[] {
  return bids.filter((bid) => bid.spotId === spotId);
}

/** Highest bid on the public board, excluding one bid (used when approving it). */
export function topBid(bids: readonly Bid[], spotId: string, excludeId?: string): Bid | undefined {
  return spotBids(bids, spotId)
    .filter((bid) => LIVE.has(bid.status) && bid.id !== excludeId)
    .sort((a, b) => b.amount - a.amount || a.createdAt.localeCompare(b.createdAt))[0];
}

export function minNextBid(spot: SeasonSpot & { openingBid: number }, bids: readonly Bid[], excludeId?: string): number {
  const top = topBid(bids, spot.id, excludeId);
  return top ? top.amount + seasonBidding.minRaise : spot.openingBid;
}

/**
 * The base close, pushed out whenever a bid is confirmed inside the final
 * window, so a last-second bid always leaves time to answer it.
 */
export function closesAt(bids: readonly Bid[], spotId: string): Date {
  const windowMs = seasonBidding.extensionMinutes * 60_000;
  let close = new Date(seasonBidding.closesAt).getTime();
  const times = spotBids(bids, spotId)
    .filter((bid) => CONFIRMED.has(bid.status) && bid.confirmedAt)
    .map((bid) => new Date(bid.confirmedAt as string).getTime())
    .sort((a, b) => a - b);
  for (const t of times) {
    if (t <= close && t > close - windowMs) close = t + windowMs;
  }
  return new Date(close);
}

export function hasWinner(bids: readonly Bid[], spotId: string): boolean {
  return spotBids(bids, spotId).some((bid) => bid.status === "winner");
}

export function isSpotOpen(spot: SeasonSpot, bids: readonly Bid[], now: Date): boolean {
  return isBiddable(spot) && !hasWinner(bids, spot.id) && now < closesAt(bids, spot.id);
}

/** A bidder who kept their name private is shown by category only. */
export function publicLabel(bid: Pick<Bid, "showName" | "brand" | "category">): string {
  return bid.showName ? bid.brand : bid.category;
}

export function publicSpotBids(spot: SeasonSpot & { openingBid: number }, bids: readonly Bid[], now: Date): PublicSpotBids {
  const visible = spotBids(bids, spot.id)
    .filter((bid) => LIVE.has(bid.status))
    .sort((a, b) => b.amount - a.amount || a.createdAt.localeCompare(b.createdAt));
  return {
    spotId: spot.id,
    openingBid: spot.openingBid,
    minNextBid: minNextBid(spot, bids),
    closesAt: closesAt(bids, spot.id).toISOString(),
    isOpen: isSpotOpen(spot, bids, now),
    hasWinner: hasWinner(bids, spot.id),
    bids: visible.map((bid) => ({ label: publicLabel(bid), amount: bid.amount, at: bid.confirmedAt ?? bid.createdAt })),
  };
}

export function hostOf(url: string): string | null {
  try {
    const parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    return host.includes(".") ? host : null;
  } catch {
    return null;
  }
}

/** The email must sit on the brand's own domain (or a sub or parent domain of it). */
export function emailMatchesWebsite(email: string, website: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  const host = hostOf(website);
  if (!domain || !host) return false;
  return domain === host || domain.endsWith(`.${host}`) || host.endsWith(`.${domain}`);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ONE_LINE = /[\r\n]/;

export interface BidInput {
  spotId: string;
  amount: number;
  brand: string;
  category: string;
  website: string;
  contactName: string;
  email: string;
  showName: boolean;
}

export type ParseBidResult = { data: BidInput } | { honeypot: true } | { error: string };

export function parseBidInput(body: unknown): ParseBidResult {
  if (!body || typeof body !== "object") return { error: "Invalid request." };
  const raw = body as Record<string, unknown>;
  if (typeof raw.company_url === "string" && raw.company_url.trim()) return { honeypot: true };

  const text = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string).trim() : "");
  const spotId = text("spotId");
  const brand = text("brand");
  const category = text("category");
  const website = text("website");
  const contactName = text("contactName");
  const email = text("email").toLowerCase();
  const amountRaw = typeof raw.amount === "number" ? String(raw.amount) : text("amount").replace(/[$,\s]/g, "");
  const amount = /^\d{1,7}$/.test(amountRaw) ? Number(amountRaw) : NaN;
  const showName = raw.showName === true || raw.showName === "on" || raw.showName === "true";

  const spot = findSeasonSpot(spotId);
  if (!spot || !isBiddable(spot)) return { error: "This spot is not taking bids." };
  if (!Number.isInteger(amount) || amount <= 0) return { error: "Enter your bid as a whole number of US dollars." };
  if (amount > seasonBidding.maxBid) return { error: "That bid looks too high. Check the amount, or email me directly." };
  if (brand.length < 2 || brand.length > 80 || ONE_LINE.test(brand)) return { error: "Enter your brand name, up to 80 characters." };
  if (!(seasonBidding.categories as readonly string[]).includes(category)) return { error: "Pick the category that fits your brand." };
  if (website.length > 200 || !hostOf(website)) return { error: "Enter your brand's website, like brand.com." };
  if (contactName.length < 2 || contactName.length > 120 || ONE_LINE.test(contactName)) return { error: "Enter your name." };
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return { error: "Enter a valid work email." };
  if (FREE_EMAIL_DOMAINS.has(email.split("@")[1])) return { error: "Use your work email on your brand's domain, not a personal address." };
  if (!emailMatchesWebsite(email, website)) return { error: "Your email needs to be on the same domain as your brand's website." };

  return { data: { spotId, amount, brand, category, website, contactName, email, showName } };
}
