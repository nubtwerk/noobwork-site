import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __setBidStore, getBidStore } from "@/lib/season-bids/store";

const ref = "abcdefghijklmnopqrst";
const config = {
  SEASON_SUPABASE_URL: `https://${ref}.supabase.co`,
  SEASON_SUPABASE_PROJECT_REF: ref,
  SEASON_SUPABASE_KEY: "sb_publishable_test",
  SEASON_DB_SECRET: "synthetic-test-secret-with-32-characters",
};
beforeEach(() => {
  __setBidStore(undefined);
  for (const name of Object.keys(config)) vi.stubEnv(name, "");
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("SEASON_BIDS_STORE", "");
});
afterEach(() => {
  __setBidStore(undefined);
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
function configure(overrides: Partial<typeof config> = {}) {
  for (const [name, value] of Object.entries({ ...config, ...overrides })) vi.stubEnv(name, value);
}
describe("dedicated sponsorship database boundary", () => {
  it("disables production bidding without hosted config, even with demo/memory selected", () => {
    expect(getBidStore()).toBeNull();
    for (const mode of ["memory", "demo"]) {
      vi.stubEnv("SEASON_BIDS_STORE", mode);
      expect(getBidStore()).toBeNull();
    }
  });
  it.each(Object.keys(config))("fails closed if %s is missing", (name) => {
    configure();
    vi.stubEnv(name, "");
    expect(getBidStore()).toBeNull();
    vi.stubEnv("NODE_ENV", "development");
    expect(getBidStore()).toBeNull();
  });
  it("blocks the retiring fitness project and mismatched or unsafe endpoints", () => {
    const oldRef = "mudmzagbhjriswjdzzcq";
    configure({ SEASON_SUPABASE_PROJECT_REF: oldRef, SEASON_SUPABASE_URL: `https://${oldRef}.supabase.co` });
    expect(getBidStore()).toBeNull();
    const authenticatedUrl = new URL(config.SEASON_SUPABASE_URL);
    authenticatedUrl.username = "synthetic-user";
    authenticatedUrl.password = "synthetic-password";
    for (const url of ["not-a-url", "https://another.supabase.co", `http://${ref}.supabase.co`, `https://${ref}.supabase.co/rest`, `https://${ref}.supabase.co?secret=x`, authenticatedUrl.toString()]) {
      configure({ SEASON_SUPABASE_URL: url });
      expect(getBidStore()).toBeNull();
    }
    configure({ SEASON_DB_SECRET: "too-short" });
    expect(getBidStore()).toBeNull();
    configure({ SEASON_SUPABASE_KEY: "sb_secret_do-not-use" });
    expect(getBidStore()).toBeNull();
  });
  it("uses only the explicitly selected project for the RPC", async () => {
    configure();
    const fetchMock = vi.fn().mockResolvedValue(new Response("[]"));
    vi.stubGlobal("fetch", fetchMock);
    await getBidStore()!.list();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe(`https://${ref}.supabase.co/rest/v1/rpc/season_bids_list`);
  });
  it("keeps unconfigured development local", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await getBidStore()!.list()).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
