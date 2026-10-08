import { createHash, randomBytes } from "node:crypto";
import { findSeasonSpot, formatUsd, isBiddable, seasonSpots } from "@/data/season";
import { confirmMail, outbidMail, reviewMail, sendMail } from "./email";
import { isSpotOpen, minNextBid, publicSpotBids, spotBids, topBid, type BidInput } from "./rules";
import type { BidStore } from "./store";
import type { Bid, PublicSpotBids } from "./types";

const CONFIRM_TTL_MS = 48 * 60 * 60 * 1000;
/** Open, unconfirmed bids one email may hold at once. */
const MAX_UNCONFIRMED_PER_EMAIL = 3;

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export type BidResult<T = undefined> = { ok: true; value: T } | { ok: false; status: number; error: string };
const fail = (status: number, error: string) => ({ ok: false as const, status, error });

export async function publicBoard(store: BidStore, now = new Date()): Promise<PublicSpotBids[]> {
  const bids = await store.list();
  return seasonSpots.filter(isBiddable).map((spot) => publicSpotBids(spot, bids, now));
}

export async function placeBid(store: BidStore, input: BidInput, siteUrl: string, now = new Date()): Promise<BidResult> {
  const spot = findSeasonSpot(input.spotId);
  if (!spot || !isBiddable(spot)) return fail(400, "This spot is not taking bids.");
  const bids = await store.list();
  if (!isSpotOpen(spot, bids, now)) return fail(409, "Bidding on this spot has closed.");
  const minimum = minNextBid(spot, bids);
  if (input.amount < minimum) return fail(409, `The lowest bid that counts right now is ${formatUsd(minimum)}.`);
  const waiting = bids.filter((bid) => bid.email === input.email && bid.status === "unconfirmed"
    && now.getTime() - new Date(bid.createdAt).getTime() < CONFIRM_TTL_MS);
  if (waiting.length >= MAX_UNCONFIRMED_PER_EMAIL) return fail(429, "Confirm the bids already in your inbox first.");

  const token = randomBytes(32).toString("base64url");
  const bid = await store.insert({ ...input, status: "unconfirmed", tokenHash: hashToken(token), createdAt: now.toISOString() });
  const url = new URL("/season/confirm", siteUrl);
  url.searchParams.set("token", token);
  try {
    await sendMail(confirmMail(bid, url.toString()));
  } catch (error) {
    // The unconfirmed bid simply expires; nothing shows without confirmation.
    console.error("season bid confirm email failed", error instanceof Error ? error.message : "UnknownError");
    return fail(502, "Your bid could not be sent for confirmation. Try again, or email joachim@noobwork.no.");
  }
  return { ok: true, value: undefined };
}

export async function confirmBid(store: BidStore, token: string, siteUrl: string, now = new Date()): Promise<BidResult<Bid>> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return fail(400, "This link is not valid.");
  const bids = await store.list();
  const bid = bids.find((b) => b.tokenHash === hashToken(token));
  if (!bid || bid.status !== "unconfirmed") return fail(404, "This link has already been used or is not valid.");
  if (now.getTime() - new Date(bid.createdAt).getTime() > CONFIRM_TTL_MS) return fail(410, "This link has expired. Place the bid again.");
  const spot = findSeasonSpot(bid.spotId);
  if (!spot || !isSpotOpen(spot, bids, now)) return fail(409, "Bidding on this spot closed before the bid was confirmed.");

  const confirmed = await store.update(bid.id, { status: "pending", tokenHash: null, confirmedAt: now.toISOString() });
  try {
    await sendMail(reviewMail(confirmed, new URL("/season/admin", siteUrl).toString()));
  } catch (error) {
    // The bid is safe in the store and visible in the admin; the email is a convenience.
    console.error("season bid review email failed", error instanceof Error ? error.message : "UnknownError");
  }
  return { ok: true, value: confirmed };
}

export type AdminAction = "approve" | "reject" | "winner";

/** decideBid fails with one of these codes; the admin page shows the text. */
export const adminNotices: Record<string, string> = {
  "done-approve": "Bid approved. It is on the board now.",
  "done-reject": "Bid rejected.",
  "done-winner": "Winner marked. The spot shows as Reserved and stops taking bids.",
  "not-found": "That bid no longer exists.",
  "spot-closed": "That spot no longer takes bids.",
  "is-winner": "This bid is the winner. Change it in the database if you need to undo that.",
  "not-pending": "Only bids waiting for review can be approved.",
  "below-minimum": "A higher bid was approved first, so this one is now below the minimum. Reject it.",
  "not-approved": "Approve the bid before marking it the winner.",
  "has-winner": "This spot already has a winner.",
  unavailable: "The bid database could not be reached. Try again.",
};

export async function decideBid(store: BidStore, id: string, action: AdminAction, siteUrl: string, now = new Date()): Promise<BidResult<Bid>> {
  const bids = await store.list();
  const bid = bids.find((b) => b.id === id);
  if (!bid) return fail(404, "not-found");
  const spot = findSeasonSpot(bid.spotId);
  if (!spot || !isBiddable(spot)) return fail(409, "spot-closed");

  if (action === "reject") {
    if (bid.status === "winner") return fail(409, "is-winner");
    return { ok: true, value: await store.update(id, { status: "rejected", decidedAt: now.toISOString() }) };
  }
  if (action === "approve") {
    if (bid.status !== "pending") return fail(409, "not-pending");
    const minimum = minNextBid(spot, bids, id);
    if (bid.amount < minimum) return fail(409, "below-minimum");
    const previousTop = topBid(bids, spot.id, id);
    const approved = await store.update(id, { status: "approved", decidedAt: now.toISOString() });
    if (previousTop && previousTop.email !== approved.email) {
      try {
        await sendMail(outbidMail(previousTop, approved.amount, new URL(`/season?spot=${spot.id}#board`, siteUrl).toString()));
      } catch (error) {
        console.error("season outbid email failed", error instanceof Error ? error.message : "UnknownError");
      }
    }
    return { ok: true, value: approved };
  }
  if (bid.status !== "approved") return fail(409, "not-approved");
  if (spotBids(bids, spot.id).some((b) => b.status === "winner")) return fail(409, "has-winner");
  return { ok: true, value: await store.update(id, { status: "winner", decidedAt: now.toISOString() }) };
}
