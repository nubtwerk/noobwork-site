import Link from "next/link";

export default function Nav() {
  return (
    <nav aria-label="Main navigation" className="fixed top-0 w-full bg-background/80 backdrop-blur-sm z-50 border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-primary font-semibold text-lg">
          noobwork
        </Link>
        <div className="flex items-center gap-6 text-sm text-foreground/70">
          <a href="#about" className="hover:text-primary transition-colors">About</a>
          <a href="#work" className="hover:text-primary transition-colors">Work</a>
          <a href="#connect" className="hover:text-primary transition-colors">Connect</a>
          <Link
            href="/media-kit"
            className="px-3 py-1 border border-primary text-primary rounded-full text-sm hover:bg-primary hover:text-white transition-colors"
          >
            Media Kit
          </Link>
        </div>
      </div>
    </nav>
  );
}
