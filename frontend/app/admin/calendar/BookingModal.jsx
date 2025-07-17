import React, { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const REPEAT_OPTIONS = [
  { value: "none", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "custom", label: "Custom" },
];

export default function BookingModal({
  open,
  onClose,
  onSave,
  onDelete,
  staffList,
  booking,
  slot,
  mode = "create",
  onRefresh,
  setSelectedDate, // <-- add this prop
}) {
  const [tab, setTab] = useState("appointment"); // "appointment" or "block"
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [removals, setRemovals] = useState([]);
  const [form, setForm] = useState({
    client_id: booking?.client_id || "",
    client_name: booking?.client_name || "",
    service_id: booking?.service_id || "",
    service_name: booking?.service_name || "",
    staff_id: booking?.staff_id || slot?.staff?.id || staffList[0]?.id || "",
    booking_date: booking?.booking_date || (slot?.date && slot?.slot ? `${slot.date}T${slot.slot}` : slot?.date || ""),
    duration_minutes: booking?.duration_minutes || 30,
    notes: booking?.notes || "",
    status: booking?.status || "confirmed",
    type: booking?.type || "appointment",
    // Block fields
    block_description: booking?.block_description || "",
    block_repeat: booking?.block_repeat || "none",
    block_start: booking?.block_start || slot?.date || "",
    block_end: booking?.block_end || slot?.date || "",
    add_on_id: booking?.add_on_id || "",
    removal_id: booking?.removal_id || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    // Fetch clients and services from backend
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch clients from Supabase
        const { data: clientsData, error: clientsError } = await supabase
          .from('customers')
          .select('customer_id, first_name, last_name, email, phone');

        if (clientsError) throw clientsError;

        // Fetch services from your backend as before
        const servicesRes = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/services");
        const servicesData = await servicesRes.json();

        setClients(clientsData);
        console.log("Fetched clients:", clientsData);
        // Filter services into main, add-ons, and removals
        const mainServices = servicesData.filter(
          (s) =>
            !s.category ||
            (s.category.toLowerCase() !== "add-on" && s.category.toLowerCase() !== "removal")
        );
        const addOnsList = servicesData.filter(
          (s) => s.category && s.category.toLowerCase() === "add-on"
        );
        const removalsList = servicesData.filter(
          (s) => s.category && s.category.toLowerCase() === "removal"
        );
        setServices(mainServices);
        setAddOns(addOnsList);
        setRemovals(removalsList);
      } catch (err) {
        console.error("Error loading clients/services:", err);
        if (err && err.message) {
          setError(err.message);
        } else if (err && err.error_description) {
          setError(err.error_description);
        } else {
          setError("Failed to load clients or services.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [open]);

  useEffect(() => {
    // Update form when booking or slot changes
    let block_start = booking?.block_start || slot?.date || "";
    let block_end = booking?.block_end || slot?.date || "";
    // If opening a new block and slot is present, set block_end to 30 mins after block_start
    if (!booking && slot?.date && slot?.slot) {
      const [year, month, day] = slot.date.split('-').map(Number);
      const [hour, minute] = slot.slot.split(':').map(Number);
      const startDate = new Date(year, month - 1, day, hour, minute);
      block_start = `${slot.date}T${slot.slot}`;
      const endDate = new Date(startDate.getTime() + 30 * 60000);
      // Format endDate as YYYY-MM-DDTHH:mm in local time
      const endYear = endDate.getFullYear();
      const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
      const endDay = String(endDate.getDate()).padStart(2, '0');
      const endHour = String(endDate.getHours()).padStart(2, '0');
      const endMinute = String(endDate.getMinutes()).padStart(2, '0');
      block_end = `${endYear}-${endMonth}-${endDay}T${endHour}:${endMinute}`;
    }
    // Always initialize both booking_date and appointment_datetime for appointments
    const initialDateTime = booking?.booking_date || (slot?.date && slot?.slot ? `${slot.date}T${slot.slot}` : slot?.date || "");
    setForm({
      client_id: booking?.client_id || "",
      client_name: booking?.client_name || "",
      service_id: booking?.service_id || "",
      service_name: booking?.service_name || "",
      staff_id: booking?.staff_id || slot?.staff?.id || staffList[0]?.id || "",
      booking_date: initialDateTime,
      appointment_datetime: initialDateTime,
      duration_minutes: booking?.duration_minutes || 30,
      notes: booking?.notes || "",
      status: booking?.status || "confirmed",
      type: booking?.type || "appointment",
      block_description: booking?.block_description || "",
      block_repeat: booking?.block_repeat || "none",
      block_start,
      block_end,
      add_on_id: booking?.add_on_id || "",
      removal_id: booking?.removal_id || "",
    });
    setTab(booking?.type === "block" ? "block" : "appointment");
  }, [booking, slot, staffList]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // If service changes, update duration
    if (name === "service_id") {
      const selected = services.find((s) => s.id === value);
      if (selected) setForm((f) => ({ ...f, duration_minutes: selected.duration_minutes, service_name: selected.name }));
    }
    // If client changes, update client_name
    if (name === "client_id") {
      const selected = clients.find((c) => c.id === value);
      if (selected) setForm((f) => ({ ...f, client_name: selected.name }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    console.log("handleSubmit called in BookingModal");
    // Log the values being sent
    console.log('Sending booking:', {
      appointment_datetime: form.appointment_datetime,
      booking_date: form.booking_date,
      block_start: form.block_start,
      block_end: form.block_end
    });
    try {
      let booking_date;
      if (tab === "block") {
        // Convert local block_start and block_end to UTC ISO strings
        await onSave({
          is_block: true,
          staff_id: form.staff_id,
          booking_date: toUTCISOStringFromLocalString(form.booking_date),
          duration_minutes: form.duration_minutes,
          status: 'blocked', // Always set status to 'blocked' for block times
          block_description: form.block_description,
          block_repeat: form.block_repeat,
          block_start: toUTCISOStringFromLocalString(form.block_start),
          block_end: toUTCISOStringFromLocalString(form.block_end),
        });
        booking_date = form.block_start;
      } else {
        // Appointment
        const selectedClient = clients.find(c => c.customer_id === form.client_id);
        const name = selectedClient ? `${selectedClient.first_name} ${selectedClient.last_name}` : form.client_name;
        const email = selectedClient ? selectedClient.email : "";
        const phone = selectedClient ? selectedClient.phone : "";
        const service_ids = [form.service_id, form.add_on_id, form.removal_id].filter(Boolean);
        const appointment_datetime = toUTCISOStringFromLocalString(form.booking_date);
        const payload = {
          customer_id: form.client_id, // Always include customer_id
          name,
          email,
          phone,
          service_ids,
          staff_id: form.staff_id,
          appointment_datetime,
          notes: form.notes,
          status: form.status,
        };
        console.log('Sending booking:', payload);
        await onSave(payload);
        booking_date = form.booking_date;
      }
      // Set selected date to the booking's date (YYYY-MM-DD)
      if (booking_date && typeof setSelectedDate === "function") {
        const dateString = booking_date.slice(0, 10);
        setSelectedDate(dateString);
      }
      console.log("Booking saved, about to call onRefresh in BookingModal");
      if (typeof onRefresh === "function") {
        console.log("Calling onRefresh from BookingModal");
        await onRefresh();
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this item?")) return;
    setLoading(true);
    setError("");
    try {
      await onDelete(booking);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to delete.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  function toDatetimeLocalString(date) {
    if (!date) return "";
    const d = new Date(date);
    // If the date is already in the correct format, return as is
    if (typeof date === "string" && date.includes("T")) {
      return date.slice(0, 16);
    }
    // Otherwise, format it
    const pad = (n) => n.toString().padStart(2, "0");
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      "T" +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes())
    );
  }

  // Helper to convert local time to 'fake UTC' ISO string
  function toFakeUTCISOString(date) {
    const tzOffset = date.getTimezoneOffset();
    const fakeUTC = new Date(date.getTime() - tzOffset * 60000);
    return fakeUTC.toISOString().slice(0, 16);
  }

  // Helper to convert Date to local time string (YYYY-MM-DDTHH:mm)
  function toLocalISOString(date) {
    const pad = n => n.toString().padStart(2, '0');
    return (
      date.getFullYear() + '-' +
      pad(date.getMonth() + 1) + '-' +
      pad(date.getDate()) + 'T' +
      pad(date.getHours()) + ':' +
      pad(date.getMinutes())
    );
  }

  function toUTCISOStringFromLocal(date) {
    // Construct a new Date using local time parts, then get UTC ISO string
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      0, 0
    ).toISOString();
  }

  // Helper to convert local time string (YYYY-MM-DDTHH:mm) to UTC ISO string
  function toUTCISOStringFromLocalString(localString) {
    if (!localString) return undefined;
    const [datePart, timePart] = localString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const localDate = new Date(year, month - 1, day, hour, minute);
    return localDate.toISOString();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(255,255,255,0.7)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[600px] max-h-[80vh] overflow-y-auto relative border border-pink-100">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex mb-4 border-b">
          <button
            className={`flex-1 py-2 font-bold text-lg rounded-tl-xl ${tab === "appointment" ? "text-pink-700 border-b-2 border-pink-600" : "text-gray-400"}`}
            onClick={() => setTab("appointment")}
          >
            Appointment
          </button>
          <button
            className={`flex-1 py-2 font-bold text-lg rounded-tr-xl ${tab === "block" ? "text-pink-700 border-b-2 border-pink-600" : "text-gray-400"}`}
            onClick={() => setTab("block")}
          >
            Block
          </button>
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-2">
          {tab === "appointment" ? (
            <div className="md:grid md:grid-cols-2 md:gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1">Client</label>
                <select
                  name="client_id"
                  value={form.client_id}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.first_name} {c.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1">Service</label>
                <select
                  name="service_id"
                  value={form.service_id}
                  onChange={handleChange}
                  className="w-full border rounded p-2 max-h-32 overflow-y-auto"
                  required
                >
                  <option value="">Select service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1">Add-on</label>
                <select
                  name="add_on_id"
                  value={form.add_on_id}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                >
                  <option value="">Select add-on (optional)</option>
                  {addOns.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1">Removal</label>
                <select
                  name="removal_id"
                  value={form.removal_id}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                >
                  <option value="">Select removal (optional)</option>
                  {removals.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Duration (min)</label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={form.duration_minutes}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  min={5}
                  max={240}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Staff</label>
                <select
                  name="staff_id"
                  value={form.staff_id}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  name="booking_date"
                  value={toDatetimeLocalString(form.booking_date)}
                  onChange={e => {
                    setForm(f => ({
                      ...f,
                      booking_date: e.target.value,
                      appointment_datetime: e.target.value // keep both in sync
                    }));
                  }}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  rows={2}
                />
              </div>
            </div>
          ) : (
            <div className="md:grid md:grid-cols-2 md:gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1">Team Member</label>
                <select
                  name="staff_id"
                  value={form.staff_id}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1">Description</label>
                <input
                  type="text"
                  name="block_description"
                  value={form.block_description}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  placeholder="e.g. Lunch break, Holiday"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Repeat</label>
                <select
                  name="block_repeat"
                  value={form.block_repeat}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                >
                  {REPEAT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Start date</label>
                <input
                  type="datetime-local"
                  name="block_start"
                  value={toDatetimeLocalString(form.block_start)}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">End date</label>
                <input
                  type="datetime-local"
                  name="block_end"
                  value={toDatetimeLocalString(form.block_end)}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 disabled:opacity-50"
              disabled={loading}
            >
              {mode === "edit" ? "Save Changes" : tab === "block" ? "Block Time" : "Create Booking"}
            </button>
            {mode === "edit" && (
              <button
                type="button"
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </button>
            )}
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
        {loading && <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center text-pink-700 text-lg rounded-2xl">Loading...</div>}
      </div>
    </div>
  );
}