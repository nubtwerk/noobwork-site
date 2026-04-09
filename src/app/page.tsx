import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import LatestVideo from "@/components/sections/LatestVideo";
import About from "@/components/sections/About";
import ContentPillars from "@/components/sections/ContentPillars";
import Work from "@/components/sections/Work";
import Newsletter from "@/components/sections/Newsletter";
import Connect from "@/components/sections/Connect";

export default function Home() {
  return (
    <div className="site-shell">
      <Nav />
      <main id="main-content" className="site-main">
        <Hero />
        <LatestVideo />
        <About />
        <ContentPillars />
        <Work />
        <Newsletter />
        <Connect />
      </main>
      <Footer />
    </div>
  );
}
