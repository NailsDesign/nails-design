import { useState } from "react";

export default function AuthForm({ mode = "login", onSubmit, loading, error, initialValues = {} }) {
  const [form, setForm] = useState({
    email: initialValues.email || "",
    password: "",
    first_name: initialValues.first_name || "",
    last_name: initialValues.last_name || "",
    phone: initialValues.phone || "",
    birth_date: initialValues.birth_date || ""
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      {mode === "register" && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-pink-400 focus:border-pink-400"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-pink-400 focus:border-pink-400"
              required
            />
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-pink-400 focus:border-pink-400"
          required
        />
      </div>
      {mode === "register" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-pink-400 focus:border-pink-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Birth Date</label>
            <input
              type="date"
              name="birth_date"
              value={form.birth_date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-pink-400 focus:border-pink-400"
              required
            />
          </div>
        </>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-pink-400 focus:border-pink-400"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition disabled:opacity-60"
        disabled={loading}
      >
        {loading ? (mode === "login" ? "Logging in..." : "Registering...") : (mode === "login" ? "Login" : "Register")}
      </button>
    </form>
  );
} 