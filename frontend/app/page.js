'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const heroImages = [
    '/hero1.jpg',
    '/hero2.jpg',
    '/hero3.jpg',
    '/hero4.jpg',
    '/hero5.jpg',
    '/hero6.jpg',
    '/hero7.jpg',
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f1eb] text-[#d8b48f]">

      {/* Hero Section with Background Slideshow */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {heroImages.map((src, index) => (
            <Image
              key={index}
              src={src}
              alt={`Hero background ${index + 1}`}
              fill
              className={`object-cover brightness-75 absolute transition-opacity duration-1000 ease-in-out ${
                current === index ? 'opacity-100' : 'opacity-0'
              }`}
              priority={current === index}
              quality={100}
            />
          ))}
        </div>

        <div className="relative z-10 bg-black/40 backdrop-blur-sm rounded-xl p-8 md:p-12 text-center max-w-4xl mx-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif tracking-tight">
            Gorgeous Nails That Last, Hassle-Free
          </h1>
          <p className="text-lg md:text-2xl text-beige-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Tired of manicures that chip after a few days or salons that leave you feeling rushed? You're not alone – and it doesn't have to be this way.<br /><br />
            <b>At Nails Design London, we're here to change the game:</b> enjoy beautiful, long-lasting nails without the usual salon stress.
          </p>
          <Link
            href="/booking"
            aria-label="Book your appointment"
            className="bg-[#d8b48f] hover:bg-[#c19e7e] text-white px-8 py-4 rounded-full text-lg font-medium transition-all hover:scale-105 shadow-lg animate-pulse focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            Book My Appointment
          </Link>
        </div>
      </section>

      {/* Quick problem/solution section */}
      <section className="bg-[#fef9f5] py-10 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-serif" style={{ color: "#d8b48f" }}>
            Sick of Quick Chips and Rushed Service?
          </h2>
          <p className="text-base md:text-lg text-gray-700 mb-6">
            Many London women leave nail salons disappointed – polish peeling within days, uneven shapes, or painful nicks from careless techs.
            You invest time and money for a treat, only to end up hiding your hands a week later.<br />
            All you want is to walk out with nails that look great and stay perfect for at least two weeks, and a relaxed smile on your face. Is that too much to ask?
          </p>
        </div>
      </section>

      {/* Welcome section */}
      <section className="bg-white py-14 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-shrink-0 w-full md:w-1/3">
            <Image
              src="/team-placeholder.jpg"
              alt="Friendly Nails Design technician greeting a client"
              width={350}
              height={350}
              className="rounded-lg object-cover shadow-lg"
            />
          </div>
          <div className="flex-1 text-gray-800 md:pl-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-serif" style={{ color: "#d8b48f" }}>
              Discover Nail Bliss in Bayswater
            </h2>
            <p className="mb-3">
              <b>Nails Design</b> is a cozy Bayswater studio built on one simple idea: <b>put the client first.</b> From the moment you step in, you'll notice the difference. We take the time to listen to exactly what you want – shape, color, style – and never rush your treatment.
            </p>
            <p className="mb-3">
              Our team brings <b>20+ years of experience</b> and uses only top brands like <b>OPI, CND, Essie, and Gelish</b> for quality you can trust.
            </p>
            <p className="mb-3">
              The result? Gorgeous, Instagram-worthy nails without breaking the bank. And yes – every manicure ends with a <b>free 5-minute hand massage</b> to leave you feeling pampered and stress-free.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="max-w-5xl mx-auto my-16 p-8 bg-pink-50 rounded-lg shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center font-serif" style={{ color: "#d8b48f" }}>
          Why Choose Nails Design?
        </h2>
        <ul className="grid md:grid-cols-2 gap-8 text-lg text-gray-800 font-medium">
          <li className="flex items-start gap-2">
            <span className="text-pink-500 text-2xl mt-1">💅</span>
            <span>
              <b>Beautiful Nails, Lasting Results:</b> Walk out with head-turning nails that stay flawless for up to 2 weeks (or more). Chip-resistant finish—no constant touch-ups needed.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 text-2xl mt-1">✨</span>
            <span>
              <b>Relaxing & Friendly Experience:</b> This is your me-time! Our staff are warm, welcoming, and gentle. Every mani/pedi includes a complimentary hand massage.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 text-2xl mt-1">🛡️</span>
            <span>
              <b>Expert Care & Hygiene:</b> Our skilled techs pay great attention to detail and your nail health. We thoroughly sanitize tools and never skimp on safety.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500 text-2xl mt-1">🎁</span>
            <span>
              <b>Exclusive Offers:</b> Enjoy birthday discounts, loyalty rewards, and seasonal specials just for you.
            </span>
          </li>
        </ul>
      </section>

      {/* What Our Clients Are Saying */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center font-serif" style={{ color: "#d8b48f" }}>
          What Our Clients Are Saying
        </h2>
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-lg italic mb-4">&quot;Always a pleasant and super professional and clean service. I got a pedicure and manicure (normal polish) and it was amazing. Always coming back here 🙂&quot;</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-lg italic mb-4">&quot;Great care, effort and detail taken on my BIAB gel nails! Can't wait to go back and try other colours and designs.&quot;</p>
          </div>
        </div>
      </section>

      {/* Instagram Nail Art Gallery */}
      <section className="py-16 bg-[#f0e6d9]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 font-serif" style={{ color: "#d8b48f" }}>
            Nail Art Inspiration from Our Instagram
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Replace with your own Instagram image URLs */}
            <a
              href="https://instagram.com/nailsdesignlondon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View our Instagram nail art gallery"
              className="aspect-square relative overflow-hidden rounded-lg group"
            >
              <Image
                src="/instagram1.jpg"
                alt="Instagram nail art 1"
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </a>
            <a
              href="https://instagram.com/nailsdesignlondon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View our Instagram nail art gallery"
              className="aspect-square relative overflow-hidden rounded-lg group"
            >
              <Image
                src="/instagram2.jpg"
                alt="Instagram nail art 2"
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </a>
            <a
              href="https://instagram.com/nailsdesignlondon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View our Instagram nail art gallery"
              className="aspect-square relative overflow-hidden rounded-lg group"
            >
              <Image
                src="/instagram3.jpg"
                alt="Instagram nail art 3"
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </a>
            <a
              href="https://instagram.com/nailsdesignlondon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View our Instagram nail art gallery"
              className="aspect-square relative overflow-hidden rounded-lg group"
            >
              <Image
                src="/instagram4.jpg"
                alt="Instagram nail art 4"
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </a>
          </div>
          <div className="text-center mt-8">
            <a
              href="https://instagram.com/nailsdesignlondon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              className="inline-block border-b-2 border-[#d8b48f] text-[#d8b48f] font-medium pb-1"
            >
              Follow US on Instagram &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#d8b48f] text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2
            style={{
              color: '#fff',
              textShadow: '0 0 2px #fff, 0 0 4px #e0c3a0',
              fontWeight: 'bold',
              fontFamily: 'serif',
              fontSize: '2rem', // adjust as needed
              marginBottom: '1.5rem'
            }}
          >
            Ready for Nail Bliss?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Book your appointment today and experience the difference of premium nail care—no stress, no chips, just beautiful nails!
          </p>
          <Link
            href="/booking"
            aria-label="Book your appointment now"
            className="inline-block bg-white text-[#d8b48f] px-10 py-4 rounded-full text-lg font-bold transition-all hover:scale-105 shadow-lg animate-bounce focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            Book Now
          </Link>
        </div>
      </section>
    </main>
  );
}
