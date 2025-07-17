"use client";
import { useState } from "react";
import axios from "axios";
import { getApiUrl } from '../../../config/api';

export default function AdminRegisterPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    invite_code: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axios.post(getApiUrl('/admin/register'), form);
      setSuccess("Admin account created! You can now log in.");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    }
    setLoading(false);
  };

  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Registration</h1>
      {success && <p className="mb-4 text-green-600">{success}</p>}
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="first_name" type="text" placeholder="First Name" required className="w-full p-2 border rounded" onChange={handleChange} />
        <input name="last_name" type="text" placeholder="Last Name" required className="w-full p-2 border rounded" onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" required className="w-full p-2 border rounded" onChange={handleChange} />
        <input name="phone" type="text" placeholder="Phone" required className="w-full p-2 border rounded" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" required className="w-full p-2 border rounded" onChange={handleChange} />
        <input name="invite_code" type="text" placeholder="Invite Code" required className="w-full p-2 border rounded" onChange={handleChange} />
        <button className="w-full bg-pink-600 text-white py-2 rounded disabled:opacity-50" disabled={loading}>
          {loading ? "Registering..." : "Register as Admin"}
        </button>
      </form>
    </main>
  );
} 