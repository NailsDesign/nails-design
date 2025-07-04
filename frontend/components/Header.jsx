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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e8dcc0] shadow-sm">
      <div className="w-full flex items-center justify-between px-0 py-2 gap-4 relative">
        {/* Left: Logo - Desktop */}
        <div className="flex items-center gap-2 flex-shrink-0 pl-0">
          <Link href="/" className="flex flex-col items-start group">
            <div className="hidden sm:block">
              <h1 className="font-bold text-[#2d1b0e] font-['Playfair_Display'] leading-tight text-left" style={{ fontSize: '35px', marginLeft: '2px' }}>Nails Design</h1>
              <p className="text-xs text-[#8b7d6b] font-medium text-left ml-[4px]">London</p>
            </div>
            {/* Mobile Logo/Title */}
            <div className="sm:hidden flex flex-col items-start">
              <span className="font-extrabold text-[#2d1b0e] text-lg leading-tight tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Nails Design</span>
              <span className="text-xs text-[#b87333] font-semibold leading-none ml-[1px]">London</span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden lg:flex gap-6 items-center absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="text-sm text-[#5d4e37] hover:text-[#d4af37] transition-colors duration-300 font-medium relative group">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#d4af37] to-[#b87333] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/about" className="text-sm text-[#5d4e37] hover:text-[#d4af37] transition-colors duration-300 font-medium relative group">
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#d4af37] to-[#b87333] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/services" className="text-sm text-[#5d4e37] hover:text-[#d4af37] transition-colors duration-300 font-medium relative group">
            Services
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#d4af37] to-[#b87333] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/gallery" className="text-sm text-[#5d4e37] hover:text-[#d4af37] transition-colors duration-300 font-medium relative group">
            Gallery
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#d4af37] to-[#b87333] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/booking" className="text-sm text-[#5d4e37] hover:text-[#d4af37] transition-colors duration-300 font-medium relative group">
            Booking
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#d4af37] to-[#b87333] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/contact" className="text-sm text-[#5d4e37] hover:text-[#d4af37] transition-colors duration-300 font-medium relative group">
            Contact
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#d4af37] to-[#b87333] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/testimonials" className="text-sm text-[#5d4e37] hover:text-[#d4af37] transition-colors duration-300 font-medium relative group">
            Reviews
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#d4af37] to-[#b87333] transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        {/* Right: User Actions and Book Now Button */}
        <div className="hidden lg:flex items-center gap-3 pr-0">
          {admin ? (
            <>
              <Link href="/admin/dashboard" className="text-[#b87333] font-semibold hover:text-[#d4af37] transition-colors duration-300">Admin Dashboard</Link>
              <button 
                className="text-[#b87333] underline hover:text-[#d4af37] transition-colors duration-300 font-medium" 
                onClick={adminLogout}
              >
                Admin Logout
              </button>
            </>
          ) : user ? (
            <>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-[#2d1b0e] font-semibold">
                    Welcome back, {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name || user.name || 'Guest'}
                  </div>
                  <div className="text-xs text-[#8b7d6b]">Ready for your next appointment?</div>
                </div>
                <button 
                  className="text-xs text-[#b87333] underline hover:text-[#d4af37] transition-colors duration-300 font-medium" 
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-[#5d4e37] hover:text-[#d4af37] transition-colors duration-300 font-medium">Login</Link>
              <Link href="/register" className="text-sm text-[#5d4e37] hover:text-[#d4af37] transition-colors duration-300 font-medium">Register</Link>
            </>
          )}
          <Link 
            href="/booking" 
            className="btn-primary text-xs px-3 py-1 ml-3"
          >
            Book Now
          </Link>
        </div>

        {/* Desktop User Actions - now only login/register, not Book Now */}
        <div className="hidden lg:flex gap-3 items-center absolute left-1/2 -translate-x-1/2" style={{display:'none'}}>
          {/* This is hidden, Book Now is now always on the right */}
        </div>

        {/* Mobile Dropdown Button - Enhanced design */}
        <div className="lg:hidden dropdown-container relative flex-shrink-0">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-[#fef9f5] to-[#faf6f0] hover:from-[#faf6f0] hover:to-[#f5f0e8] transition-all duration-300 border border-[#e8dcc0] shadow-sm"
            aria-label="Menu"
          >
            <svg
              className={`w-5 h-5 text-[#5d4e37] transition-transform duration-300 ${isDropdownOpen ? 'rotate-90' : ''}`}
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

          {/* Enhanced Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-[#e8dcc0] py-4 z-50 max-h-[85vh] overflow-y-auto">
              {/* Navigation Links */}
              <div className="px-6 py-3 border-b border-[#e8dcc0]/50">
                <div className="text-sm font-semibold text-[#8b7d6b] uppercase tracking-wide mb-3">Navigation</div>
                <div className="space-y-2">
                  <Link 
                    href="/" 
                    className="flex items-center py-3 px-3 text-[#5d4e37] hover:bg-[#fef9f5] hover:text-[#d4af37] transition-all duration-300 rounded-xl font-medium"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="mr-3">🏠</span>
                    Home
                  </Link>
                  <Link 
                    href="/about" 
                    className="flex items-center py-3 px-3 text-[#5d4e37] hover:bg-[#fef9f5] hover:text-[#d4af37] transition-all duration-300 rounded-xl font-medium"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="mr-3">ℹ️</span>
                    About
                  </Link>
                  <Link 
                    href="/services" 
                    className="flex items-center py-3 px-3 text-[#5d4e37] hover:bg-[#fef9f5] hover:text-[#d4af37] transition-all duration-300 rounded-xl font-medium"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="mr-3">💅</span>
                    Services
                  </Link>
                  <Link 
                    href="/gallery" 
                    className="flex items-center py-3 px-3 text-[#5d4e37] hover:bg-[#fef9f5] hover:text-[#d4af37] transition-all duration-300 rounded-xl font-medium"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="mr-3">✨</span>
                    Gallery
                  </Link>
                  <Link 
                    href="/booking" 
                    className="flex items-center py-3 px-3 text-[#5d4e37] hover:bg-[#fef9f5] hover:text-[#d4af37] transition-all duration-300 rounded-xl font-medium"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="mr-3">📅</span>
                    Booking
                  </Link>
                  <Link 
                    href="/contact" 
                    className="flex items-center py-3 px-3 text-[#5d4e37] hover:bg-[#fef9f5] hover:text-[#d4af37] transition-all duration-300 rounded-xl font-medium"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="mr-3">📞</span>
                    Contact
                  </Link>
                  <Link 
                    href="/testimonials" 
                    className="flex items-center py-3 px-3 text-[#5d4e37] hover:bg-[#fef9f5] hover:text-[#d4af37] transition-all duration-300 rounded-xl font-medium"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span className="mr-3">⭐</span>
                    Reviews
                  </Link>
                </div>
              </div>

              {/* User Actions */}
              <div className="px-6 py-3">
                <div className="text-sm font-semibold text-[#8b7d6b] uppercase tracking-wide mb-3">Account</div>
                {admin ? (
                  <div className="space-y-2">
                    <Link 
                      href="/admin/dashboard" 
                      className="flex items-center py-3 px-3 text-[#b87333] font-semibold hover:bg-[#fef9f5] transition-all duration-300 rounded-xl"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="mr-3">👑</span>
                      Admin Dashboard
                    </Link>
                    <button 
                      className="flex items-center w-full py-3 px-3 text-[#b87333] underline hover:bg-[#fef9f5] transition-all duration-300 rounded-xl font-medium"
                      onClick={() => {
                        adminLogout();
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span className="mr-3">🚪</span>
                      Admin Logout
                    </button>
                  </div>
                ) : user ? (
                  <div className="space-y-3">
                    <div className="py-3 px-3 bg-gradient-to-r from-[#fef9f5] to-[#faf6f0] rounded-xl border border-[#e8dcc0]/50">
                      <div className="text-sm text-[#2d1b0e] font-semibold">
                        Welcome back, {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name || user.name || 'Guest'}
                      </div>
                      <div className="text-xs text-[#8b7d6b] mt-1">Ready for your next appointment?</div>
                    </div>
                    <button 
                      className="flex items-center w-full py-3 px-3 text-[#b87333] underline hover:bg-[#fef9f5] transition-all duration-300 rounded-xl font-medium"
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span className="mr-3">🚪</span>
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link 
                      href="/login" 
                      className="flex items-center py-3 px-3 text-[#5d4e37] hover:bg-[#fef9f5] hover:text-[#d4af37] transition-all duration-300 rounded-xl font-medium"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="mr-3">🔑</span>
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className="flex items-center py-3 px-3 text-[#5d4e37] hover:bg-[#fef9f5] hover:text-[#d4af37] transition-all duration-300 rounded-xl font-medium"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="mr-3">📝</span>
                      Register
                    </Link>
                    <Link 
                      href="/admin/login" 
                      className="flex items-center py-3 px-3 text-[#b87333] font-semibold hover:bg-[#fef9f5] transition-all duration-300 rounded-xl"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="mr-3">👑</span>
                      Admin Login
                    </Link>
                    <div className="pt-2">
                      <Link 
                        href="/booking" 
                        className="btn-primary w-full text-center py-3 px-4 text-sm"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Book Your Appointment
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
