"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user")));
    setAdmin(JSON.parse(localStorage.getItem("admin")));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 60) {
        setShowHeader(true);
        setLastScrollY(window.scrollY);
        return;
      }
      if (window.scrollY > lastScrollY) {
        setShowHeader(false); // hide on scroll down
      } else {
        setShowHeader(true); // show on scroll up
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleAuthChanged = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
      setAdmin(JSON.parse(localStorage.getItem("admin")));
    };
    window.addEventListener("authChanged", handleAuthChanged);
    return () => window.removeEventListener("authChanged", handleAuthChanged);
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
    <header
      className={`
        shadow bg-white font-sans sticky top-0 z-50 transition-transform duration-300
        ${showHeader ? "translate-y-0" : "-translate-y-full"}
      `}
      style={{ willChange: "transform" }}
    >
      <div className="flex flex-wrap items-center justify-between px-8 py-3 gap-4">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Nails Design logo"
            className="h-24 w-auto object-contain drop-shadow-xl"
            style={{ maxHeight: "90px" }}
          />
        </Link>
        <nav className="flex gap-4 md:gap-7 items-center text-base font-medium flex-wrap">
          <Link href="/" className="hover:text-[#d8b48f] transition">Home</Link>
          <Link href="/services" className="hover:text-[#d8b48f] transition">Services</Link>
          <Link href="/gallery" className="hover:text-[#d8b48f] transition">Gallery</Link>
          <Link href="/booking" className="hover:text-[#d8b48f] transition">Booking</Link>
          <Link href="/contact" className="hover:text-[#d8b48f] transition">Contact</Link>
          <Link href="/testimonials" className="hover:text-[#d8b48f] transition">Testimonials</Link>
        </nav>
        <div className="flex gap-4 items-center text-base font-medium">
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
      </div>
    </header>
  );
}
