"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getApiUrl } from '../../../config/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    setAdmin(JSON.parse(localStorage.getItem("admin")));
    axios.get(getApiUrl('/appointments'), {
      headers: { Authorization: "Bearer " + token }
    }).then(res => setBookings(res.data))
      .catch(() => router.push("/admin/login"));
  }, []);

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    router.push("/admin/login");
  };

  if (!admin)
    return <div className="p-8">Loading...</div>;

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button className="text-pink-600 underline" onClick={logout}>Logout</button>
      </div>
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
              <td className="py-2 px-4">
                {b.appointment_datetime && new Date(b.appointment_datetime).toLocaleString("en-GB")}
              </td>
              <td className="py-2 px-4">{b.name}</td>
              <td className="py-2 px-4">{b.service_name}</td>
              <td className="py-2 px-4">{b.staff_name}</td>
              <td className="py-2 px-4">{b.email}</td>
              <td className="py-2 px-4">{b.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
