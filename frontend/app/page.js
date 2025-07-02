'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Home() {
  const heroImages = [
    "/hero1.jpg",
    "/hero2.jpg",
    "/hero3.jpg",
    "/hero4.jpg",
    "/hero5.jpg",
    "/hero6.jpg",
    "/hero7.jpg",
    "/hero8.jpg",
    "/hero9.jpg",
    "/hero10.jpg"
  ];

  const heroTexts = [
    {
      heading: "Gorgeous Nails That Last",
      subheading: "Hassle-Free, Every Time",
      cta1: { text: "Book My Appointment", href: "/booking" },
      cta2: { text: "View Services", href: "/services" }
    },
    {
      heading: "London's Most Trusted Nail Salon",
      subheading: "Experience the Difference",
      cta1: { text: "Find us!", href: "/contact" },
      cta2: { text: "See Gallery", href: "/gallery" }
    },
    {
      heading: "Look Good. Feel Better.",
      subheading: "Register now for promo codes and special birthday discounts—treat yourself to something extra every visit.",
      cta1: { text: "Register Now", href: "/register" }

    }
  ];

  const heroSlides = heroImages.map((img, idx) => {
    const textIdx = idx % heroTexts.length;
    return {
      image: img,
      ...heroTexts[textIdx]
    };
  });

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fef9f5] to-[#faf6f0] text-[#2d1b0e]">
      {/* Hero Slider Section - Townhouse Style */}
      <section className="relative h-[90vh] w-full overflow-hidden">
        <Slider
          dots={true}
          infinite={true}
          speed={800}
          fade={true}
          autoplay={true}
          autoplaySpeed={5000}
          arrows={false}
          pauseOnHover={false}
          slidesToShow={1}
          slidesToScroll={1}
        >
          {heroSlides.map((slide, idx) => (
            <div key={idx} className="relative h-[90vh] w-full">
              <Image
                src={slide.image}
                alt={slide.heading}
                fill
                className="object-cover w-full h-full"
                priority={idx === 0}
              />
              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60 z-10" />
              {/* Centered text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 px-4">
                <h1 className="text-4xl md:text-6xl font-bold font-serif text-white mb-4 drop-shadow-lg">
                  {slide.heading}
                </h1>
                <p className="text-lg md:text-2xl text-white mb-8 font-sans drop-shadow">
                  {slide.subheading}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={slide.cta1.href}
                    className="btn-primary px-8 py-4 text-lg"
                  >
                    {slide.cta1.text}
                  </Link>
                  {slide.cta2 && (
                    <Link
                      href={slide.cta2.href}
                      className="btn-secondary px-8 py-4 text-lg"
                    >
                      {slide.cta2.text}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Problem/Solution Section - Enhanced */}
      <section className="py-24 bg-white border-b border-[#e8dcc0]">
        <div className="px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 font-serif text-[#2d1b0e]">
              Sick of Quick Chips and Rushed Service?
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#d4af37] to-[#b87333] mx-auto mb-8 rounded-full"></div>
            <p className="text-xl md:text-2xl text-[#5d4e37] max-w-4xl mx-auto leading-relaxed">
              Many London women leave nail salons disappointed – polish peeling within days, uneven shapes, or painful nicks from careless techs.
              You invest time and money for a treat, only to end up hiding your hands a week later.<br /><br />
              All you want is to walk out with nails that look great and stay perfect for at least two weeks, and a relaxed smile on your face. Is that too much to ask?
            </p>
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-16 bg-[#faf6f0] border-b border-[#e8dcc0]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="service-card text-center p-8">
              <div className="text-4xl mb-2">⭐</div>
              <h3 className="text-2xl font-bold text-[#d4af37] mb-1 font-serif">4.9/5 Rating</h3>
              <p className="text-[#5d4e37]">From 500+ happy clients</p>
            </div>
            <div className="service-card text-center p-8">
              <div className="text-4xl mb-2">💅</div>
              <h3 className="text-2xl font-bold text-[#d4af37] mb-1 font-serif">20+ Years Experience</h3>
              <p className="text-[#5d4e37]">Expert nail technicians</p>
            </div>
            <div className="service-card text-center p-8">
              <div className="text-4xl mb-2">🎁</div>
              <h3 className="text-2xl font-bold text-[#d4af37] mb-1 font-serif">Free Hand Massage</h3>
              <p className="text-[#5d4e37]">With every treatment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Premium Card Style */}
      <section className="py-24 bg-gradient-to-br from-[#faf6f0] to-[#fef9f5] border-b border-[#e8dcc0]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#2d1b0e] mb-4">What Our Clients Are Saying</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#d4af37] to-[#b87333] mx-auto mb-6 rounded-full"></div>
            <p className="text-lg text-[#5d4e37] max-w-2xl mx-auto font-sans">
              Don't just take our word for it - hear from our satisfied clients
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="testimonial-card">
              <div className="flex items-center mb-4">
                <div className="flex text-2xl mr-3 text-[#d4af37]">
                  <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
                </div>
                <span className="text-[#d4af37] font-semibold">5.0</span>
              </div>
              <p className="text-lg italic mb-4 text-[#5d4e37] leading-relaxed">
                "Always a pleasant and super professional and clean service. I got a pedicure and manicure (normal polish) and it was amazing. Always coming back here 🙂"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#d4af37] flex items-center justify-center text-white font-bold mr-4 rounded-full">
                  SM
                </div>
                <div>
                  <p className="font-semibold text-[#2d1b0e]">Sarah Mitchell</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="flex items-center mb-4">
                <div className="flex text-2xl mr-3 text-[#d4af37]">
                  <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
                </div>
                <span className="text-[#d4af37] font-semibold">5.0</span>
              </div>
              <p className="text-lg italic mb-4 text-[#5d4e37] leading-relaxed">
                "Great care, effort and detail taken on my BIAB gel nails! Can't wait to go back and try other colours and designs."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#d4af37] flex items-center justify-center text-white font-bold mr-4 rounded-full">
                  EL
                </div>
                <div>
                  <p className="font-semibold text-[#2d1b0e]">Emma Lawson</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section - Premium Style */}
      <section className="py-24 bg-white border-b border-[#e8dcc0]">
        <div className="px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#2d1b0e] mb-4">Nail Art Inspiration</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#d4af37] to-[#b87333] mx-auto mb-6 rounded-full"></div>
            <p className="text-lg text-[#5d4e37] max-w-2xl mx-auto font-sans">
              From Our Instagram Gallery - Follow us for daily inspiration
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1,2,3,4].map(i => (
              <a
                key={i}
                href="https://instagram.com/nailsdesignlondon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View our Instagram nail art gallery"
                className="aspect-square relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500 rounded-xl border-2 border-[#d4af37]"
              >
                <Image
                  src={`/instagram${i}.jpg`}
                  alt={`Instagram nail art ${i}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#d4af37]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm font-medium">View on Instagram</span>
                </div>
              </a>
            ))}
          </div>
          <div className="text-center mt-16">
            <a
              href="https://instagram.com/nailsdesignlondon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              className="btn-primary inline-flex items-center gap-3 px-10 py-4 text-lg mt-4"
            >
              <span>Follow Us on Instagram</span>
              <span className="text-2xl">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section - Premium Style */}
      <section className="py-32 bg-gradient-to-br from-[#d4af37]/10 to-[#b87333]/10 text-[#2d1b0e] relative">
        <div className="text-center px-6 md:px-12">
          <h2 className="text-5xl md:text-6xl font-bold font-serif mb-8">
            Ready for Nail Bliss?
          </h2>
          <p className="text-2xl md:text-3xl mb-12 max-w-3xl mx-auto leading-relaxed text-[#5d4e37]">
            Book your appointment today and experience the difference of premium nail care—no stress, no chips, just beautiful nails!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/booking"
              aria-label="Book your appointment now"
              className="btn-primary px-16 py-6 text-2xl min-w-[320px]"
            >
              Book Now
            </Link>
            <Link
              href="/contact"
              aria-label="Contact us"
              className="btn-secondary px-16 py-6 text-2xl min-w-[320px]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
