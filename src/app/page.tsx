import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import SocialProof from "@/components/sections/SocialProof";
import ContentReel from "@/components/sections/ContentReel";
import About from "@/components/sections/About";
import ContentPillars from "@/components/sections/ContentPillars";
import Work from "@/components/sections/Work";
import PartnerCta from "@/components/sections/PartnerCta";
import Newsletter from "@/components/sections/Newsletter";
import Connect from "@/components/sections/Connect";
import { getLatestVideos } from "@/lib/get-videos";

export default async function Home() {
  const { featuredVideo, recentVideos } = await getLatestVideos();

  return (
    <div className="site-shell">
      <Nav />
      <main id="main-content" className="site-main">
        <Hero />
        <SocialProof />
        <ContentReel featuredVideo={featuredVideo} recentVideos={recentVideos} />
        <About />
        <ContentPillars />
        <Work />
        <PartnerCta />
        <Newsletter />
        <Connect />
      </main>
      <Footer />
    </div>
  );
}
