"use client";

import { useState } from "react";
import MediaKitModal from "@/components/ui/MediaKitModal";

export default function Nav() {
  const [mediaKitOpen, setMediaKitOpen] = useState(false);

  return (
    <>
      <nav aria-label="Main navigation" className="fixed top-0 w-full bg-background/80 backdrop-blur-sm z-50 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" onClick={(e) => { if (window.location.pathname === "/") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); } }} className="text-primary font-semibold text-lg cursor-pointer">
            noobwork
          </a>
          <div className="flex items-center gap-6 text-sm text-foreground/70">
            <a href="/#about" className="hover:text-primary transition-colors">About</a>
            <a href="/#work" className="hover:text-primary transition-colors">Work</a>
            <a href="/#connect" className="hover:text-primary transition-colors">Connect</a>
            <button
              onClick={() => setMediaKitOpen(true)}
              className="px-3 py-1 border border-primary text-primary rounded-full text-sm hover:bg-primary hover:text-white transition-colors"
            >
              Media Kit
            </button>
          </div>
        </div>
      </nav>
      <MediaKitModal isOpen={mediaKitOpen} onClose={() => setMediaKitOpen(false)} />
    </>
  );
}
