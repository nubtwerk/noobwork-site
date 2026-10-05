import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import AnimatedSection from "@/components/ui/AnimatedSection";
import ContourField from "@/components/ui/ContourField";
import ContactForm from "@/components/ui/ContactForm";
import RevealText from "@/components/ui/RevealText";
import SeasonBoard from "@/components/ui/SeasonBoard";
import SeasonProfile from "@/components/ui/SeasonProfile";
import ChallengeSection, { loadChallengeView } from "@/components/sections/ChallengeSection";
import { isChallengeVisible } from "@/data/challenge";
import TypeMarquee from "@/components/ui/TypeMarquee";
import ScrollToHash from "@/components/ui/ScrollToHash";
import { findSeasonSpot, season, seasonSpots, seasonStatusLabel } from "@/data/season";
import { parseInquiryAttribution } from "@/lib/inquiry-attribution";
import { socialMetadata } from "@/lib/site-metadata";

const description = "Season 1: one year of getting seriously fit, tested every quarter and filmed in Seoul. A small number of sponsor spots on Noobwork's profiles, one brand per category.";
export const metadata: Metadata = {
  title: "Season 1",
  description,
  alternates: { canonical: "/season" },
  // Spots are sold privately before the announcement; keep the page out of search until then.
  robots: season.isPublic ? undefined : { index: false, follow: false },
  ...socialMetadata("Season 1 | Noobwork", description, "/season"),
};

function formatUtcDay(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

type Query = Record<string, string | string[] | undefined>;
export default async function Season({ searchParams }: { searchParams?: Promise<Query> }) {
  const query = await searchParams ?? {};
  const chosen = findSeasonSpot(query.spot);
  const spot = chosen && chosen.status === "open" ? chosen : undefined;
  const feedback = typeof query.inquiry === "string" ? query.inquiry : undefined;
  const challengeFeedback = typeof query.challenge === "string" ? query.challenge : undefined;
  const runner = typeof query.runner === "string" ? query.runner : undefined;
  const challengeView = isChallengeVisible() ? await loadChallengeView() : undefined;
  const attribution = parseInquiryAttribution(
    Object.fromEntries(
      Object.entries(query).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
    ),
  ) ?? {};
  const board = seasonSpots.filter((s) => s.board !== null);
  const openCount = seasonSpots.filter((s) => s.status === "open").length;

  return (
    <div className="site-shell">
      <Nav />
      <ScrollToHash id="inquiry" trigger={`${spot?.id ?? ""}|${feedback ?? ""}`} force={Boolean(feedback)} />
      {challengeFeedback ? <ScrollToHash id="challenge" trigger={challengeFeedback} force /> : null}
      {runner ? <ScrollToHash id="leaderboard" trigger={runner} force /> : null}
      <main id="main-content" className="site-main media-kit season">
        <section className="site-section mk-hero season-hero">
          <ContourField />
          <div className="season-hero__veil" aria-hidden="true" />
          <div className="poster-hero__grain" aria-hidden="true" />
          <div className="shell-inner mk-hero__stage">
            <AnimatedSection>
              <div className="chapter-head chapter-head--ongreen mk-hero__head">
                <p className="chapter-head__marker">{season.name} · from <time dateTime={season.startsOn}>{formatUtcDay(season.startsOn)}</time></p>
                <h1 className="chapter-head__display mk-hero__title" aria-label="One year. Tested.">
                  <RevealText text="One year." /><br />
                  <span className="chapter-head__display-accent"><RevealText text="Tested." delay={0.15} /></span>
                </h1>
                <p className="chapter-head__note mk-hero__note">
                  I&apos;m spending a year getting seriously fit, as a gamer and an entrepreneur.
                  I&apos;ll test the products, trends and myths on the way. Every quarter I retest on camera.
                </p>
                <div className="hero-actions mk-hero__actions">
                  <a href="#board" className="btn btn--sand" data-partnership-source="season">See the spots</a>
                  <a href="#inquiry" className="btn btn--tertiary" data-partnership-source="season">Get in touch</a>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
        <div className="season-marquee">
          <TypeMarquee items={["Season 1", "Body scans", "Tested", "Strength", "Life in Korea", "5 km", "Myths", "Quarterly retests"]} variant="outline" duration={40} />
        </div>

        <div className="mk-content">
          <section className="mk-editorial">
            <AnimatedSection className="mk-editorial__aside">
              <div className="chapter-head"><p className="chapter-head__marker">01 / The season</p><h2 className="chapter-head__title">Prove it.</h2></div>
            </AnimatedSection>
            <div className="mk-content-intro">
              <p>Day one sets the baseline. Every three months I run the same tests again and publish the numbers, good or bad. Pick a checkpoint to see what gets measured.</p>
            </div>
          </section>
          <AnimatedSection className="season-profile-wrap">
            <SeasonProfile checkpoints={season.checkpoints} measures={season.measures} />
            <p className="mk-evidence-note">Illustrative curve. After each retest the line is redrawn from the real numbers.</p>
          </AnimatedSection>

          <section id="board" className="mk-work-section mk-anchor" aria-labelledby="board-title">
            <AnimatedSection>
              <div className="chapter-head"><p className="chapter-head__marker">02 / The board</p><h2 id="board-title" className="chapter-head__title">On the profiles.</h2></div>
              <p className="mk-evidence-note">
                Sponsors sit on my YouTube and X banners, which work as the season&apos;s board.
                Pick a spot to see what it includes. A spot shows here as it is taken. {openCount} of {seasonSpots.length} spots open.
              </p>
              <SeasonBoard spots={board} />
            </AnimatedSection>
          </section>

          <section className="mk-editorial">
            <AnimatedSection className="mk-editorial__aside">
              <div className="chapter-head"><p className="chapter-head__marker">03 / The spots</p><h2 className="chapter-head__title">Pick one.</h2></div>
            </AnimatedSection>
            <ul className="mk-numbered-list">
              {seasonSpots.map((item, index) => (
                <AnimatedSection as="li" key={item.id} className="mk-numbered-item" delay={index * 0.05}>
                  <span className="mk-numbered-item__num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mk-numbered-item__title">{item.title}</h3>
                  <div className="mk-numbered-item__desc mk-offer-copy">
                    <p><span className={`season-status season-status--${item.status}`}>{seasonStatusLabel[item.status]}</span> · {item.term}</p>
                    <ul className="mk-deliverables">{item.includes.map((line) => <li key={line}>{line}</li>)}</ul>
                    {item.status === "open" ? (
                      <Link className="btn btn--secondary" href={`/season?spot=${item.id}#inquiry`} data-partnership-source="season" data-partnership-offer="season">
                        Claim this spot <span className="sr-only">: {item.title}</span>
                      </Link>
                    ) : null}
                  </div>
                </AnimatedSection>
              ))}
            </ul>
          </section>

          <section className="mk-featured-partner" aria-labelledby="rules-title">
            <AnimatedSection>
              <p className="chapter-head__marker">The rules</p>
              <h2 id="rules-title" className="chapter-head__title">Placement, never a verdict.</h2>
              <p>Sponsors buy a place on the profiles and in the season. They don&apos;t buy a review. I won&apos;t test or debunk a sponsor&apos;s own product category while they are on the board.</p>
              <p>One brand per category. Every sponsored post is labelled as a paid partnership. Banner spots run per quarter, so you can start small and renew.</p>
            </AnimatedSection>
          </section>

          {challengeView ? <ChallengeSection view={challengeView} feedback={challengeFeedback} runner={runner} /> : null}
        </div>

        <section className="site-section mk-finale">
          <div className="shell-inner">
            <AnimatedSection>
              <div className="mk-finale__layout">
                <div className="mk-finale__intro">
                  <div className="chapter-head">
                    <p className="chapter-head__marker">Next step</p>
                    <h2 className="chapter-head__display partner__display" aria-label="Take a spot">
                      <RevealText text="Take a" /><br />
                      <span className="chapter-head__display-accent"><RevealText text="spot." delay={0.18} /></span>
                    </h2>
                  </div>
                  <p className="partner-pitch__copy mk-finale__copy">
                    {spot
                      ? `You picked ${spot.title} (${spot.term}). Tell me about your brand and I'll come back with terms.`
                      : "Tell me which spot interests you and a bit about your brand. I'll come back with terms."}
                  </p>
                </div>
                <div id="inquiry" className="mk-inquiry">
                  <ContactForm
                    key={spot?.id ?? "season"}
                    initialOffer="season"
                    initialMessage={spot ? `I'd like to discuss ${spot.title} (${spot.term}) for ${season.name}.` : ""}
                    feedback={feedback}
                    initialAttribution={attribution}
                  />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
        <div className="mk-back shell-inner"><Link href="/media-kit" className="back-link">&larr; All partnership formats</Link></div>
      </main>
      <Footer />
    </div>
  );
}
