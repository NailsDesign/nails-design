"use client"; // ✅ Add this line at the top

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Nav() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user")));
  }, []);

  return (
    <nav className="flex gap-4 p-4 bg-pink-50">
      <Link href="/">Home</Link>
      <Link href="/booking">Book</Link>
      {user ? (
        <>
          <Link href="/dashboard">Dashboard</Link>
          <span>Hi, {user.name.split(" ")[0]}</span>
        </>
      ) : (
        <>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
