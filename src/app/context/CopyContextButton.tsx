"use client";

import { useState } from "react";

export default function CopyContextButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const res = await fetch("/context/llm.txt");
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: open the raw text in a new tab
      window.open("/context/llm.txt", "_blank");
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="context-link context-link--button"
    >
      {copied ? "Copied to clipboard" : "Copy all as markdown"}
    </button>
  );
}
