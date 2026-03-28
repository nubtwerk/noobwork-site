import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import CountUp from "@/components/ui/CountUp";
import { mediaKitStats } from "@/data/stats";
import { audienceDemographics, contentCategories, partnershipTypes } from "@/data/media-kit";

export const metadata: Metadata = {
  title: "Media Kit - Noobwork | Joachim Haraldsen",
  description: "Partner with Noobwork. Audience stats, demographics, content verticals, and collaboration opportunities with Joachim Haraldsen.",
};

export default function MediaKit() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main id="main-content" className="pt-24">
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <h1 className="text-4xl md:text-5xl text-foreground mb-4 font-[family-name:var(--font-newake)] uppercase tracking-tight">
                Media <span className="text-accent">Kit</span>
              </h1>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
                I&apos;ve spent over a decade building authentic communities in gaming, esports, and entertainment. Here&apos;s what a partnership with me looks like.
              </p>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-16 px-6 bg-surface">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className="text-2xl text-foreground mb-8 text-center font-[family-name:var(--font-newake)] uppercase tracking-tight">
                Audience <span className="text-primary">Overview</span>
              </h2>
            </AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {mediaKitStats.map((stat, i) => (
                <AnimatedSection key={stat.label} delay={i * 0.1}>
                  <div className="bg-background rounded-xl p-6 text-center border border-sand">
                    <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                      {stat.numericValue != null ? (
                        <CountUp target={stat.numericValue} suffix={stat.suffix} />
                      ) : (
                        <span>{stat.value}</span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/60">{stat.label}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className="text-2xl text-foreground mb-8 text-center font-[family-name:var(--font-newake)] uppercase tracking-tight">
                Audience <span className="text-primary">Demographics</span>
              </h2>
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-6">
              {audienceDemographics.map((item, i) => (
                <AnimatedSection key={item.label} delay={i * 0.1}>
                  <div className="bg-surface rounded-xl p-6 text-center border border-sand">
                    <p className="text-sm text-foreground/50 mb-1">{item.label}</p>
                    <p className="text-2xl font-bold text-foreground mb-1">{item.value}</p>
                    <p className="text-sm text-foreground/60">{item.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-surface">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className="text-2xl text-foreground mb-8 text-center font-[family-name:var(--font-newake)] uppercase tracking-tight">
                Content <span className="text-primary">Categories</span>
              </h2>
            </AnimatedSection>
            <div className="grid md:grid-cols-2 gap-6">
              {contentCategories.map((cat, i) => (
                <AnimatedSection key={cat.title} delay={i * 0.1}>
                  <div className="bg-background rounded-xl p-6 border border-sand">
                    <h3 className="font-semibold text-lg text-foreground mb-2 font-[family-name:var(--font-newake)] uppercase tracking-tight">{cat.title}</h3>
                    <p className="text-foreground/70">{cat.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className="text-2xl text-foreground mb-8 text-center font-[family-name:var(--font-newake)] uppercase tracking-tight">
                Partnership <span className="text-primary">Types</span>
              </h2>
            </AnimatedSection>
            <div className="grid md:grid-cols-2 gap-6">
              {partnershipTypes.map((type, i) => (
                <AnimatedSection key={type.title} delay={i * 0.1}>
                  <div className="bg-surface rounded-xl p-6 border border-sand">
                    <h3 className="font-semibold text-lg text-foreground mb-2 font-[family-name:var(--font-newake)] uppercase tracking-tight">{type.title}</h3>
                    <p className="text-foreground/70">{type.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-surface">
          <div className="max-w-2xl mx-auto text-center">
            <AnimatedSection>
              <h2 className="text-3xl text-foreground mb-4 font-[family-name:var(--font-newake)] uppercase tracking-tight">
                Let&apos;s Work <span className="text-accent">Together</span>
              </h2>
              <p className="text-foreground/60 mb-8">
                Interested in a partnership? Reach out directly or follow my Beacons page for updates and announcements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://beacons.ai/noobwork"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-background px-8 py-3 rounded-full font-semibold hover:bg-primary-hover transition-colors"
                >
                  Follow on Beacons
                </a>
                <a
                  href="mailto:joachim@noobwork.no"
                  className="bg-offwhite text-foreground px-8 py-3 rounded-full font-semibold border border-sand hover:border-primary transition-colors"
                >
                  Get in Touch
                </a>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-8 px-6 text-center">
          <Link href="/" className="text-primary hover:underline text-sm">
            &larr; Back to home
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
