"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getApiUrl } from '../../config/api';
import AuthForm from "../../components/AuthForm";

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (form) => {
    setError("");
    setLoading(true);
    try {
      await axios.post(getApiUrl('/customers/register'), form);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-8">
      <div className="bg-pink-100 border border-pink-300 rounded-lg p-4 mb-6 text-center font-semibold text-pink-800">
        🎉 Sign up today and get a special birthday discount—just for you!<br />
        (Spend £30 or more on your birthday and enjoy an exclusive offer!)
      </div>
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>
      {success ? (
        <p className="text-green-600">Account created! Redirecting to login...</p>
      ) : (
        <>
          <AuthForm mode="register" onSubmit={handleRegister} loading={loading} error={error} />
          <div className="mt-4 text-center">
            <span className="text-gray-600 text-sm">Already have an account?</span>
            <a href="/login" className="ml-1 text-pink-600 hover:text-pink-800 underline text-base transition-colors font-semibold">
              Login
            </a>
          </div>
        </>
      )}
    </main>
  );
}
