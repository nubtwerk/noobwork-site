import { randomUUID } from "node:crypto";
import type { ChallengeWindowId } from "@/data/challenge";
import type { ProofKind } from "./validate";
import { displayNameKey } from "./validate";
import { hasChallengeDatabase, isChallengeDemo } from "./env";
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

export function createSupabaseStore(url: string, serviceKey: string, fetchImpl: typeof fetch = fetch): ChallengeStore {
  const base = `${url.replace(/\/$/, "")}/rest/v1`;

  async function call<T>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
    const res = await fetchImpl(`${base}${path}`, {
      ...init,
      signal: AbortSignal.timeout(8_000),
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        ...(init.prefer ? { Prefer: init.prefer } : {}),
      },
    });
    if (res.status === 409) {
      const text = await res.text();
      throw new ChallengeConflict(text.includes("name_key") ? "name" : "email");
    }
    if (!res.ok) throw new Error(`SUPABASE_FAILED:${res.status}`);
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }
  const q = encodeURIComponent;

  return {
    kind: "supabase",
    async createParticipant(input) {
      const rows = await call<ParticipantRow[]>("/challenge_participants", {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({
          email: input.email,
          display_name: input.displayName,
          display_name_key: displayNameKey(input.displayName),
          country: input.country,
          newsletter: input.newsletter,
        }),
      });
      return toParticipant(rows[0]);
    },
    async getParticipant(id) {
      if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
      const rows = await call<ParticipantRow[]>(`/challenge_participants?id=eq.${q(id)}&limit=1`);
      return rows[0] ? toParticipant(rows[0]) : undefined;
    },
    async findParticipantByEmail(email) {
      const rows = await call<ParticipantRow[]>(`/challenge_participants?email=eq.${q(email)}&limit=1`);
      return rows[0] ? toParticipant(rows[0]) : undefined;
    },
    async isNameTaken(displayName) {
      const rows = await call<{ id: string }[]>(`/challenge_participants?select=id&display_name_key=eq.${q(displayNameKey(displayName))}&limit=1`);
      return rows.length > 0;
    },
    async listParticipants() {
      return (await call<ParticipantRow[]>("/challenge_participants?order=created_at.asc")).map(toParticipant);
    },
    async listResults() {
      return (await call<ResultRow[]>("/challenge_results?order=submitted_at.asc")).map(toResult);
    },
    async saveResult(input) {
      const rows = await call<ResultRow[]>("/challenge_results?on_conflict=participant_id,window_id", {
        method: "POST",
        prefer: "return=representation,resolution=merge-duplicates",
        body: JSON.stringify({
          participant_id: input.participantId,
          window_id: input.windowId,
          time_seconds: input.timeSeconds,
          proof_url: input.proofUrl,
          proof_kind: input.proofKind,
          status: input.status,
          submitted_at: new Date().toISOString(),
        }),
      });
      return toResult(rows[0]);
    },
    async setResultStatus(id, status) {
      await call(`/challenge_results?id=eq.${q(id)}`, { method: "PATCH", body: JSON.stringify({ status }) });
    },
    async updateParticipant(id, patch) {
      const body: Record<string, boolean> = {};
      if (patch.hidden !== undefined) body.hidden = patch.hidden;
      if (patch.prizeEligible !== undefined) body.prize_eligible = patch.prizeEligible;
      await call(`/challenge_participants?id=eq.${q(id)}`, { method: "PATCH", body: JSON.stringify(body) });
    },
    async deleteParticipant(id) {
      // Results go with the runner (on delete cascade).
      await call(`/challenge_participants?id=eq.${q(id)}`, { method: "DELETE" });
    },
  };
}

// On globalThis: Next bundles route handlers and pages separately, so a module-level
// variable would give the API and the pages two different demo stores.
const demoHolder = globalThis as typeof globalThis & { __challengeDemoStore?: ChallengeStore };

/** The configured store, or undefined in production without a database (the challenge then shows as not open). */
export function getChallengeStore(): ChallengeStore | undefined {
  if (hasChallengeDatabase()) {
    return createSupabaseStore(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  if (isChallengeDemo()) return (demoHolder.__challengeDemoStore ??= createDemoStore());
  return undefined;
}

/** Test-only: drop the cached demo store. */
export function __resetChallengeStore(): void {
  demoHolder.__challengeDemoStore = undefined;
}
