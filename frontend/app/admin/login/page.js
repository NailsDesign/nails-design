"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getApiUrl } from '../../../config/api';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(getApiUrl('/admin/login'), form);
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      setError("");
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    }
  };

  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        <input name="email" type="email" placeholder="Email" required className="w-full p-2 border rounded" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" required className="w-full p-2 border rounded" onChange={handleChange} />
        <button className="w-full bg-pink-600 text-white py-2 rounded">Login</button>
      </form>
      <div className="mt-4 text-center">
        <a href="/admin/forgot-password" className="text-pink-600 hover:text-pink-800 underline text-base transition-colors">
          Forgot your password?
        </a>
      </div>
    </main>
  );
}
