import React, { useEffect, useState } from "react";

export default function StaffModal({ open, onClose, onSave, staff, mode = "create" }) {
  const [form, setForm] = useState({
    name: staff?.name || "",
    email: staff?.email || "",
    role: staff?.role || "staff",
    unavailableSlots: staff?.unavailableSlots ? staff.unavailableSlots.join(", ") : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      name: staff?.name || "",
      email: staff?.email || "",
      role: staff?.role || "staff",
      unavailableSlots: staff?.unavailableSlots ? staff.unavailableSlots.join(", ") : "",
    });
  }, [staff]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        unavailableSlots: form.unavailableSlots
          ? form.unavailableSlots.split(",").map((s) => s.trim())
          : [],
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save staff.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] max-w-[95vw] relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4">{mode === "edit" ? "Edit Staff" : "Add Staff"}</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded p-1"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded p-1"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded p-1"
              required
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Unavailable Slots (comma-separated, e.g. 10:00, 10:30)</label>
            <input
              type="text"
              name="unavailableSlots"
              value={form.unavailableSlots}
              onChange={handleChange}
              className="w-full border rounded p-1"
              placeholder="e.g. 10:00, 10:30"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 disabled:opacity-50"
              disabled={loading}
            >
              {mode === "edit" ? "Save Changes" : "Add Staff"}
            </button>
            <button
              type="button"
              className="ml-auto px-4 py-2 border rounded"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
        {loading && <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center text-pink-700 text-lg">Loading...</div>}
      </div>
    </div>
  );
} 