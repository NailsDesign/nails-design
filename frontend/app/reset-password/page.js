"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { getApiUrl } from '../../config/api';

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post(getApiUrl('/customers/reset-password'), { token, password });
      setMessage("Password reset! You can now log in.");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <main className="max-w-md mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
        <p className="text-red-600">Invalid or missing token.</p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      {error && <p className="mb-4 text-red-600">{error}</p>}
      {!message && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            className="w-full p-2 border rounded"
            placeholder="New Password"
            required
          />
          <button
            className="w-full bg-pink-600 text-white py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
