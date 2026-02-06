"use client";

import { useState, FormEvent } from "react";
import { Mail } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, formId: "newsletter" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 px-6 bg-surface">
      <div className="max-w-2xl mx-auto text-center">
        <AnimatedSection>
          <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Stay in the <span className="text-primary">Loop</span>
          </h2>
          <p className="text-foreground/60 mb-8">
            Get occasional updates on new ventures, content, and behind-the-scenes insights.
          </p>

          {submitted ? (
            <div className="bg-primary/10 text-primary rounded-lg px-6 py-4 font-medium">
              Thanks for subscribing! You&apos;ll hear from me soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
}
