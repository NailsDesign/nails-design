import React, { useState, useEffect } from "react";

export default function BlockTimeModal({ open, onClose, onSave, initialData, staffList }) {
  const [form, setForm] = useState({
    staff_id: staffList[0]?.id || "",
    block_start: "",
    block_end: "",
    description: "",
    repeat: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        staff_id: initialData.staff_id || staffList[0]?.id || "",
        block_start: initialData.block_start ? initialData.block_start.slice(0, 16) : "",
        block_end: initialData.block_end ? initialData.block_end.slice(0, 16) : "",
        description: initialData.description || "",
        repeat: initialData.repeat || "",
      });
    }
  }, [initialData, staffList]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.staff_id || !form.block_start || !form.block_end) return;
    onSave({ ...form });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <form className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold mb-4">{initialData ? "Edit Block Time" : "Create Block Time"}</h2>
        <label className="block mb-2">
          Staff:
          <select name="staff_id" value={form.staff_id} onChange={handleChange} className="w-full border rounded p-2 mt-1">
            {staffList.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label className="block mb-2">
          Start:
          <input type="datetime-local" name="block_start" value={form.block_start} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
        </label>
        <label className="block mb-2">
          End:
          <input type="datetime-local" name="block_end" value={form.block_end} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
        </label>
        <label className="block mb-2">
          Description:
          <input type="text" name="description" value={form.description} onChange={handleChange} className="w-full border rounded p-2 mt-1" />
        </label>
        <label className="block mb-4">
          Repeat:
          <input type="text" name="repeat" value={form.repeat} onChange={handleChange} className="w-full border rounded p-2 mt-1" />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700">Save</button>
        </div>
      </form>
    </div>
  );
} 