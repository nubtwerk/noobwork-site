import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import SocialProof from "@/components/sections/SocialProof";
import About from "@/components/sections/About";
import Work from "@/components/sections/Work";
import Newsletter from "@/components/sections/Newsletter";
import Connect from "@/components/sections/Connect";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main id="main-content">
        <Hero />
        <SocialProof />
        <About />
        <Work />
        <Newsletter />
        <Connect />
      </main>
      <Footer />
    </div>
  );
}
