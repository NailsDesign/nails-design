"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getApiUrl } from "@/config/api";

const openHours = {
  0: { start: 11, end: 17 },
  1: { start: 10, end: 19 },
  2: { start: 10, end: 19 },
  3: { start: 10, end: 19 },
  4: { start: 10, end: 19 },
  5: { start: 10, end: 19 },
  6: { start: 10, end: 19 },
};

const holidays = ["2024-12-25", "2025-01-01"];

export default function BookingPage() {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", staff_id: "", service: "" });
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    axios.get(getApiUrl("/services")).then((res) => setServices(res.data));
    axios.get(getApiUrl("/staff")).then((res) => setStaff(res.data));
  }, []);

  useEffect(() => {
    if (!selectedDate || !form.staff_id) return;
    const dayString = selectedDate.toISOString().slice(0, 10);
    axios
      .get(getApiUrl(`/appointments/by-day?date=${dayString}&staff_id=${form.staff_id}`))
      .then((res) => {
        setBookedSlots(res.data.map((dt) => new Date(dt).toTimeString().slice(0, 5)));
      });
  }, [selectedDate, form.staff_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(getApiUrl("/appointments"), form);
      alert("Appointment booked!");
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to book appointment.");
    }
  };

  return (
    <div className="p-4">
      <h1>Book an Appointment</h1>
      <form onSubmit={handleSubmit}>
        {/* Your form fields go here */}
      </form>
    </div>
  );
}
