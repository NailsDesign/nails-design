import React, { useEffect, useState, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"; // Use env var or fallback to localhost
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function useCalendarData(selectedDate) {
  const [staff, setStaff] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [blockTimes, setBlockTimes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Handle selectedDate as either string or Date object
      const dateStr = typeof selectedDate === 'string' ? selectedDate : selectedDate.toISOString().slice(0, 10);
      const staffId = 'any';
      
      // Fetch staff
      const staffRes = await fetch(`${BACKEND_URL}/staff`);
      if (!staffRes.ok) throw new Error(`Staff fetch failed: ${staffRes.status}`);
      const staffData = await staffRes.json();
      console.log("Staff data:", staffData);

      // Fetch bookings for the selected date
      const bookingsRes = await fetch(`${BACKEND_URL}/appointments/by-day?date=${dateStr}&staff_id=${staffId}`);
      if (!bookingsRes.ok) throw new Error(`Bookings fetch failed: ${bookingsRes.status}`);
      const bookingsData = await bookingsRes.json();
      console.log("Bookings data:", bookingsData);

      // Fetch block times for the selected date
      const blockTimesRes = await fetch(`${BACKEND_URL}/block-times?date=${dateStr}&staff_id=${staffId}`);
      if (!blockTimesRes.ok) throw new Error(`Block times fetch failed: ${blockTimesRes.status}`);
      const blockTimesData = await blockTimesRes.json();
      console.log("Block times data:", blockTimesData);

      // Fetch all customers from Supabase
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*');
      if (customersError) throw customersError;
      setCustomers(customersData || []);

      setStaff(staffData);
      setBookings(bookingsData);
      setBlockTimes(blockTimesData);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      setStaff([]);
      setBookings([]);
      setBlockTimes([]);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { staff, bookings, blockTimes, customers, loading, refresh: fetchData };
}

export default useCalendarData;