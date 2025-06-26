"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(localStorage.getItem("user")));
    axios.get("http://localhost:4000/my-bookings", {
      headers: { Authorization: "Bearer " + token }
    }).then(res => setBookings(res.data));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user)
    return <div className="p-8">Loading...</div>;

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <button className="text-pink-600 underline" onClick={logout}>Logout</button>
      </div>
      <h2 className="text-lg font-semibold mb-2">Your Appointments:</h2>
      <table className="min-w-full bg-white border rounded shadow">
        <thead>
          <tr className="bg-pink-100">
            <th className="py-2 px-4 text-left">Date & Time</th>
            <th className="py-2 px-4 text-left">Service</th>
            <th className="py-2 px-4 text-left">Staff</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id} className="hover:bg-pink-50 border-t">
              <td className="py-2 px-4">
                {b.appointment_datetime && new Date(b.appointment_datetime).toLocaleString("en-GB")}
              </td>
              <td className="py-2 px-4">{b.service_name}</td>
              <td className="py-2 px-4">{b.staff_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
