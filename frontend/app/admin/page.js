"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:4000/appointments")
      .then(res => setBookings(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {loading ? (
        <div>Loading bookings...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead>
              <tr className="bg-pink-100">
                <th className="py-2 px-4 text-left">Date & Time</th>
                <th className="py-2 px-4 text-left">Customer</th>
                <th className="py-2 px-4 text-left">Service</th>
                <th className="py-2 px-4 text-left">Staff</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Phone</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-pink-50 border-t">
                  <td className="py-2 px-4 whitespace-nowrap">
                    {b.appointment_datetime && new Date(b.appointment_datetime).toLocaleString("en-GB", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className="py-2 px-4">{b.name}</td>
                  <td className="py-2 px-4">{b.service_name}</td>
                  <td className="py-2 px-4">{b.staff_name}</td>
                  <td className="py-2 px-4">{b.email}</td>
                  <td className="py-2 px-4">{b.phone}</td>
                </tr>
              ))}
              {!bookings.length && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 p-8">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
