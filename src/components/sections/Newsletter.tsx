import { Mail } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function Newsletter() {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-xl mx-auto">
        <AnimatedSection>
          <div className="bg-surface rounded-2xl p-10 text-center shadow-sm">
            <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-2 font-[family-name:var(--font-newake)] uppercase tracking-tight">
              Stay in the <span className="text-accent">Loop</span>
            </h2>
            <p className="text-foreground/60 mb-8">
              Get occasional updates on new ventures, content, and behind-the-scenes insights.
            </p>
            <a
              href="https://beacons.ai/noobwork"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors"
            >
              Subscribe
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
