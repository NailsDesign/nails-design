"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Nav() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setAdmin(JSON.parse(localStorage.getItem("admin")));
    setUser(JSON.parse(localStorage.getItem("user")));
  }, []);

  const adminLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    setAdmin(null);
    router.push("/admin/login");
  };

  const userLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="flex gap-4 p-4 bg-pink-50 font-sans shadow-md">
      <Link href="/" className="hover:text-[#d8b48f] transition">Home</Link>
      <Link href="/booking" className="hover:text-[#d8b48f] transition">Book</Link>
      {admin ? (
        <>
          <Link href="/admin/dashboard">Admin Dashboard</Link>
          <span className="text-gray-500">Admin: {admin.name}</span>
          <button className="text-pink-600 underline" onClick={adminLogout}>Admin Logout</button>
        </>
      ) : user ? (
        <>
          <Link href="/dashboard" className="hover:text-[#d8b48f]">My Dashboard</Link>
          <span className="text-gray-500">Hi, {user.name.split(" ")[0]}</span>
          <button className="text-pink-600 underline" onClick={userLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link href="/login" className="hover:text-[#d8b48f]">Login</Link>
          <Link href="/register" className="hover:text-[#d8b48f]">Register</Link>
          <Link href="/admin/login" className="ml-6 text-pink-700 font-semibold hover:text-[#d8b48f]">Admin Login</Link>
        </>
      )}
    </nav>
  );
}
