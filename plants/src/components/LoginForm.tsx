"use client";

import { useState, useTransition } from "react";
import { requestLoginAction } from "@/app/auth-actions";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setDevLink(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await requestLoginAction(fd, nextPath);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      if (result.devLink) {
        setDevLink(result.devLink);
      }
      setMessage(result.message);
    });
  }

  return (
    <form onSubmit={submit} className="plant-card space-y-4 p-6">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue="joachim@noobwork.no"
          className="w-full rounded-xl border border-foreground/15 bg-white/70 px-4 py-3 text-sm"
        />
      </div>

      {error && (
        <p className="text-sm text-overdue" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-primary" role="status">
          {message}
        </p>
      )}
      {devLink && (
        <p className="text-sm break-all">
          <span className="text-foreground/60">Dev link: </span>
          <a href={devLink} className="font-medium text-primary">
            Sign in
          </a>
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
