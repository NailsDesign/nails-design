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
    <main className="min-h-screen bg-[#F8F6F2] text-[#8B2635]">

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

        <div className="relative z-10 bg-black/60 backdrop-blur-md p-10 md:p-16 text-center max-w-5xl mx-6 border border-[#D4A574]/30 shadow-2xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 font-serif tracking-tight leading-tight">
            Gorgeous Nails That Last, 
            <span className="block text-[#D4A574]">Hassle-Free</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#F8F6F2] mb-10 max-w-3xl mx-auto leading-relaxed">
            Tired of manicures that chip after a few days or salons that leave you feeling rushed? You're not alone – and it doesn't have to be this way.<br /><br />
            <b>At Nails Design London, we're here to change the game:</b> enjoy beautiful, long-lasting nails without the usual salon stress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/booking"
              aria-label="Book your appointment"
              className="bg-[#8B2635] hover:bg-[#6B1E2A] text-white px-12 py-5 text-xl font-bold transition-all hover:scale-105 shadow-2xl border-2 border-[#D4A574]/50 focus:outline-none focus:ring-4 focus:ring-[#D4A574]/50 min-w-[280px]"
            >
              Book My Appointment
            </Link>
            <Link
              href="/services"
              aria-label="View our services"
              className="bg-transparent hover:bg-white/10 text-white border-2 border-white px-12 py-5 text-xl font-medium transition-all hover:scale-105 min-w-[280px]"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section - Enhanced */}
      <section className="py-24 bg-white">
        <div className="px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 font-serif text-[#8B2635]">
              Sick of Quick Chips and Rushed Service?
            </h2>
            <div className="w-24 h-1 bg-[#D4A574] mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-[#6B5B47] max-w-4xl mx-auto leading-relaxed">
              Many London women leave nail salons disappointed – polish peeling within days, uneven shapes, or painful nicks from careless techs.
              You invest time and money for a treat, only to end up hiding your hands a week later.<br /><br />
              All you want is to walk out with nails that look great and stay perfect for at least two weeks, and a relaxed smile on your face. Is that too much to ask?
            </p>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-8 bg-[#F8F6F2] shadow-lg border border-[#D4A574]/20 rounded-none">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-2xl font-bold text-[#8B2635] mb-2">4.9/5 Rating</h3>
              <p className="text-[#6B5B47]">From 500+ happy clients</p>
            </div>
            <div className="text-center p-8 bg-[#F8F6F2] shadow-lg border border-[#D4A574]/20 rounded-none">
              <div className="text-4xl mb-4">💅</div>
              <h3 className="text-2xl font-bold text-[#8B2635] mb-2">20+ Years Experience</h3>
              <p className="text-[#6B5B47]">Expert nail technicians</p>
            </div>
            <div className="text-center p-8 bg-[#F8F6F2] shadow-lg border border-[#D4A574]/20 rounded-none">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold text-[#8B2635] mb-2">Free Hand Massage</h3>
              <p className="text-[#6B5B47]">With every treatment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Enhanced */}
      <section className="py-24 bg-[#F8F6F2]">
        <div className="px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-serif text-[#8B2635]">
              What Our Clients Are Saying
            </h2>
            <div className="w-24 h-1 bg-[#D4A574] mx-auto mb-8"></div>
            <p className="text-xl text-[#6B5B47] max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied clients
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-10 shadow-xl border border-[#D4A574]/20 hover:shadow-2xl transition-all duration-300 rounded-none">
              <div className="flex items-center mb-6">
                <div className="flex text-2xl mr-4">
                  <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
                </div>
                <span className="text-[#D4A574] font-semibold">5.0</span>
              </div>
              <p className="text-xl italic mb-6 text-[#6B5B47] leading-relaxed">
                "Always a pleasant and super professional and clean service. I got a pedicure and manicure (normal polish) and it was amazing. Always coming back here 🙂"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#D4A574] flex items-center justify-center text-white font-bold mr-4 rounded-none">
                  SM
                </div>
                <div>
                  <p className="font-semibold text-[#8B2635]">Sarah Mitchell</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-10 shadow-xl border border-[#D4A574]/20 hover:shadow-2xl transition-all duration-300 rounded-none">
              <div className="flex items-center mb-6">
                <div className="flex text-2xl mr-4">
                  <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
                </div>
                <span className="text-[#D4A574] font-semibold">5.0</span>
              </div>
              <p className="text-xl italic mb-6 text-[#6B5B47] leading-relaxed">
                "Great care, effort and detail taken on my BIAB gel nails! Can't wait to go back and try other colours and designs."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#D4A574] flex items-center justify-center text-white font-bold mr-4 rounded-none">
                  EL
                </div>
                <div>
                  <p className="font-semibold text-[#8B2635]">Emma Lawson</p>
             
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section - Enhanced */}
      <section className="py-24 bg-white">
        <div className="px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-serif text-[#8B2635]">
              Nail Art Inspiration
            </h2>
            <div className="w-24 h-1 bg-[#D4A574] mx-auto mb-8"></div>
            <p className="text-xl text-[#6B5B47] max-w-2xl mx-auto">
              From Our Instagram Gallery - Follow us for daily inspiration
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <a
              href="https://instagram.com/nailsdesignlondon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View our Instagram nail art gallery"
              className="aspect-square relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500 rounded-none"
            >
              <Image
                src="/instagram1.jpg"
                alt="Instagram nail art 1"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#8B2635]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm font-medium">View on Instagram</span>
              </div>
            </a>
            <a
              href="https://instagram.com/nailsdesignlondon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View our Instagram nail art gallery"
              className="aspect-square relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500 rounded-none"
            >
              <Image
                src="/instagram2.jpg"
                alt="Instagram nail art 2"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#8B2635]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm font-medium">View on Instagram</span>
              </div>
            </a>
            <a
              href="https://instagram.com/nailsdesignlondon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View our Instagram nail art gallery"
              className="aspect-square relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500 rounded-none"
            >
              <Image
                src="/instagram3.jpg"
                alt="Instagram nail art 3"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#8B2635]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm font-medium">View on Instagram</span>
              </div>
            </a>
            <a
              href="https://instagram.com/nailsdesignlondon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View our Instagram nail art gallery"
              className="aspect-square relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500 rounded-none"
            >
              <Image
                src="/instagram4.jpg"
                alt="Instagram nail art 4"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#8B2635]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm font-medium">View on Instagram</span>
              </div>
            </a>
          </div>
          
          <div className="text-center mt-16">
            <a
              href="https://instagram.com/nailsdesignlondon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              className="inline-flex items-center gap-3 bg-[#8B2635] text-white px-10 py-4 font-semibold hover:bg-[#6B1E2A] transition-colors duration-300 shadow-xl hover:shadow-2xl text-lg rounded-none"
            >
              <span>Follow Us on Instagram</span>
              <span className="text-2xl">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-32 bg-[#8B2635] text-white relative">
        <div className="text-center px-6 md:px-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 font-serif">
            Ready for Nail Bliss?
          </h2>
          <p className="text-2xl md:text-3xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{ color: '#6B5B47' }}>
            Book your appointment today and experience the difference of premium nail care—no stress, no chips, just beautiful nails!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/booking"
              aria-label="Book your appointment now"
              className="bg-[#F8F6F2] text-[#8B2635] px-16 py-6 text-2xl font-bold transition-all hover:scale-105 shadow-2xl border-2 border-[#D4A574] hover:border-[#D4A574]/80 focus:outline-none focus:ring-4 focus:ring-[#D4A574]/50 min-w-[320px] rounded-none"
            >
              Book Now
            </Link>
            <Link
              href="/contact"
              aria-label="Contact us"
              className="bg-[#D4A574] hover:bg-[#B8945A] text-[#8B2635] border-2 border-[#D4A574] px-16 py-6 text-2xl font-bold transition-all hover:scale-105 min-w-[320px] shadow-2xl rounded-none"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
