"use client";

import { useState, useEffect, useCallback, useSyncExternalStore, FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, X } from "lucide-react";

interface MediaKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function subscribe() {
  return () => {};
}

function MediaKitForm() {
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
        body: JSON.stringify({ email, formId: "media-kit" }),
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

  return submitted ? (
    <div className="bg-primary/10 text-primary rounded-lg px-6 py-4 font-medium">
      You&apos;re on the list! I&apos;ll notify you when it launches.
    </div>
  ) : (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
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
          {loading ? "Submitting..." : "Notify Me"}
        </button>
      </form>
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
    </>
  );
}

export default function MediaKitModal({ isOpen, onClose }: MediaKitModalProps) {
  // Track open count to reset form via key when modal reopens
  const [openCount, setOpenCount] = useState(0);

  const handleClose = useCallback(() => {
    onClose();
    setOpenCount((c) => c + 1);
  }, [onClose]);

  // SSR-safe mount check using useSyncExternalStore
  const isMounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Media Kit Coming Soon"
          className="fixed inset-0 z-[60] flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-background rounded-2xl shadow-xl border border-border p-8 max-w-md w-full mx-4"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-4 right-4 text-foreground/40 hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Media Kit <span className="text-primary">Coming Soon</span>
              </h2>
              <p className="text-foreground/60 mb-6">
                The media kit is being put together. Drop your email and I&apos;ll let you know when it&apos;s ready.
              </p>

              <MediaKitForm key={openCount} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
