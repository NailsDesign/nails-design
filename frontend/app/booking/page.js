"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

console.log("✅ Rebuilding: Vercel should recompile fresh chunks now");

// Salon open hours
const openHours = {
  0: { start: 11, end: 17. }, // Sunday: 11-17:30
  1: { start: 10, end: 19 },
  2: { start: 10, end: 19 },
  3: { start: 10, end: 19 },
  4: { start: 10, end: 19 },
  5: { start: 10, end: 19 },
  6: { start: 10, end: 19 }, // Saturday
};

// Example holidays (yyyy-mm-dd)
const holidays = [
  "2024-12-25", // Christmas
  "2025-01-01", // New Year
];

function isHoliday(date) {
  return holidays.includes(date.toISOString().slice(0, 10));
}

function isOpen(date) {
  const day = date.getDay();
  const { start, end } = openHours[day];
  const h = date.getHours();
  return h >= start && h < end;
}

function isFormComplete(form) {
  return (
    form.name.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.service_id &&
    form.staff_id &&
    form.appointment_datetime
  );
}

export default function BookingPage() {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service_id: "",
    staff_id: "",
    appointment_datetime: ""
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Fetch services and staff on mount
  useEffect(() => {
    axios.get("http://localhost:4000/services").then((res) => setServices(res.data));
    axios.get("http://localhost:4000/staff").then((res) => setStaff(res.data));
  }, []);

  // Fetch booked slots for selected staff and date
  useEffect(() => {
    if (!selectedDate || !form.staff_id) return;
    const dayString = selectedDate.toISOString().slice(0, 10);
    axios
      .get(`http://localhost:4000/appointments/by-day?date=${dayString}&staff_id=${form.staff_id}`)
      .then(res => {
        setBookedSlots(res.data.map(dt =>
          new Date(dt).toTimeString().slice(0, 5)
        ));
      });
  }, [selectedDate, form.staff_id]);

  function filterDate(date) {
    const now = new Date();
    return date >= new Date(now.setHours(0,0,0,0)) && !isHoliday(date);
  }

  function filterTime(time) {
    if (!selectedDate) return false;
    const minutes = time.getMinutes();
    const h = time.getHours();
    const day = selectedDate.getDay();
    const { start, end } = openHours[day];
    const slotString = `${String(h).padStart(2,"0")}:${String(minutes).padStart(2,"0")}`;
    return (
      minutes % 5 === 0 &&
      h >= start &&
      h < end &&
      !bookedSlots.includes(slotString)
    );
  }

  // Custom calendar header
  const renderHeader = ({
    date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled
  }) => (
    <div className="flex items-center justify-between p-2 bg-pink-100 rounded-t-xl">
      <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>&lt;</button>
      <span className="font-bold text-pink-700">
        {date.toLocaleString("default", { month: "long", year: "numeric" })}
      </span>
      <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>&gt;</button>
    </div>
  );

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
      setForm({ ...form, appointment_datetime: date.toISOString().slice(0, 16) });
      setError("");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormComplete(form)) {
      setError("Please fill in all fields.");
      return;
    }
    if (!selectedDate) {
      setError("Please select a date and time.");
      return;
    }
    if (selectedDate < new Date()) {
      setError("Please select a date and time in the future.");
      return;
    }
    if (!isOpen(selectedDate)) {
      setError("Please pick a time during our opening hours: Mon–Sat: 10am–7pm, Sun: 11am–5pm.");
      return;
    }
    if (selectedDate.getMinutes() % 5 !== 0) {
      setError("Please select a time that is on a 5-minute interval (e.g. 10:00, 10:05, etc.).");
      return;
    }
    const h = selectedDate.getHours();
    const m = selectedDate.getMinutes();
    const slotString = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
    if (bookedSlots.includes(slotString)) {
      setError("Sorry, this slot is already booked for the staff selected. Please pick another time.");
      return;
    }

    try {
      await axios.post("http://localhost:4000/appointments", form);
      setSuccess(true);
      setError("");
      setForm({
        name: "",
        email: "",
        phone: "",
        service_id: "",
        staff_id: "",
        appointment_datetime: ""
      });
      setSelectedDate(null);
    } catch (err) {
      setError("Sorry, booking failed. Please try again or contact us.");
    }
  };

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
      {success && (
        <p className="mb-4 text-green-700">
          Booking confirmed! We&apos;ll contact you soon.
        </p>
      )}
      {error && (
        <p className="mb-4 text-red-600 bg-red-100 p-3 rounded">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Your Name"
          required
          value={form.name}
          className="w-full p-2 border rounded"
          onChange={handleChange}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          value={form.email}
          className="w-full p-2 border rounded"
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone"
          required
          value={form.phone}
          className="w-full p-2 border rounded"
          onChange={handleChange}
        />
        <select
          name="service_id"
          required
          value={form.service_id}
          className="w-full p-2 border rounded"
          onChange={handleChange}
        >
          <option value="">Select Service</option>
          {services.map((s) => (
            <option value={s.id} key={s.id}>
              {s.name} (£{s.price})
            </option>
          ))}
        </select>
        <select
          name="staff_id"
          required
          value={form.staff_id}
          className="w-full p-2 border rounded"
          onChange={handleChange}
        >
          <option value="">Select Staff</option>
          {staff.map((st) => (
            <option value={st.id} key={st.id}>{st.name}</option>
          ))}
        </select>
        <div>
          <label className="block mb-1 font-medium">Pick Date & Time</label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            showTimeSelect
            timeIntervals={5}
            timeCaption="Time"
            dateFormat="yyyy-MM-dd HH:mm"
            filterTime={filterTime}
            filterDate={filterDate}
            minDate={new Date()}
            placeholderText="Select date and time"
            className="w-full p-2 border rounded"
            required
            inline
            renderCustomHeader={renderHeader}
            dayClassName={date =>
              isHoliday(date) ? "react-datepicker__day--holiday" : ""
            }
            timeClassName={time => {
              if (!selectedDate) return "";
              const slot = `${String(time.getHours()).padStart(2,"0")}:${String(time.getMinutes()).padStart(2,"0")}`;
              if (bookedSlots.includes(slot)) return "react-datepicker__time-list-item--disabled";
              return "";
            }}
          />
          <div className="flex gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-pink-300"></span> Selected</div>
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-red-200"></span> Holiday</div>
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-gray-300"></span> Booked</div>
            <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-green-50 border"></span> Available</div>
          </div>
        </div>
        <button className="w-full bg-pink-600 text-white py-2 rounded">
          Book
        </button>
      </form>
    </main>
  );
}
