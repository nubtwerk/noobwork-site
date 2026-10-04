/**
 * unconfirmed: submitted, waiting for the bidder's email confirmation.
 * pending: confirmed, waiting for Joachim. Never shown publicly.
 * approved: on the public board.
 * winner: Joachim picked it; the spot shows as Reserved and stops taking bids.
 * rejected: hidden for good.
 */
export type BidStatus = "unconfirmed" | "pending" | "approved" | "winner" | "rejected";

export interface Bid {
  id: string;
  spotId: string;
  /** Whole US dollars. */
  amount: number;
  brand: string;
  category: string;
  website: string;
  contactName: string;
  email: string;
  /** The bidder agreed to show the brand name on the public board. */
  showName: boolean;
  status: BidStatus;
  /** SHA-256 of the email confirmation token; cleared once used. */
  tokenHash: string | null;
  createdAt: string;
  confirmedAt: string | null;
  decidedAt: string | null;
}

export type NewBid = Omit<Bid, "id" | "createdAt" | "confirmedAt" | "decidedAt" | "status"> & {
  status: "unconfirmed";
  /** The memory store uses it; the database sets its own clock. */
  createdAt?: string;
};
export type BidPatch = Partial<Pick<Bid, "status" | "tokenHash" | "confirmedAt" | "decidedAt">>;

/** What anyone may see about one spot's auction. Never carries contact details. */
export interface PublicSpotBids {
  spotId: string;
  openingBid: number;
  minNextBid: number;
  closesAt: string;
  isOpen: boolean;
  hasWinner: boolean;
  bids: { label: string; amount: number; at: string }[];
}
