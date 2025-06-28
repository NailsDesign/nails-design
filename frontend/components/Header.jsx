"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user")));
    setAdmin(JSON.parse(localStorage.getItem("admin")));
  }, []);

  useEffect(() => {
    const handleAuthChanged = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
      setAdmin(JSON.parse(localStorage.getItem("admin")));
    };
    window.addEventListener("authChanged", handleAuthChanged);
    return () => window.removeEventListener("authChanged", handleAuthChanged);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const adminLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    setAdmin(null);
    window.location.href = "/admin/login";
  };

  return (
    <header className="shadow bg-white font-sans sticky top-0 z-50">
      <div className="flex flex-wrap items-center justify-between px-8 py-3 gap-4">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Nails Design logo"
            className="h-24 w-auto object-contain drop-shadow-xl"
            style={{ maxHeight: "90px" }}
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4 md:gap-7 items-center text-base font-medium flex-wrap">
          <Link href="/" className="hover:text-[#d8b48f] transition">Home</Link>
          <Link href="/services" className="hover:text-[#d8b48f] transition">Services</Link>
          <Link href="/gallery" className="hover:text-[#d8b48f] transition">Gallery</Link>
          <Link href="/booking" className="hover:text-[#d8b48f] transition">Booking</Link>
          <Link href="/contact" className="hover:text-[#d8b48f] transition">Contact</Link>
          <Link href="/testimonials" className="hover:text-[#d8b48f] transition">Testimonials</Link>
        </nav>

        {/* Desktop User Actions */}
        <div className="hidden md:flex gap-4 items-center text-base font-medium">
          {admin ? (
            <>
              <Link href="/admin/dashboard" className="text-pink-700 font-semibold">Admin Dashboard</Link>
              <button className="text-pink-600 underline" onClick={adminLogout}>Admin Logout</button>
            </>
          ) : user ? (
            <>
              <span className="text-gray-900 font-semibold">MY ACCOUNT {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name || user.name || ''}</span>
              <span className="mx-2">|</span>
              <button className="text-pink-600 underline font-semibold" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-[#d8b48f]">Login</Link>
              <Link href="/register" className="hover:text-[#d8b48f]">Register</Link>
              <Link href="/admin/login" className="text-pink-700 font-semibold hover:text-[#d8b48f]">Admin Login</Link>
            </>
          )}
        </div>

        {/* Mobile Dropdown Button */}
        <div className="md:hidden dropdown-container relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {/* Navigation Links */}
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Navigation</div>
                <Link 
                  href="/" 
                  className="block py-2 px-2 text-gray-700 hover:bg-gray-50 hover:text-[#d8b48f] transition rounded"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/services" 
                  className="block py-2 px-2 text-gray-700 hover:bg-gray-50 hover:text-[#d8b48f] transition rounded"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Services
                </Link>
                <Link 
                  href="/gallery" 
                  className="block py-2 px-2 text-gray-700 hover:bg-gray-50 hover:text-[#d8b48f] transition rounded"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Gallery
                </Link>
                <Link 
                  href="/booking" 
                  className="block py-2 px-2 text-gray-700 hover:bg-gray-50 hover:text-[#d8b48f] transition rounded"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Booking
                </Link>
                <Link 
                  href="/contact" 
                  className="block py-2 px-2 text-gray-700 hover:bg-gray-50 hover:text-[#d8b48f] transition rounded"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Contact
                </Link>
                <Link 
                  href="/testimonials" 
                  className="block py-2 px-2 text-gray-700 hover:bg-gray-50 hover:text-[#d8b48f] transition rounded"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Testimonials
                </Link>
              </div>

              {/* User Actions */}
              <div className="px-4 py-2">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Account</div>
                {admin ? (
                  <>
                    <Link 
                      href="/admin/dashboard" 
                      className="block py-2 px-2 text-pink-700 font-semibold hover:bg-gray-50 transition rounded"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <button 
                      className="block w-full text-left py-2 px-2 text-pink-600 underline hover:bg-gray-50 transition rounded"
                      onClick={() => {
                        adminLogout();
                        setIsDropdownOpen(false);
                      }}
                    >
                      Admin Logout
                    </button>
                  </>
                ) : user ? (
                  <>
                    <div className="py-2 px-2 text-gray-900 font-semibold text-sm">
                      MY ACCOUNT {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name || user.name || ''}
                    </div>
                    <button 
                      className="block w-full text-left py-2 px-2 text-pink-600 underline font-semibold hover:bg-gray-50 transition rounded"
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="block py-2 px-2 text-gray-700 hover:bg-gray-50 hover:text-[#d8b48f] transition rounded"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className="block py-2 px-2 text-gray-700 hover:bg-gray-50 hover:text-[#d8b48f] transition rounded"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Register
                    </Link>
                    <Link 
                      href="/admin/login" 
                      className="block py-2 px-2 text-pink-700 font-semibold hover:bg-gray-50 hover:text-[#d8b48f] transition rounded"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Admin Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
