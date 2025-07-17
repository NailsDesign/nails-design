"use client";
import React, { useState } from "react";
// import FullCalendar from "@fullcalendar/react";
// import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
// import interactionPlugin from "@fullcalendar/interaction";
import useCalendarData from "./useCalendarData";
import AdvancedStaffCalendar from "./AdvancedStaffCalendar";

export default function AdminCalendarPage() {
  const getLocalDateString = () => {
    const today = new Date();
    return today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');
  };
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const { staff, bookings, blockTimes, customers, loading, refresh } = useCalendarData(selectedDate);

  // Debug: Log staff and bookings
  console.log("Staff:", staff);
  console.log("Bookings:", bookings);
  console.log("Block Times:", blockTimes);

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <AdvancedStaffCalendar 
          staff={staff} 
          bookings={bookings} 
          blockTimes={blockTimes}
          customers={customers}
          slotInterval={15} 
          onRefresh={refresh} 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      )}
      {/* Debug: If staff or bookings are missing, check backend API and data mapping */}
    </div>
  );
}