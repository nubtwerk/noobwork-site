"use client";

import { useState } from "react";
import Logo from "@/components/ui/Logo";
import MediaKitModal from "@/components/ui/MediaKitModal";

export default function Nav() {
  const [mediaKitOpen, setMediaKitOpen] = useState(false);

  return (
    <>
      <nav aria-label="Main navigation" className="fixed top-0 w-full bg-background/80 backdrop-blur-sm z-50 border-b border-sand">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" onClick={(e) => { if (window.location.pathname === "/") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); } }} className="cursor-pointer text-xl">
            <Logo variant="wordmark" />
          </a>
          <div className="flex items-center gap-6 text-sm text-foreground/70 font-medium">
            <a href="/#about" className="hover:text-primary transition-colors">About</a>
            <a href="/#work" className="hover:text-primary transition-colors">Work</a>
            <a href="/#connect" className="hover:text-primary transition-colors">Connect</a>
            <button
              onClick={() => setMediaKitOpen(true)}
              className="px-4 py-1.5 bg-primary text-white rounded-full text-sm hover:bg-primary-hover transition-colors"
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
