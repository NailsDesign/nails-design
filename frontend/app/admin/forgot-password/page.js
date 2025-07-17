"use client";
import { useState } from "react";
import axios from "axios";
import { getApiUrl } from '../../../config/api';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post(getApiUrl('/admin/forgot-password'), { email });
      setMessage("If your email exists, check your inbox for reset instructions.");
    } catch (err) {
      setError("If your email exists, check your inbox for reset instructions.");
    }
    setLoading(false);
  };

  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Forgot Password</h1>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter your admin email"
          type="email"
          required
        />
        <button
          className="w-full bg-pink-600 text-white py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </main>
  );
} 