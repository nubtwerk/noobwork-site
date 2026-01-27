import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#FAF7F2]/80 backdrop-blur-sm z-50 border-b border-[#E8E4DF]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-[#7C3AED] font-semibold text-lg">noobwork</span>
          <div className="flex gap-6 text-sm text-[#3D2E24]/70">
            <a href="#about" className="hover:text-[#7C3AED] transition-colors">About</a>
            <a href="#work" className="hover:text-[#7C3AED] transition-colors">Work</a>
            <a href="#connect" className="hover:text-[#7C3AED] transition-colors">Connect</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#7C3AED] text-sm font-medium tracking-wide uppercase mb-4">
              Creator • Entrepreneur • Esports Pioneer
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#3D2E24] mb-4">
              Hey, I&apos;m <span className="text-[#7C3AED]">Joachim</span>
            </h1>
            <p className="text-lg text-[#3D2E24]/70 mb-8 leading-relaxed">
              Norwegian creator based in Tokyo. Building at the intersection of gaming, technology, and entertainment. Forbes featured entrepreneur.
            </p>
            <div className="flex gap-4 mb-8">
              <a href="#work" className="bg-[#7C3AED] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#6D28D9] transition-colors">
                View My Work
              </a>
              <a href="#connect" className="bg-white text-[#3D2E24] px-6 py-3 rounded-lg font-medium border border-[#E8E4DF] hover:border-[#7C3AED] transition-colors">
                Get in Touch
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#3D2E24]/60">
              <div className="flex items-center gap-2">
                <span className="text-[#7C3AED]">★</span>
                <span>Forbes Featured</span>
              </div>
              <div>
                <span className="font-semibold text-[#3D2E24]">200K+</span> YouTube subscribers
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/20 to-[#F59E0B]/20 rounded-3xl transform rotate-3"></div>
            <Image
              src="/joachim.jpg"
              alt="Joachim Haraldsen"
              width={500}
              height={600}
              className="relative rounded-3xl shadow-xl object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#3D2E24] mb-2">About <span className="text-[#7C3AED]">Me</span></h2>
          <p className="text-[#3D2E24]/60 mb-12">The story so far</p>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6 text-[#3D2E24]/80 leading-relaxed">
              <p>
                I&apos;m a Norwegian content creator and entrepreneur who&apos;s been shaping the gaming and esports landscape for over a decade. In 2013, I pioneered content creation on YouTube in Norway, building <span className="text-[#7C3AED] font-medium">Noobwork</span> — my internet persona — into a community of nearly <span className="font-semibold">200,000 subscribers</span>. In a country of 5 million people, reaching this scale in Norwegian-language gaming content is a remarkable achievement.
              </p>
              <p>
                I founded <span className="text-[#7C3AED] font-medium">Heroic Group</span> from scratch and built it into one of the largest esports organizations in the world. The journey earned me recognition with a <span className="font-semibold">Forbes feature</span>, and I successfully sold the company to pursue new ventures.
              </p>
              <p>
                Now based in <span className="font-semibold">Tokyo, Japan</span>, I continue to build at the intersection of gaming, technology, and entertainment.
              </p>
            </div>
            <div className="space-y-8">
              <div className="bg-[#FAF7F2] rounded-xl p-6">
                <h3 className="font-semibold text-[#3D2E24] mb-4">Current Focus</h3>
                <ul className="space-y-2 text-[#3D2E24]/70">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full"></span>
                    Executive Advisor at Blast.tv
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full"></span>
                    Executive Advisor at Nåva Space
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full"></span>
                    Stealth Startups
                  </li>
                </ul>
              </div>
              <div className="bg-[#FAF7F2] rounded-xl p-6">
                <h3 className="font-semibold text-[#3D2E24] mb-4">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {["Gaming", "Esports", "Fitness", "Japanese Culture", "Piano"].map((interest) => (
                    <span key={interest} className="px-3 py-1 bg-white rounded-full text-sm text-[#3D2E24]/70 border border-[#E8E4DF]">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="py-20 px-6 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#3D2E24] mb-2">Work & <span className="text-[#7C3AED]">Ventures</span></h2>
          <p className="text-[#3D2E24]/60 mb-12">Building companies and communities</p>
          
          <div className="space-y-6">
            {[
              { name: "Heroic Group", status: "Founder • Successfully Sold", desc: "Founded and built from scratch into one of the largest esports organizations in the world. Featured in Forbes for the journey of scaling a competitive gaming organization across multiple titles and regions." },
              { name: "Noobwork", status: "Creator • 2013-Present", desc: "My internet persona and the foundation of my creator journey. Pioneered gaming content creation in Norway, building a community of nearly 200,000 subscribers — an extraordinary achievement in Norwegian-language gaming." },
              { name: "Blast.tv", status: "Executive Advisor • Current", desc: "Advising one of the world's premier esports tournament organizers. Blast produces top-tier Counter-Strike and other esports events watched by millions globally." },
              { name: "Nåva Space", status: "Executive Advisor • Current", desc: "Advisory role in the space technology sector, bringing entrepreneurial and operational expertise to the next frontier." },
              { name: "Stealth Startup 1", status: "Founder • Current", desc: "A technology labs company. More details coming soon." },
              { name: "Stealth Startup 2", status: "Founder • Current", desc: "A venture in the health and wellness space. More details coming soon." },
            ].map((item) => (
              <div key={item.name} className="bg-white rounded-xl p-6 border border-[#E8E4DF]">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-[#3D2E24]">{item.name}</h3>
                  <span className="text-xs px-3 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded-full">{item.status}</span>
                </div>
                <p className="text-[#3D2E24]/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section id="connect" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#3D2E24] mb-2">Let&apos;s <span className="text-[#7C3AED]">Connect</span></h2>
          <p className="text-[#3D2E24]/60 mb-12">Find me across the internet or reach out directly.</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "YouTube", url: "https://youtube.com/user/Noobworkify", icon: "▶" },
              { name: "X / Twitter", url: "https://twitter.com/noobwork", icon: "𝕏" },
              { name: "Instagram", url: "https://instagram.com/noobwork", icon: "📷" },
              { name: "LinkedIn", url: "https://linkedin.com/in/joachim-haraldsen", icon: "in" },
              { name: "Email", url: "mailto:joachim@noobwork.no", icon: "✉" },
            ].map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-[#FAF7F2] rounded-lg border border-[#E8E4DF] hover:border-[#7C3AED] transition-colors"
              >
                <span>{social.icon}</span>
                <span className="text-[#3D2E24]">{social.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-[#3D2E24] text-white/60 text-center text-sm">
        <p>© 2025 Joachim Haraldsen. Built with ☕ in Tokyo.</p>
        <p className="mt-2">🇳🇴 🇯🇵</p>
      </footer>
    </div>
  );
}
