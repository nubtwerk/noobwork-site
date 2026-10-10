"use client";

import { usePathname, useSearchParams } from "next/navigation";

function returnPath(candidate: string | null): string {
  if (!candidate || !candidate.startsWith("/season") || candidate.startsWith("/season/admin")) return "/season";
  if (candidate.includes("//") || candidate.includes("\\")) return "/season";
  return candidate;
}

export default function SeasonUnlockForm({ configured }: { configured: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const error = searchParams.get("unlock") ?? undefined;
  const next = returnPath(searchParams.get("next") ?? pathname);
  const action = next === "/season"
    ? "/api/season/unlock"
    : `/api/season/unlock?next=${encodeURIComponent(next)}`;

  return (
    <main id="main-content" className="season-admin">
      <div className="season-admin__head">
        <p className="chapter-head__marker">Season 1 · Private</p>
        <h1 className="chapter-head__title">Season 1</h1>
        <p className="season-admin__meta">Enter the page password to continue.</p>
      </div>
      {!configured ? (
        <p role="alert">This page is locked. Set SEASON_PAGE_PASSWORD in the environment to open it.</p>
      ) : (
        <form className="contact-form season-admin__login" method="post" action={action}>
          {next !== "/season" ? <input type="hidden" name="next" value={next} /> : null}
          <div className="contact-form__field">
            <label className="contact-form__label" htmlFor="season-page-password">Password</label>
            <input
              id="season-page-password"
              name="password"
              type="password"
              className="contact-form__input"
              required
              autoComplete="current-password"
            />
          </div>
          {error ? (
            <p className="contact-form__error" role="alert">
              {error === "limited" ? "Too many tries. Wait an hour." : "Wrong password."}
            </p>
          ) : null}
          <button type="submit" className="btn btn--primary contact-form__submit">Continue</button>
        </form>
      )}
    </main>
  );
}
