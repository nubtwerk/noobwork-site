import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import CountUp from "@/components/ui/CountUp";
import { mediaKitStats } from "@/data/stats";
import { audienceDemographics, contentCategories, partnershipTypes } from "@/data/media-kit";

export const metadata: Metadata = {
  title: "Media Kit - Joachim Haraldsen (Noobwork)",
  description: "Partnership opportunities with Joachim Haraldsen. Audience stats, demographics, content categories, and collaboration options.",
};

export default function MediaKit() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main id="main-content" className="pt-24">
        {/* Header */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Media <span className="text-primary">Kit</span>
              </h1>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
                I&apos;ve spent over a decade building authentic communities in gaming, esports, and entertainment. Here&apos;s what a partnership with me looks like.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Audience Stats */}
        <section className="py-16 px-6 bg-surface">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Audience <span className="text-primary">Overview</span>
              </h2>
            </AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {mediaKitStats.map((stat, i) => (
                <AnimatedSection key={stat.label} delay={i * 0.1}>
                  <div className="bg-background rounded-xl p-6 text-center border border-border">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                      <CountUp target={stat.numericValue!} suffix={stat.suffix} />
                    </div>
                    <p className="text-sm text-foreground/60">{stat.label}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Demographics */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Audience <span className="text-primary">Demographics</span>
              </h2>
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-6">
              {audienceDemographics.map((item, i) => (
                <AnimatedSection key={item.label} delay={i * 0.1}>
                  <div className="bg-surface rounded-xl p-6 text-center border border-border">
                    <p className="text-sm text-foreground/50 mb-1">{item.label}</p>
                    <p className="text-2xl font-bold text-foreground mb-1">{item.value}</p>
                    <p className="text-sm text-foreground/60">{item.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Content Categories */}
        <section className="py-16 px-6 bg-surface">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Content <span className="text-primary">Categories</span>
              </h2>
            </AnimatedSection>
            <div className="grid md:grid-cols-2 gap-6">
              {contentCategories.map((cat, i) => (
                <AnimatedSection key={cat.title} delay={i * 0.1}>
                  <div className="bg-background rounded-xl p-6 border border-border">
                    <h3 className="font-semibold text-lg text-foreground mb-2">{cat.title}</h3>
                    <p className="text-foreground/70">{cat.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Partnership Types */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Partnership <span className="text-primary">Types</span>
              </h2>
            </AnimatedSection>
            <div className="grid md:grid-cols-2 gap-6">
              {partnershipTypes.map((type, i) => (
                <AnimatedSection key={type.title} delay={i * 0.1}>
                  <div className="bg-surface rounded-xl p-6 border border-border">
                    <h3 className="font-semibold text-lg text-foreground mb-2">{type.title}</h3>
                    <p className="text-foreground/70">{type.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Download & Contact CTAs */}
        <section className="py-20 px-6 bg-surface">
          <div className="max-w-2xl mx-auto text-center">
            <AnimatedSection>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Let&apos;s Work <span className="text-primary">Together</span>
              </h2>
              <p className="text-foreground/60 mb-8">
                Interested in a partnership? I&apos;d love to hear about your brand and explore how we can create something great together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* TODO: Add actual media-kit.pdf to public/ when ready */}
                <a
                  href="/media-kit.pdf"
                  className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors"
                >
                  Download PDF
                </a>
                <a
                  href="mailto:joachim@noobwork.no"
                  className="bg-background text-foreground px-8 py-3 rounded-lg font-medium border border-border hover:border-primary transition-colors"
                >
                  Get in Touch
                </a>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Back link */}
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
