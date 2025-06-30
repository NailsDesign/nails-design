import React from 'react';

export default function About() {
  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center text-[#2d1b0e] mb-8">About Us</h1>
      
      <section className="mb-12 bg-gradient-to-br from-[#fff8e1] to-[#fdf6ed] rounded-2xl shadow-lg p-8 border border-[#f3e5ab]">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="flex-shrink-0 w-full md:w-60">
            <img
              src="https://via.placeholder.com/240x240?text=Tina"
              alt="Tina, main nail technician greeting a client"
              className="rounded-2xl w-full h-auto object-cover shadow-md"
            />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#d4af37] mb-4">Discover Nail Bliss in Bayswater</h2>
            <p className="text-[#8b7d6b] text-lg leading-relaxed mb-4">
              <span className="font-bold text-[#2d1b0e]">Nails Design</span> is a cozy Bayswater studio built on one simple idea: <span className="font-semibold">put the client first</span>. From the moment you step in, you'll notice the difference. We take the time to listen to exactly what you want – shape, color, style – and never rush your treatment.
            </p>
            <p className="text-[#8b7d6b] text-lg leading-relaxed mb-4">
              Our team brings <span className="font-semibold">20+ years of experience</span> and uses only top brands like <span className="font-semibold">OPI, CND, Essie, and Gelish</span> for quality you can trust.
            </p>
            <p className="text-[#8b7d6b] text-lg leading-relaxed">
              The result? Gorgeous, Instagram-worthy nails without breaking the bank. And yes – every manicure ends with a <span className="font-semibold">free 5-minute hand massage</span> to leave you feeling pampered and stress-free.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12 bg-gradient-to-br from-[#fff8e1] to-[#fdf6ed] rounded-2xl shadow-lg p-8 border border-[#f3e5ab]">
        <h2 className="text-2xl font-bold text-[#d4af37] mb-6 text-center">Why Choose Nails Design?</h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">💅</span>
            <div>
              <h3 className="text-xl font-semibold text-[#2d1b0e] mb-2">Beautiful Nails, Lasting Results</h3>
              <p className="text-[#8b7d6b] text-lg leading-relaxed">
                Walk out with head-turning nails that stay flawless for up to 2 weeks (or more). Chip-resistant finish—no constant touch-ups needed.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <span className="text-3xl">✨</span>
            <div>
              <h3 className="text-xl font-semibold text-[#2d1b0e] mb-2">Relaxing & Friendly Experience</h3>
              <p className="text-[#8b7d6b] text-lg leading-relaxed">
                This is your me-time! Our staff are warm, welcoming, and gentle. Every mani/pedi includes a complimentary hand massage.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <span className="text-3xl">🛡️</span>
            <div>
              <h3 className="text-xl font-semibold text-[#2d1b0e] mb-2">Expert Care & Hygiene</h3>
              <p className="text-[#8b7d6b] text-lg leading-relaxed">
                Our skilled techs pay great attention to detail and your nail health. We thoroughly sanitize tools and never skimp on safety.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <span className="text-3xl">🎁</span>
            <div>
              <h3 className="text-xl font-semibold text-[#2d1b0e] mb-2">Exclusive Offers</h3>
              <p className="text-[#8b7d6b] text-lg leading-relaxed">
                Enjoy birthday discounts, loyalty rewards, and seasonal specials just for you.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 