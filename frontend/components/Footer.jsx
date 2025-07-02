"use client";
import Link from 'next/link';
import { FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#f9f4ef] text-gray-700 border-t border-pink-100 font-sans shadow-[0_2px_24px_0_rgba(216,180,143,0.07)]">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-6 text-xs md:text-sm justify-items-center text-center">
        {/* Brand / Intro */}
        <div>
          <div className="hidden sm:block mb-2 text-center w-full">
            <h1 className="font-bold text-[#2d1b0e] font-['Playfair_Display'] leading-tight text-center" style={{ fontSize: '35px', marginLeft: '2px' }}>Nails Design</h1>
            <p className="text-xs text-[#8b7d6b] font-medium text-center ml-[4px]">London</p>
          </div>
          {/* <img src="/logo.png" alt="Nails Design logo" className="h-12 w-auto mb-2" /> */}
          <p className="text-gray-600 font-medium text-xs">
            London's go-to destination for luxury manicures, BIAB, and nail artistry.
          </p>
          <p className="mt-3 text-xs text-gray-400">&copy; {new Date().getFullYear()} Nails Design. All rights reserved.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-2 font-sans">Quick Links</h4>
          <ul className="space-y-1">
            <li><Link href="/" aria-label="Home" className="text-xs">Home</Link></li>
            <li><Link href="/services" aria-label="Services" className="text-xs">Services</Link></li>
            <li><Link href="/gallery" aria-label="Gallery" className="text-xs">Gallery</Link></li>
            <li><Link href="/booking" aria-label="Booking" className="text-xs">Booking</Link></li>
            <li><Link href="/contact" aria-label="Contact" className="text-xs">Contact</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-2 font-sans">Contact</h4>
          <ul className="space-y-1">
            <li>
              <a href="tel:02077920370" className="text-pink-600 hover:underline font-medium text-xs" aria-label="Call 020 7792 0370">
                📞 020 7792 0370
              </a>
            </li>
            <li>
              <a href="mailto:info@nailsdesign.com" className="text-pink-600 hover:underline font-medium text-xs" aria-label="Email info@nailsdesign.com">
                ✉️ info@nailsdesign.com
              </a>
            </li>
            <li>
              <a href="https://goo.gl/maps/8Qw8Qw8Qw8Qw8Qw8A" target="_blank" rel="noopener noreferrer" className="hover:underline text-xs" aria-label="View location on Google Maps">
                📍 25 Porchester Road, London W2 5DP
              </a>
            </li>
          </ul>
        </div>

        {/* Hours + Social */}
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-2 font-sans">Hours</h4>
          <ul className="space-y-1 text-xs">
            <li>Mon–Sat: 10am – 7pm</li>
            <li>Sun: 11am – 5:30pm</li>
          </ul>

          <div className="mt-3">
            <a
              href="https://instagram.com/nailsdesignlondon"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold transition-all hover:scale-105 text-xs"
              style={{ color: "#d8b48f" }}
              aria-label="Follow us on Instagram"
            >
              <FaInstagram className="text-lg" />
              Follow us on Instagram
            </a>
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          footer > div {
            grid-template-columns: 1fr !important;
            padding: 1.5rem 1rem !important;
          }
        }
      `}</style>
    </footer>
  );
}
