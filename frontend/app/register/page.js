"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", birth_date: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/customers/register", form);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600">{error}</p>}
          <input name="first_name" placeholder="First Name" required className="w-full p-2 border rounded" onChange={handleChange} />
          <input name="last_name" placeholder="Last Name" required className="w-full p-2 border rounded" onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" required className="w-full p-2 border rounded" onChange={handleChange} />
          <input name="phone" placeholder="Phone" className="w-full p-2 border rounded" onChange={handleChange} />
          <input
            name="birth_date"
            type="date"
            placeholder="Date of Birth"
            required
            className="w-full p-2 border rounded"
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]} // No future dates
          />
          <input name="password" type="password" placeholder="Password" required className="w-full p-2 border rounded" onChange={handleChange} />
          <button className="w-full bg-pink-600 text-white py-2 rounded">Create Account</button>
        </form>
      )}
    </main>
  );
}
