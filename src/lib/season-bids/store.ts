import { randomUUID } from "node:crypto";
import type { Bid, BidPatch, NewBid } from "./types";

export interface BidStore {
  list(): Promise<Bid[]>;
  insert(bid: NewBid): Promise<Bid>;
  update(id: string, patch: BidPatch): Promise<Bid>;
}

/** Per-process store for local dev and tests. Lost on restart. */
export function createMemoryStore(seed: Bid[] = []): BidStore & { bids: Bid[] } {
  const bids = [...seed];
  return {
    bids,
    async list() {
      return bids.map((bid) => ({ ...bid }));
    },
    async insert(bid) {
      const row: Bid = { ...bid, id: randomUUID(), createdAt: bid.createdAt ?? new Date().toISOString(), confirmedAt: null, decidedAt: null };
      bids.push(row);
      return { ...row };
    },
    async update(id, patch) {
      const row = bids.find((bid) => bid.id === id);
      if (!row) throw new Error("BID_NOT_FOUND");
      Object.assign(row, patch);
      return { ...row };
    },
  };
}

type Row = {
  id: string; spot_id: string; amount: number; brand: string; category: string; website: string;
  contact_name: string; email: string; show_name: boolean; status: Bid["status"]; token_hash: string | null;
  created_at: string; confirmed_at: string | null; decided_at: string | null;
};

const fromRow = (row: Row): Bid => ({
  id: row.id, spotId: row.spot_id, amount: row.amount, brand: row.brand, category: row.category, website: row.website,
  contactName: row.contact_name, email: row.email, showName: row.show_name, status: row.status, tokenHash: row.token_hash,
  createdAt: row.created_at, confirmedAt: row.confirmed_at, decidedAt: row.decided_at,
});

const SNAKE: Record<string, string> = {
  spotId: "spot_id", contactName: "contact_name", showName: "show_name", tokenHash: "token_hash",
  confirmedAt: "confirmed_at", decidedAt: "decided_at",
};
const toRow = (data: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(data).map(([key, value]) => [SNAKE[key] ?? key, value]));

/**
 * Supabase over PostgREST. The tables live in a schema the API does not
 * expose; the only way in is three SECURITY DEFINER functions that check
 * `secret` against a stored hash (see supabase/season-bids.sql).
 */
export function createSupabaseStore(url: string, key: string, secret: string): BidStore {
  async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/${fn}`, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(6_000),
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_secret: secret, ...args }),
    });
    if (!res.ok) throw new Error(`BID_STORE_FAILED:${res.status}`);
    return (await res.json()) as T;
  }
  return {
    async list() {
      return (await rpc<Row[]>("season_bids_list", {})).map(fromRow);
    },
    async insert(bid) {
      // The function reads only the columns it inserts; the database sets created_at.
      return fromRow(await rpc<Row>("season_bids_insert", { p_bid: toRow(bid) }));
    },
    async update(id, patch) {
      const row = await rpc<Row | null>("season_bids_update", { p_id: id, p_patch: toRow(patch) });
      if (!row) throw new Error("BID_NOT_FOUND");
      return fromRow(row);
    },
  };
}

const globalStore = globalThis as typeof globalThis & { __seasonBidStore?: BidStore };

/** Hosted bidding requires a complete, explicit dedicated-project configuration. */
export function getBidStore(): BidStore | null {
  const url = process.env.SEASON_SUPABASE_URL?.trim();
  const key = process.env.SEASON_SUPABASE_KEY?.trim();
  const projectRef = process.env.SEASON_SUPABASE_PROJECT_REF?.trim();
  const secret = process.env.SEASON_DB_SECRET?.trim();
  if (url || key || projectRef || secret) {
    if (!url || !key || !projectRef || !secret || secret.length < 32) return null;
    try {
      const parsed = new URL(url);
      if (
        !/^[a-z]{20}$/.test(projectRef) ||
        // This fitness project is being retired; never send sponsorship data there.
        projectRef === "mudmzagbhjriswjdzzcq" ||
        parsed.origin !== `https://${projectRef}.supabase.co` ||
        parsed.pathname !== "/" || parsed.search || parsed.hash ||
        parsed.username || parsed.password || !key.startsWith("sb_publishable_")
      ) return null;
    } catch {
      return null;
    }
    return createSupabaseStore(url, key, secret);
  }
  // Ephemeral demo/memory stores must never accept production bids.
  if (process.env.NODE_ENV === "production") return null;
  const mode = process.env.SEASON_BIDS_STORE;
  globalStore.__seasonBidStore ??= createMemoryStore(mode === "demo" ? demoBids() : []);
  return globalStore.__seasonBidStore;
}

/** Test-only: swap the process store. */
export function __setBidStore(store: BidStore | undefined): void {
  globalStore.__seasonBidStore = store;
}

/** Sample bids for local screenshots (SEASON_BIDS_STORE=demo). Never used with a real store. */
function demoBids(): Bid[] {
  const at = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
  const bid = (id: string, spotId: string, amount: number, brand: string, category: string, showName: boolean, status: Bid["status"], hoursAgo: number): Bid => ({
    id, spotId, amount, brand, category, website: "example.com", contactName: "Demo", email: `demo-${id}@example.com`,
    showName, status, tokenHash: null, createdAt: at(hoursAgo), confirmedAt: at(hoursAgo), decidedAt: status === "pending" ? null : at(hoursAgo - 1),
  });
  return [
    bid("d1", "banner-1", 3_000, "Northlight AI", "AI and creator tools", true, "approved", 50),
    bid("d2", "banner-1", 3_500, "Gaming hardware brand", "Gaming hardware and setups", false, "approved", 20),
    bid("d3", "banner-2", 3_250, "Seoul Strength Club", "Gyms and training", true, "approved", 30),
    bid("d4", "banner-1", 3_750, "Hydra Labs", "Energy and hydration", false, "pending", 2),
    bid("d5", "retest-q1", 3_000, "Recovery brand", "Recovery and wellness", false, "approved", 12),
  ];
}
