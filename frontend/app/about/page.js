import React from 'react';

export default function About() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-[#2d1b0e] mb-10 tracking-tight leading-tight drop-shadow-sm">
        About Us
      </h1>
      {/* Hero/Technician Image Placeholder */}
      <section className="mb-14 flex flex-col items-center">
        <div className="w-40 h-40 sm:w-56 sm:h-56 bg-gradient-to-br from-[#f6c453]/30 to-[#d4af37]/20 rounded-3xl flex items-center justify-center shadow-lg border-2 border-dashed border-[#e6be7e] mb-6">
          <span className="text-[#d4af37] text-5xl sm:text-6xl font-bold opacity-60">👩‍🎨</span>
        </div>
        <div className="text-center max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#d4af37] mb-3">Discover Nail Bliss in Bayswater</h2>
          <p className="text-[#5d4e37] text-lg sm:text-xl leading-relaxed mb-3 font-medium">
            <span className="font-bold text-[#2d1b0e]">Nails Design</span> is a cozy Bayswater studio built on one simple idea: <span className="font-semibold">put the client first</span>. From the moment you step in, you'll notice the difference. We take the time to listen to exactly what you want – shape, color, style – and never rush your treatment.
          </p>
          <p className="text-[#8b7d6b] text-base sm:text-lg leading-relaxed mb-3">
            Our team brings <span className="font-semibold">20+ years of experience</span> and uses only top brands like <span className="font-semibold">OPI, CND, Essie, and Gelish</span> for quality you can trust.
          </p>
          <p className="text-[#8b7d6b] text-base sm:text-lg leading-relaxed">
            The result? Gorgeous, Instagram-worthy nails without breaking the bank. And yes – every manicure ends with a <span className="font-semibold">free 5-minute hand massage</span> to leave you feeling pampered and stress-free.
          </p>
        </div>
      </section>

      {/* Divider for section separation */}
      <div className="w-full flex justify-center mb-14">
        <div className="h-1 w-24 bg-gradient-to-r from-[#f6c453] via-[#e6be7e] to-[#d4af37] rounded-full opacity-60" />
      </div>

      <section className="mb-10 bg-gradient-to-br from-[#fff8e1] to-[#fdf6ed] rounded-2xl shadow-xl p-6 sm:p-10 border border-[#f3e5ab]">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#d4af37] mb-8 text-center tracking-tight">Why Choose Nails Design?</h2>
        <div className="space-y-8 divide-y divide-[#f6c453]/30">
          <div className="flex flex-col sm:flex-row items-start gap-4 pt-0">
            <span className="text-3xl sm:text-4xl mt-1">💅</span>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2d1b0e] mb-1">Beautiful Nails, Lasting Results</h3>
              <p className="text-[#5d4e37] text-base sm:text-lg leading-relaxed">
                Walk out with head-turning nails that stay flawless for up to 2 weeks (or more). Chip-resistant finish—no constant touch-ups needed.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start gap-4 pt-8">
            <span className="text-3xl sm:text-4xl mt-1">✨</span>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2d1b0e] mb-1">Relaxing & Friendly Experience</h3>
              <p className="text-[#5d4e37] text-base sm:text-lg leading-relaxed">
                This is your me-time! Our staff are warm, welcoming, and gentle. Every mani/pedi includes a complimentary hand massage.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start gap-4 pt-8">
            <span className="text-3xl sm:text-4xl mt-1">🛡️</span>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2d1b0e] mb-1">Expert Care & Hygiene</h3>
              <p className="text-[#5d4e37] text-base sm:text-lg leading-relaxed">
                Our skilled techs pay great attention to detail and your nail health. We thoroughly sanitize tools and never skimp on safety.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start gap-4 pt-8">
            <span className="text-3xl sm:text-4xl mt-1">🎁</span>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2d1b0e] mb-1">Exclusive Offers</h3>
              <p className="text-[#5d4e37] text-base sm:text-lg leading-relaxed">
                Enjoy birthday discounts, loyalty rewards, and seasonal specials just for you.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 