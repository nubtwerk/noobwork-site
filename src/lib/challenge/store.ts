import { randomUUID } from "node:crypto";
import type { ChallengeWindowId } from "@/data/challenge";
import type { ProofKind } from "./validate";
import { displayNameKey } from "./validate";
import { hasChallengeDatabase, isChallengeDemo, seasonDatabaseConfig } from "./env";
import { demoSeed } from "./demo-seed";

export type Participant = {
  id: string;
  email: string;
  displayName: string;
  country: string;
  newsletter: boolean;
  /** Joachim's own row, pinned on the board. */
  isHost: boolean;
  /** Hidden from the public board by Joachim (for example an offensive name). */
  hidden: boolean;
  /** Set by Joachim after checking the runner's Strava history. Required to win a prize. */
  prizeEligible: boolean;
  createdAt: string;
};

export type ResultStatus = "self_reported" | "verified" | "flagged" | "rejected";

export type RunResult = {
  id: string;
  participantId: string;
  windowId: ChallengeWindowId;
  timeSeconds: number;
  proofUrl: string;
  proofKind: ProofKind;
  status: ResultStatus;
  submittedAt: string;
};

export type NewParticipant = Pick<Participant, "email" | "displayName" | "country" | "newsletter">;
export type NewResult = Omit<RunResult, "id" | "submittedAt">;

export class ChallengeConflict extends Error {
  constructor(readonly field: "email" | "name") {
    super(`CHALLENGE_CONFLICT_${field.toUpperCase()}`);
  }
}

export interface ChallengeStore {
  readonly kind: "supabase" | "demo";
  createParticipant(input: NewParticipant): Promise<Participant>;
  getParticipant(id: string): Promise<Participant | undefined>;
  findParticipantByEmail(email: string): Promise<Participant | undefined>;
  isNameTaken(displayName: string): Promise<boolean>;
  listParticipants(): Promise<Participant[]>;
  listResults(): Promise<RunResult[]>;
  /** One result per runner per window: a second submission in the same window replaces the first. */
  saveResult(input: NewResult): Promise<RunResult>;
  setResultStatus(id: string, status: ResultStatus): Promise<void>;
  updateParticipant(id: string, patch: Partial<Pick<Participant, "hidden" | "prizeEligible">>): Promise<void>;
  /** Removes the runner and every result (GDPR erasure). */
  deleteParticipant(id: string): Promise<void>;
}

/* ---------- Demo store: previews and local runs, seeded, per-instance memory ---------- */

export function createDemoStore(seed = demoSeed()): ChallengeStore {
  const participants = new Map(seed.participants.map((p) => [p.id, { ...p }]));
  const results = new Map(seed.results.map((r) => [r.id, { ...r }]));

  return {
    kind: "demo",
    async createParticipant(input) {
      for (const p of participants.values()) {
        if (p.email === input.email) throw new ChallengeConflict("email");
        if (displayNameKey(p.displayName) === displayNameKey(input.displayName)) throw new ChallengeConflict("name");
      }
      const p: Participant = { ...input, id: randomUUID(), isHost: false, hidden: false, prizeEligible: false, createdAt: new Date().toISOString() };
      participants.set(p.id, p);
      return { ...p };
    },
    async getParticipant(id) {
      const p = participants.get(id);
      return p ? { ...p } : undefined;
    },
    async findParticipantByEmail(email) {
      const p = [...participants.values()].find((x) => x.email === email);
      return p ? { ...p } : undefined;
    },
    async isNameTaken(displayName) {
      const key = displayNameKey(displayName);
      return [...participants.values()].some((p) => displayNameKey(p.displayName) === key);
    },
    async listParticipants() {
      return [...participants.values()].map((p) => ({ ...p }));
    },
    async listResults() {
      return [...results.values()].map((r) => ({ ...r }));
    },
    async saveResult(input) {
      const existing = [...results.values()].find((r) => r.participantId === input.participantId && r.windowId === input.windowId);
      const r: RunResult = { ...input, id: existing?.id ?? randomUUID(), submittedAt: new Date().toISOString() };
      results.set(r.id, r);
      return { ...r };
    },
    async setResultStatus(id, status) {
      const r = results.get(id);
      if (r) r.status = status;
    },
    async updateParticipant(id, patch) {
      const p = participants.get(id);
      if (p) Object.assign(p, patch);
    },
    async deleteParticipant(id) {
      participants.delete(id);
      for (const [key, r] of results) if (r.participantId === id) results.delete(key);
    },
  };
}

/* ---------- Supabase store: Postgres through PostgREST, server-side service key only ---------- */

type ParticipantRow = {
  id: string;
  email: string;
  display_name: string;
  country: string;
  newsletter: boolean;
  is_host: boolean;
  hidden: boolean;
  prize_eligible: boolean;
  created_at: string;
};
type ResultRow = {
  id: string;
  participant_id: string;
  window_id: ChallengeWindowId;
  time_seconds: number;
  proof_url: string;
  proof_kind: ProofKind;
  status: ResultStatus;
  submitted_at: string;
};

const toParticipant = (r: ParticipantRow): Participant => ({
  id: r.id,
  email: r.email,
  displayName: r.display_name,
  country: r.country,
  newsletter: r.newsletter,
  isHost: r.is_host,
  hidden: r.hidden,
  prizeEligible: r.prize_eligible,
  createdAt: r.created_at,
});
const toResult = (r: ResultRow): RunResult => ({
  id: r.id,
  participantId: r.participant_id,
  windowId: r.window_id,
  timeSeconds: r.time_seconds,
  proofUrl: r.proof_url,
  proofKind: r.proof_kind,
  status: r.status,
  submittedAt: r.submitted_at,
});

/**
 * Supabase over PostgREST, on the dedicated Season project shared with bidding. The tables
 * live in a schema the API does not expose; the only way in is the SECURITY DEFINER
 * functions in supabase/migrations/20261005030000_season_challenge.sql, which check
 * `secret` against the stored hash. The key is the publishable key, never a service key.
 */
export function createSupabaseStore(url: string, key: string, secret: string, fetchImpl: typeof fetch = fetch): ChallengeStore {
  const base = `${url.replace(/\/$/, "")}/rest/v1/rpc`;

  async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
    const res = await fetchImpl(`${base}/${fn}`, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_secret: secret, ...args }),
    });
    const text = await res.text();
    // A duplicate email or name is a unique violation, which PostgREST returns as 409.
    if (res.status === 409 && text.includes("challenge_participants_name_key")) throw new ChallengeConflict("name");
    if (res.status === 409 && text.includes("challenge_participants_email_key")) throw new ChallengeConflict("email");
    if (!res.ok) throw new Error(`SUPABASE_FAILED:${res.status}`);
    return (text ? JSON.parse(text) : null) as T;
  }
  const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  return {
    kind: "supabase",
    async createParticipant(input) {
      const row = await rpc<ParticipantRow>("challenge_participant_insert", {
        p_row: {
          email: input.email,
          display_name: input.displayName,
          display_name_key: displayNameKey(input.displayName),
          country: input.country,
          newsletter: input.newsletter,
        },
      });
      return toParticipant(row);
    },
    async getParticipant(id) {
      if (!isUuid(id)) return undefined;
      const row = await rpc<ParticipantRow | null>("challenge_participant_find", { p_id: id, p_email: null });
      return row ? toParticipant(row) : undefined;
    },
    async findParticipantByEmail(email) {
      const row = await rpc<ParticipantRow | null>("challenge_participant_find", { p_id: null, p_email: email });
      return row ? toParticipant(row) : undefined;
    },
    async isNameTaken(displayName) {
      return rpc<boolean>("challenge_name_taken", { p_key: displayNameKey(displayName) });
    },
    async listParticipants() {
      return (await rpc<ParticipantRow[]>("challenge_participants_list")).map(toParticipant);
    },
    async listResults() {
      return (await rpc<ResultRow[]>("challenge_results_list")).map(toResult);
    },
    async saveResult(input) {
      const row = await rpc<ResultRow>("challenge_result_save", {
        p_row: {
          participant_id: input.participantId,
          window_id: input.windowId,
          time_seconds: input.timeSeconds,
          proof_url: input.proofUrl,
          proof_kind: input.proofKind,
          status: input.status,
        },
      });
      return toResult(row);
    },
    async setResultStatus(id, status) {
      if (!isUuid(id)) return;
      await rpc("challenge_result_set_status", { p_id: id, p_status: status });
    },
    async updateParticipant(id, patch) {
      if (!isUuid(id)) return;
      const p_patch: Record<string, boolean> = {};
      if (patch.hidden !== undefined) p_patch.hidden = patch.hidden;
      if (patch.prizeEligible !== undefined) p_patch.prize_eligible = patch.prizeEligible;
      await rpc("challenge_participant_update", { p_id: id, p_patch });
    },
    async deleteParticipant(id) {
      if (!isUuid(id)) return;
      await rpc("challenge_participant_delete", { p_id: id });
    },
  };
}

// On globalThis: Next bundles route handlers and pages separately, so a module-level
// variable would give the API and the pages two different demo stores.
const demoHolder = globalThis as typeof globalThis & { __challengeDemoStore?: ChallengeStore };

/** The configured store, or undefined in production without a database (the challenge then shows as not open). */
export function getChallengeStore(): ChallengeStore | undefined {
  if (hasChallengeDatabase()) {
    // Incomplete or invalid settings keep the challenge closed rather than falling back to demo data.
    const config = seasonDatabaseConfig();
    return config ? createSupabaseStore(config.url, config.key, config.secret) : undefined;
  }
  if (isChallengeDemo()) return (demoHolder.__challengeDemoStore ??= createDemoStore());
  return undefined;
}

/** Test-only: drop the cached demo store. */
export function __resetChallengeStore(): void {
  demoHolder.__challengeDemoStore = undefined;
}
