"use client";
import Link from 'next/link';
import { FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#f9f4ef] text-gray-700 border-t border-pink-100 mt-20 font-sans shadow-[0_2px_24px_0_rgba(216,180,143,0.07)]">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm md:text-base">
        {/* Brand / Intro */}
        <div>
          <img src="/logo.png" alt="Nails Design logo" className="h-16 w-auto mb-2" />
          <p className="text-gray-600 font-medium">
            London's go-to destination for luxury manicures, BIAB, and nail artistry.
          </p>
          <p className="mt-4 text-xs text-gray-400">&copy; {new Date().getFullYear()} Nails Design. All rights reserved.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 font-sans">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link href="/" aria-label="Home">Home</Link></li>
            <li><Link href="/services" aria-label="Services">Services</Link></li>
            <li><Link href="/gallery" aria-label="Gallery">Gallery</Link></li>
            <li><Link href="/booking" aria-label="Booking">Booking</Link></li>
            <li><Link href="/contact" aria-label="Contact">Contact</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 font-sans">Contact</h4>
          <ul className="space-y-2">
            <li>
              <a href="tel:02077920370" className="text-pink-600 hover:underline font-medium" aria-label="Call 020 7792 0370">
                📞 020 7792 0370
              </a>
            </li>
            <li>
              <a href="mailto:info@nailsdesign.com" className="text-pink-600 hover:underline font-medium" aria-label="Email info@nailsdesign.com">
                ✉️ info@nailsdesign.com
              </a>
            </li>
            <li>
              <a href="https://goo.gl/maps/8Qw8Qw8Qw8Qw8Qw8A" target="_blank" rel="noopener noreferrer" className="hover:underline" aria-label="View location on Google Maps">
                📍 25 Porchester Road, London W2 5DP
              </a>
            </li>
          </ul>
        </div>

        {/* Hours + Social */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 font-sans">Hours</h4>
          <ul className="space-y-1">
            <li>Mon–Sat: 10am – 7pm</li>
            <li>Sun: 11am – 5pm</li>
          </ul>

          <div className="mt-5">
            <a
              href="https://instagram.com/nailsdesignlondon"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold transition-all hover:scale-105"
              style={{ color: "#d8b48f" }}
              aria-label="Follow us on Instagram"
            >
              <FaInstagram className="text-xl" />
              Follow us on Instagram
            </a>
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          footer > div {
            grid-template-columns: 1fr !important;
            padding: 2rem 1rem !important;
          }
        }
      `}</style>
    </footer>
  );
}
