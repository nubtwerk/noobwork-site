"use client";

import { useState, useEffect } from "react";

export default function CopyContextButton() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  async function handleCopy() {
    try {
      const res = await fetch("/context/llm.txt");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Fallback: open the raw text in a new tab
      window.open("/context/llm.txt", "_blank");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="context-link context-link--button"
    >
      {copied ? "Copied to clipboard" : "Copy all as markdown"}
    </button>
  );
}
