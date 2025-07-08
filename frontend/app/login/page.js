"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getApiUrl } from '../../config/api';
import AuthForm from "../../components/AuthForm";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (form) => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(getApiUrl('/customers/login'), form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setError("");
      window.dispatchEvent(new Event('authChanged'));
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <AuthForm mode="login" onSubmit={handleLogin} loading={loading} error={error} />
      <div className="mt-4 text-center">
        <a href="/forgot-password" className="text-pink-600 hover:text-pink-800 underline text-base transition-colors">
          Forgot your password?
        </a>
      </div>
      <div className="mt-2 text-center">
        <span className="text-gray-600 text-sm">Don't have an account?</span>
        <a href="/register" className="ml-1 text-pink-600 hover:text-pink-800 underline text-base transition-colors font-semibold">
          Register
        </a>
      </div>
    </main>
  );
}
