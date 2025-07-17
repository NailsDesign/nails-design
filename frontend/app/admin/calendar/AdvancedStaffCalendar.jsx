import React, { useState, useEffect, useRef } from "react";
import BookingModal from "./BookingModal";
import StaffModal from "./StaffModal";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import BlockTimeModal from './BlockTimeModal';
import BookingDetailsModal from './BookingDetailsModal';
import ClientDetailsModal from './ClientDetailsModal';
import axios from 'axios';

// Helper functions (reuse from previous code)
function generateTimeSlots(start = 8, end = 20, interval = 30) {
  const slots = [];
  for (let hour = start; hour < end; hour++) {
    for (let min = 0; min < 60; min += interval) {
      const h = hour.toString().padStart(2, "0");
      const m = min.toString().padStart(2, "0");
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
}
function getSlotIndex(date, slots) {
  const d = new Date(date);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return slots.indexOf(`${h}:${m}`);
}
function minutesToSlots(duration, interval) {
  return Math.ceil(duration / interval);
}
const STATUS_STYLES = {
  confirmed: { border: "border-green-500", icon: "✅" },
  pending: { border: "border-yellow-400", icon: "⏳" },
  cancelled: { border: "border-red-400", icon: "❌" },
  paid: { border: "border-blue-500", icon: "💸" },
  "no-show": { border: "border-gray-400", icon: "🚫" },
};
function getStatusStyle(status) {
  return STATUS_STYLES[status] || STATUS_STYLES.confirmed;
}
function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Main component
export default function AdvancedStaffCalendar({
  staff,
  bookings,
  blockTimes = [],
  customers = [],
  slotInterval = 15,
  onRefresh,
  selectedDate,
  setSelectedDate,
}) {
  // Calendar state
  const [view, setView] = useState("day"); // "day" or "week"
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [modalSlot, setModalSlot] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [hoveredBookingId, setHoveredBookingId] = useState(null);
  const [popoverBookingId, setPopoverBookingId] = useState(null);

  // For BookingDetailsModal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsModalBooking, setDetailsModalBooking] = useState(null);
  const [detailsModalCustomer, setDetailsModalCustomer] = useState(null);
  const [detailsModalIsFirstVisit, setDetailsModalIsFirstVisit] = useState(true);

  // For real-time now line
  const [nowPosition, setNowPosition] = useState(null);
  const tableRef = useRef();

  // Block time modal state
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockModalData, setBlockModalData] = useState(null);

  // Tooltip side logic
  const [tooltipSide, setTooltipSide] = useState('right'); // 'right' or 'left'
  const cellRefs = useRef({});

  // Helper to determine tooltip side
  function determineTooltipSide(cellKey) {
    const cell = cellRefs.current[cellKey];
    if (!cell) return 'right';
    const rect = cell.getBoundingClientRect();
    const tooltipWidth = 260; // Approximate width of tooltip (w-64)
    const padding = 16; // px
    const viewportWidth = window.innerWidth;
    // Prefer right, but if not enough space, use left
    if (rect.right + tooltipWidth + padding < viewportWidth) {
      return 'right';
    } else if (rect.left - tooltipWidth - padding > 0) {
      return 'left';
    } else {
      return 'right'; // fallback
    }
  }

  // When hoveredBookingId changes, update tooltipSide
  useEffect(() => {
    if (hoveredBookingId) {
      setTooltipSide(determineTooltipSide(hoveredBookingId));
    }
  }, [hoveredBookingId]);

  function isSlotBlocked(staffId, slotTime) {
    // Convert slotTime (e.g., "09:00") to a Date object for the selected date
    const [hour, minute] = slotTime.split(':').map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hour, minute, 0, 0);
    
    // First check new block_times table
    const newBlockResult = blockTimes.some(block =>
      block.staff_id === staffId &&
      new Date(block.block_start) <= slotDate &&
      slotDate < new Date(block.block_end)
    );
    
    // Also check old blocked bookings (temporary during migration)
    const oldBlockResult = bookings.some(booking =>
      booking.staff_id === staffId &&
      booking.status === 'blocked' &&
      new Date(booking.booking_date) <= slotDate &&
      slotDate < new Date(new Date(booking.booking_date).getTime() + booking.duration_minutes * 60000)
    );
    
    const result = newBlockResult || oldBlockResult;
    console.log('isSlotBlocked', { staffId, slotTime, slotDate, result, blockTimes: blockTimes.length, bookings: bookings.length });
    return result;
  }

  // Generate time slots
  const timeSlots = generateTimeSlots(8, 20, slotInterval);

  // Week view: get array of dates for the week
  function getWeekDates(dateStr) {
    const date = new Date(dateStr);
    // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const day = date.getDay();
    // Calculate how many days to subtract to get to Monday
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    // Generate array for Mon-Sun
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }
  const weekDates = getWeekDates(selectedDate);

  // Build booking grid for day or week view
  function buildBookingGrid() {
    if (view === "day") {
      // staffId -> slotIndex -> booking
      const grid = {};
      staff.forEach((s) => {
        grid[s.id] = Array(timeSlots.length).fill(null);
      });
      bookings.forEach((b) => {
        const slotIdx = getSlotIndex(b.booking_date, timeSlots);
        const slotsNeeded = minutesToSlots(b.duration_minutes, slotInterval);
        for (let i = 0; i < slotsNeeded; i++) {
          if (slotIdx + i < timeSlots.length) {
            grid[b.staff_id][slotIdx + i] = i === 0 ? b : "occupied";
          }
        }
      });
      
      // Process block times
      blockTimes.forEach((block) => {
        const startSlotIdx = getSlotIndex(block.block_start, timeSlots);
        const endSlotIdx = getSlotIndex(block.block_end, timeSlots);
        const slotsNeeded = Math.max(1, endSlotIdx - startSlotIdx);
        
        for (let i = 0; i < slotsNeeded; i++) {
          if (startSlotIdx + i < timeSlots.length) {
            // Create a block time object that matches the booking format
            const blockBooking = {
              ...block,
              booking_date: block.block_start,
              block_end: block.block_end,
              duration_minutes: slotsNeeded * slotInterval,
              status: 'blocked',
              is_block: true,
              client_name: 'Blocked time',
              service_name: block.description || 'No description'
            };
            grid[block.staff_id][startSlotIdx + i] = i === 0 ? blockBooking : "occupied";
          }
        }
      });
      
      return grid;
    } else {
      // week view: staffId -> dayIdx -> slotIdx -> booking
      const grid = {};
      staff.forEach((s) => {
        grid[s.id] = weekDates.map(() => Array(timeSlots.length).fill(null));
      });
      bookings.forEach((b) => {
        const bDate = new Date(b.booking_date);
        const dayIdx = weekDates.findIndex(
          (d) =>
            d.getFullYear() === bDate.getFullYear() &&
            d.getMonth() === bDate.getMonth() &&
            d.getDate() === bDate.getDate()
        );
        if (dayIdx === -1) return;
        const slotIdx = getSlotIndex(b.booking_date, timeSlots);
        const slotsNeeded = minutesToSlots(b.duration_minutes, slotInterval);
        for (let i = 0; i < slotsNeeded; i++) {
          if (slotIdx + i < timeSlots.length) {
            grid[b.staff_id][dayIdx][slotIdx + i] = i === 0 ? b : "occupied";
          }
        }
      });
      
      // Process block times for week view
      blockTimes.forEach((block) => {
        const blockStartDate = new Date(block.block_start);
        const dayIdx = weekDates.findIndex(
          (d) =>
            d.getFullYear() === blockStartDate.getFullYear() &&
            d.getMonth() === blockStartDate.getMonth() &&
            d.getDate() === blockStartDate.getDate()
        );
        if (dayIdx === -1) return;
        
        const startSlotIdx = getSlotIndex(block.block_start, timeSlots);
        const endSlotIdx = getSlotIndex(block.block_end, timeSlots);
        const slotsNeeded = Math.max(1, endSlotIdx - startSlotIdx);
        
        for (let i = 0; i < slotsNeeded; i++) {
          if (startSlotIdx + i < timeSlots.length) {
            // Create a block time object that matches the booking format
            const blockBooking = {
              ...block,
              booking_date: block.block_start,
              block_end: block.block_end,
              duration_minutes: slotsNeeded * slotInterval,
              status: 'blocked',
              is_block: true,
              client_name: 'Blocked time',
              service_name: block.description || 'No description'
            };
            grid[block.staff_id][dayIdx][startSlotIdx + i] = i === 0 ? blockBooking : "occupied";
          }
        }
      });
      
      return grid;
    }
  }
  const bookingGrid = buildBookingGrid();

  // Staff availability: gray out unavailable slots
  function isUnavailable(staffObj, slot) {
    if (!staffObj.unavailableSlots) return false;
    return staffObj.unavailableSlots.includes(slot);
  }

  // Real-time now line calculation
  useEffect(() => {
    function updateNowLine() {
      if (view !== "day" || !tableRef.current) {
        setNowPosition(null);
        return;
      }
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      // Find the two closest slots
      let prevIdx = -1;
      let nextIdx = -1;
      let prevMinutes = -1;
      let nextMinutes = -1;
      for (let i = 0; i < timeSlots.length; i++) {
        const [h, m] = timeSlots[i].split(":").map(Number);
        const slotMinutes = h * 60 + m;
        if (slotMinutes <= nowMinutes) {
          prevIdx = i;
          prevMinutes = slotMinutes;
        }
        if (slotMinutes > nowMinutes) {
          nextIdx = i;
          nextMinutes = slotMinutes;
          break;
        }
      }
      const rows = tableRef.current.querySelectorAll("tbody tr");
      if (prevIdx === -1 || nextIdx === -1 || !rows[prevIdx] || !rows[nextIdx]) {
        setNowPosition(null);
        return;
      }
      const prevRect = rows[prevIdx].getBoundingClientRect();
      const nextRect = rows[nextIdx].getBoundingClientRect();
      const tableRect = tableRef.current.getBoundingClientRect();
      const percent = (nowMinutes - prevMinutes) / (nextMinutes - prevMinutes);
      const pos = (prevRect.top - tableRect.top) + percent * (nextRect.top - prevRect.top);
      setNowPosition(pos);
    }
    updateNowLine();
    const interval = setInterval(updateNowLine, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [view, timeSlots, tableRef, selectedDate]);

  // Navigation handlers
  function goToToday() {
    setSelectedDate(new Date().toISOString().slice(0, 10));
  }
  function goToPrev() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - (view === "week" ? 7 : 1));
    setSelectedDate(d.toISOString().slice(0, 10));
  }
  function goToNext() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (view === "week" ? 7 : 1));
    setSelectedDate(d.toISOString().slice(0, 10));
  }

  // Modal handlers
  async function handleSaveBooking(form) {
    // Check if this is a block time
    if (form.is_block) {
      // Route to block-times endpoint
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/block-times`;
      const blockTimeData = {
        staff_id: form.staff_id,
        block_start: form.block_start,
        block_end: form.block_end,
        description: form.block_description || '',
        repeat: form.block_repeat || 'none'
      };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blockTimeData),
      });
      if (!res.ok) throw new Error("Failed to save block time");
    } else {
      // Route to appointments endpoint for regular bookings
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save booking");
    }
    if (onRefresh) onRefresh();
  }
  async function handleDeleteBooking(booking) {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/bookings/${booking.id}`;
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete booking");
    if (onRefresh) onRefresh();
  }
  function openCreateModal(staff, slot, dayIdx = null) {
    setModalMode("create");
    setSelectedBooking(null);
    let date = selectedDate;
    if (view === "week" && dayIdx !== null) {
      date = weekDates[dayIdx].toISOString().slice(0, 10);
    }
    setModalSlot({ staff, slot, date });
    setModalOpen(true);
  }
  function openEditModal(booking) {
    setModalMode("edit");
    setSelectedBooking(booking);
    setModalSlot(null);
    setModalOpen(true);
  }

  // Staff modal handlers
  async function handleSaveStaff(form) {
    const url = editingStaff
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/staff/${editingStaff.id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/staff`;
    const method = editingStaff ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error("Failed to save staff");
    if (onRefresh) onRefresh();
  }
  function openAddStaff() {
    setEditingStaff(null);
    setStaffModalOpen(true);
  }
  function openEditStaff(staffObj) {
    setEditingStaff(staffObj);
    setStaffModalOpen(true);
  }

  // Popover logic
  function handlePopover(booking) {
    if (!booking) return;
    const foundCustomer = getCustomerForBooking(booking);
    const firstVisit = isFirstVisit(booking, bookings);
    setDetailsModalBooking(booking);
    setDetailsModalCustomer(foundCustomer);
    setDetailsModalIsFirstVisit(firstVisit);
    setDetailsModalOpen(true);
  }
  function closePopover() {
    setPopoverBookingId(null);
  }

  // Handle right-click for popover
  function handleRightClick(e, bookingId) {
    e.preventDefault();
    setPopoverBookingId(bookingId);
  }

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverBookingId && !event.target.closest('.calendar-cell')) {
        closePopover();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverBookingId]);

  // Add handlers inside the component
  async function handleBlockTimeSave(data) {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
    if (data.block_time_id) {
      // Edit
      await fetch(`${BACKEND_URL}/block-times/${data.block_time_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      // Create
      await fetch(`${BACKEND_URL}/block-times`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    setBlockModalOpen(false);
    setBlockModalData(null);
    // Use onRefresh to refetch data
    if (onRefresh) onRefresh();
  }

  async function handleDeleteBlockTime(id) {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
    await fetch(`${BACKEND_URL}/block-times/${id}`, { method: 'DELETE' });
    setBlockModalOpen(false);
    setBlockModalData(null);
    // Use onRefresh to refetch data
    if (onRefresh) onRefresh();
  }

  // Helper to get customer by booking
  function getCustomerForBooking(booking) {
    if (!booking) return null;
    console.log('getCustomerForBooking booking:', booking);
    console.log('getCustomerForBooking customers:', customers);
    // Try to find by customer_id first
    if (booking.customer_id) {
      const found = customers.find(c => c.customer_id === booking.customer_id);
      console.log('Lookup by customer_id:', booking.customer_id, 'Found:', found);
      if (found) return found;
    }
    // Try to find by client_id
    if (booking.client_id) {
      const found = customers.find(c => c.customer_id === booking.client_id);
      console.log('Lookup by client_id:', booking.client_id, 'Found:', found);
      if (found) return found;
    }
    // Fallback: try to match by email if available
    if (booking.email) {
      const found = customers.find(c => c.email === booking.email);
      console.log('Lookup by email:', booking.email, 'Found:', found);
      if (found) return found;
    }
    // Fallback: try to match by name
    if (booking.client_name) {
      const [first, ...rest] = booking.client_name.split(' ');
      const last = rest.join(' ');
      const found = customers.find(c => c.first_name === first && c.last_name === last);
      console.log('Lookup by name:', first, last, 'Found:', found);
      if (found) return found;
    }
    return null;
  }

  // Helper to determine if first visit
  function isFirstVisit(booking, allBookings) {
    if (!booking || !booking.client_name) return true;
    const count = allBookings.filter(b => b.client_name === booking.client_name).length;
    return count <= 1;
  }

  // Handler for viewing client details/history
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);
  const [clientDetailsClient, setClientDetailsClient] = useState(null);

  function handleViewClientDetails() {
    if (detailsModalCustomer) {
      setClientDetailsClient(detailsModalCustomer);
      setClientDetailsOpen(true);
    }
  }

  // Handler to update note
  async function handleAddNote(note) {
    if (!detailsModalBooking) return;
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/bookings/${detailsModalBooking.booking_id}/note`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {})
        },
        body: JSON.stringify({ note })
      });
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      alert('Failed to save note.');
    }
  }

  // Handler to mark as no-show
  async function handleNoShow() {
    if (!detailsModalBooking) return;
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/bookings/${detailsModalBooking.booking_id}/no-show`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: 'Bearer ' + token } : {})
        }
      });
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      alert('Failed to mark as no-show.');
    }
  }

  // Handler to cancel appointment
  async function handleCancelAppointment() {
    if (!detailsModalBooking) return;
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/bookings/${detailsModalBooking.booking_id}/cancel`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: 'Bearer ' + token } : {})
        }
      });
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      alert('Failed to cancel appointment.');
    }
  }

  // Render
  return (
    <div className="flex">
      {/* Sidebar: calendar, nav bar, add staff - all stacked */}
      <div className="flex flex-col items-center w-[210px] min-w-[170px]">
        <div style={{ width: 200, minWidth: 180 }}>
          <Calendar
            onChange={date => {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              setSelectedDate(`${year}-${month}-${day}`);
            }}
            value={new Date(selectedDate)}
            className="mini-calendar !w-full !h-full"
            prev2Label={null}
            next2Label={null}
          />
        </div>
        <div style={{ marginTop: 10 }} />
        {/* Compact Navigation Bar - remove left/right arrows */}
        <div className="flex items-center justify-center gap-1 mt-2 w-full text-[11px]">
          <button onClick={goToToday} className="px-1.5 py-0.5 rounded bg-pink-500 text-white hover:bg-pink-600 text-[11px] font-medium min-w-10">Today</button>
          <div className="flex items-center gap-1 ml-1">
            <button
              className={`px-1.5 py-0.5 rounded ${view === "day" ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-700"} text-[11px] font-medium min-w-8`}
              onClick={() => setView("day")}
            >Day</button>
            <button
              className={`px-1.5 py-0.5 rounded ${view === "week" ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-700"} text-[11px] font-medium min-w-8`}
              onClick={() => setView("week")}
            >Week</button>
          </div>
        </div>
        <button
          className="mt-4 px-2.5 py-1 rounded bg-green-500 text-white hover:bg-green-600 text-[12px] font-medium w-full flex items-center justify-center gap-1"
          onClick={openAddStaff}
        >
          <span className="material-icons" style={{ fontSize: '14px' }}>&#x2795;</span> Add Staff
        </button>
        {/* Only one global style block allowed! */}
        <style jsx global>{`
          .mini-calendar {
            font-size: 11px !important;
          }
          .mini-calendar * {
            font-size: 11px !important;
          }
          .mini-calendar .react-calendar__month-view__weekdays {
            font-size: 7px !important;
            letter-spacing: -1px;
          }
          /* Hide default calendar icon in date input */
          input[type="date"].hide-date-icon::-webkit-calendar-picker-indicator {
            opacity: 0;
            display: none;
          }
          input[type="date"].hide-date-icon::-ms-input-placeholder {
            color: transparent;
          }
          input[type="date"].hide-date-icon::-moz-placeholder {
            color: transparent;
          }
          input[type="date"].hide-date-icon:-ms-input-placeholder {
            color: transparent;
          }
          input[type="date"].hide-date-icon::placeholder {
            color: transparent;
          }
        `}</style>
      </div>
      {/* Main content (booking table) */}
      <div className="flex-1">
        {/* Calendar Table */}
        <div className="overflow-x-auto relative">
          <table className="min-w-full border-collapse" ref={tableRef}>
            <thead>
              <tr>
                <th className="bg-gray-100 p-2 text-right w-20">{view === "week" ? "Staff / Time" : "Time"}</th>
                {view === "week"
                  ? weekDates.slice(0, 7).map((d, i) => (
                      <th key={i} className="bg-gray-100 p-2 text-center min-w-[120px]">
                        {d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      </th>
                    ))
                  : staff.map((s) => (
                      <th key={s.id} className="bg-gray-100 p-2 text-center min-w-[140px]">
                        <div className="flex items-center justify-center gap-2">
                          {s.name}
                          <button
                            className="text-xs text-blue-500 hover:underline"
                            onClick={() => openEditStaff(s)}
                            title="Edit staff"
                          >✎</button>
                        </div>
                      </th>
                    ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot, rowIdx) => {
                // Determine if this is an hour row (e.g., 08:00, 09:00, ...)
                const isHour = slot.endsWith(":00");
                return (
                  <tr key={slot}>
                    <td
                      className={`text-right p-1 bg-gray-50 text-xs w-20 align-top ${isHour ? "font-bold" : ""}`}
                      style={{
                        height: '28px',
                        borderTop: isHour ? '2px solid #bbb' : 'none',
                        borderRight: '1px solid #ccc',
                        borderLeft: '1px solid #ccc',
                        borderBottom: 'none',
                      }}
                    >
                      {isHour ? slot : ""}
                    </td>
                    {view === "week"
                      ? weekDates.slice(0, 7).map((d, dayIdx) => {
                          const s = staff[0];
                          const dayGrid = bookingGrid[s.id] && bookingGrid[s.id][dayIdx];
                          const cell = dayGrid ? dayGrid[rowIdx] : null;
                          if (cell && cell !== "occupied") {
                            const slotsNeeded = minutesToSlots(cell.duration_minutes, slotInterval);
                            if (getSlotIndex(cell.booking_date, timeSlots) === rowIdx) {
                              const statusStyle = getStatusStyle(cell.status);
                              const cellKey = `${s.id}-${slot}`;
                              const isBlock = cell.is_block || cell.status === 'blocked';
                              console.log('CELL:', cell);
                              return (
                                <td
                                  key={s.id + "-" + dayIdx + "-" + slot}
                                  rowSpan={slotsNeeded}
                                  ref={el => { cellRefs.current[cellKey] = el; }}
                                  className={`calendar-cell border-2 ${isBlock ? 'border-gray-300 bg-gray-200' : statusStyle.border + ' bg-pink-50'} align-top relative cursor-pointer group hover:bg-yellow-100 transition`}
                                  onMouseEnter={() => setHoveredBookingId(cellKey)}
                                  onMouseLeave={() => setHoveredBookingId(null)}
                                  onClick={() => handlePopover(cell)}
                                  onContextMenu={(e) => handleRightClick(e, cellKey)}
                                  style={{ borderTop: isHour ? '2px solid #bbb' : '1px dotted #bbb', height: '28px', borderColor: isBlock ? '#ccc' : undefined }}
                                >
                                  <div className="flex items-center gap-2">
                                    {isBlock ? null : (
                                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-pink-200 text-pink-900 font-bold text-xs">
                                        {getInitials(cell.client_name)}
                                      </span>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      {isBlock ? (
                                        <div className="font-semibold text-gray-700 text-xs truncate">Blocked time</div>
                                      ) : (
                                        <div className="font-semibold text-pink-800 text-xs truncate">{cell.client_name}</div>
                                      )}
                                      <div className="text-xs truncate">{isBlock ? cell.block_description : cell.service_name}</div>
                                    </div>
                                    {!isBlock && <span className="ml-1 text-lg" title={cell.status}>{statusStyle.icon}</span>}
                                  </div>
                                  {/* Tooltip */}
                                  {hoveredBookingId === cellKey && isBlock && (
                                    <div
                                      className={`absolute z-10 top-1/2 -translate-y-1/2 w-64 bg-white border border-gray-300 shadow-lg p-0 rounded-xl pointer-events-none ${tooltipSide === 'right' ? 'left-full ml-2' : 'right-full mr-2'}`}
                                    >
                                      <div className="bg-gray-200 rounded-t-xl px-4 py-2 text-xs font-semibold text-gray-700 border-b border-gray-300">Blocked time</div>
                                      <div className="px-4 py-2 text-xs text-gray-700">
                                        <div className="mb-1"><strong>{s.name}</strong></div>
                                        <div><strong>Start date</strong> {new Date(cell.booking_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                        <div><strong>End date</strong> {cell.block_end ? new Date(cell.block_end).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : ''}</div>
                                        {cell.last_updated_by && cell.last_updated_at && (
                                          <div className="mt-2 text-[11px] text-gray-500">Last updated by {cell.last_updated_by} on {new Date(cell.last_updated_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {/* Appointment tooltip */}
                                  {hoveredBookingId === cellKey && !isBlock && (
                                    <div
                                      className={`absolute z-10 top-1/2 -translate-y-1/2 w-64 bg-white border border-gray-300 shadow-lg p-0 rounded-xl pointer-events-none ${tooltipSide === 'right' ? 'left-full ml-2' : 'right-full mr-2'}`}
                                    >
                                      <div className="bg-pink-100 rounded-t-xl px-4 py-2 text-xs font-semibold text-pink-700 border-b border-gray-300">Appointment</div>
                                      <div className="px-4 py-2 text-xs text-gray-700">
                                        <div className="mb-1"><strong>Client:</strong> {cell.client_name}</div>
                                        <div className="mb-1"><strong>Service:</strong> {cell.service_name}</div>
                                        <div className="mb-1"><strong>Status:</strong> {cell.status}</div>
                                        <div className="mb-1"><strong>Start:</strong> {new Date(cell.booking_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                        <div className="mb-1"><strong>Duration:</strong> {cell.duration_minutes} min</div>
                                        {cell.email && <div className="mb-1"><strong>Email:</strong> {cell.email}</div>}
                                        {cell.phone && <div className="mb-1"><strong>Phone:</strong> {cell.phone}</div>}
                                        {cell.notes && <div className="mb-1"><strong>Notes:</strong> {cell.notes}</div>}
                                      </div>
                                    </div>
                                  )}
                                </td>
                              );
                            }
                            return null;
                          }
                          if (cell === "occupied") return null;
                          return (
                            <td
                              key={s.id + "-" + dayIdx + "-" + slot}
                              className="border border-gray-200 bg-white hover:bg-yellow-50 cursor-pointer text-xs align-top"
                              style={{ borderTop: isHour ? "2px solid #bbb" : "1px dotted #bbb", height: '28px' }}
                              onClick={() => {
                                if (isSlotBlocked(s.id, slot)) {
                                  // Find the block time object for this slot
                                  const block = blockTimes.find(block =>
                                    block.staff_id === s.id &&
                                    new Date(block.block_start) <= slot &&
                                    slot < new Date(block.block_end)
                                  );
                                  setBlockModalData(block);
                                  setBlockModalOpen(true);
                                } else {
                                  // existing booking/empty slot click logic
                                  openCreateModal(s, slot, dayIdx);
                                }
                              }}
                            ></td>
                          );
                        })
                      : staff.map((s) => {
                          if (isUnavailable(s, slot)) {
                            return (
                              <td
                                key={s.id + "-" + slot}
                                className="border border-gray-200 bg-gray-200 text-gray-400 text-xs align-top text-center"
                                style={{ borderTop: isHour ? "2px solid #bbb" : "1px dotted #bbb", height: '28px' }}
                              >
                                Unavailable
                              </td>
                            );
                          }
                          const cell = bookingGrid[s.id] && bookingGrid[s.id][rowIdx];
                          if (cell && cell !== "occupied") {
                            const slotsNeeded = minutesToSlots(cell.duration_minutes, slotInterval);
                            if (getSlotIndex(cell.booking_date, timeSlots) === rowIdx) {
                              const statusStyle = getStatusStyle(cell.status);
                              const cellKey = `${s.id}-${slot}`;
                              const isBlock = cell.is_block || cell.status === 'blocked';
                              console.log('CELL:', cell);
                              return (
                                <td
                                  key={s.id + '-' + slot}
                                  rowSpan={slotsNeeded}
                                  ref={el => { cellRefs.current[cellKey] = el; }}
                                  className={`calendar-cell border-2 ${isSlotBlocked(s.id, slot) ? 'border-gray-300 bg-gray-200' : statusStyle.border + ' bg-pink-50'} align-top relative cursor-pointer group hover:bg-yellow-100 transition`}
                                  onMouseEnter={() => setHoveredBookingId(cellKey)}
                                  onMouseLeave={() => setHoveredBookingId(null)}
                                  onClick={() => handlePopover(cell)}
                                  onContextMenu={(e) => handleRightClick(e, cellKey)}
                                  style={{ borderTop: isHour ? '2px solid #bbb' : '1px dotted #bbb', height: '28px', borderColor: isSlotBlocked(s.id, slot) ? '#ccc' : undefined }}
                                >
                                  {/* Render content for both appointments and block times */}
                                  <div className="flex items-center gap-2">
                                    {isSlotBlocked(s.id, slot) ? (
                                      <>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-semibold text-gray-700 text-xs truncate">Blocked time</div>
                                          <div className="text-gray-600 text-xs truncate">{cell.block_description || 'No description'}</div>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-pink-200 text-pink-900 font-bold text-xs">
                                          {getInitials(cell.client_name)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-semibold text-pink-800 text-xs truncate">{cell.client_name}</div>
                                          <div className="text-pink-700 text-xs truncate">{cell.service_name}</div>
                                        </div>
                                        <span className="ml-1 text-lg" title={cell.status}>{statusStyle.icon}</span>
                                      </>
                                    )}
                                  </div>
                                  {/* Tooltip for block time (unchanged) */}
                                  {hoveredBookingId === cellKey && isSlotBlocked(s.id, slot) && (
                                    <div
                                      className={`absolute z-10 top-1/2 -translate-y-1/2 w-64 bg-white border border-gray-300 shadow-lg p-0 rounded-xl pointer-events-none ${tooltipSide === 'right' ? 'left-full ml-2' : 'right-full mr-2'}`}
                                    >
                                      <div className="bg-gray-200 rounded-t-xl px-4 py-2 text-xs font-semibold text-gray-700 border-b border-gray-300">Blocked time</div>
                                      <div className="px-4 py-2 text-xs text-gray-700">
                                        <div className="mb-1"><strong>{s.name}</strong></div>
                                        <div><strong>Start date</strong> {new Date(cell.booking_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                        <div><strong>End date</strong> {cell.block_end ? new Date(cell.block_end).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : ''}</div>
                                        {cell.last_updated_by && cell.last_updated_at && (
                                          <div className="mt-2 text-[11px] text-gray-500">Last updated by {cell.last_updated_by} on {new Date(cell.last_updated_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {/* Appointment tooltip */}
                                  {hoveredBookingId === cellKey && !isSlotBlocked(s.id, slot) && (
                                    <div
                                      className={`absolute z-10 top-1/2 -translate-y-1/2 w-64 bg-white border border-gray-300 shadow-lg p-0 rounded-xl pointer-events-none ${tooltipSide === 'right' ? 'left-full ml-2' : 'right-full mr-2'}`}
                                    >
                                      <div className="bg-pink-100 rounded-t-xl px-4 py-2 text-xs font-semibold text-pink-700 border-b border-gray-300">Appointment</div>
                                      <div className="px-4 py-2 text-xs text-gray-700">
                                        <div className="mb-1"><strong>Client:</strong> {cell.client_name}</div>
                                        <div className="mb-1"><strong>Service:</strong> {cell.service_name}</div>
                                        <div className="mb-1"><strong>Status:</strong> {cell.status}</div>
                                        <div className="mb-1"><strong>Start:</strong> {new Date(cell.booking_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                        <div className="mb-1"><strong>Duration:</strong> {cell.duration_minutes} min</div>
                                        {cell.email && <div className="mb-1"><strong>Email:</strong> {cell.email}</div>}
                                        {cell.phone && <div className="mb-1"><strong>Phone:</strong> {cell.phone}</div>}
                                        {cell.notes && <div className="mb-1"><strong>Notes:</strong> {cell.notes}</div>}
                                      </div>
                                    </div>
                                  )}
                                </td>
                              );
                            }
                            return null;
                          }
                          if (cell === "occupied") return null;
                          return (
                            <td
                              key={s.id + "-" + slot}
                              className="border border-gray-200 bg-white hover:bg-yellow-50 cursor-pointer text-xs align-top"
                              style={{ borderTop: isHour ? "2px solid #bbb" : "1px dotted #bbb", height: '28px' }}
                              onClick={() => openCreateModal(s, slot)}
                            ></td>
                          );
                        })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Real-time now line */}
          {view === "day" && nowPosition !== null && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-red-500 z-30 pointer-events-none"
              style={{ top: nowPosition }}
            >
              <div className="absolute left-0 -top-2 w-2 h-4 bg-red-500 rounded-r"></div>
            </div>
          )}
        </div>

        {/* Booking Modal */}
        <BookingModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveBooking}
          onDelete={handleDeleteBooking}
          staffList={staff}
          booking={modalMode === "edit" ? selectedBooking : null}
          slot={modalSlot}
          mode={modalMode}
          onRefresh={() => {
            console.log("onRefresh called in AdvancedStaffCalendar");
            if (typeof onRefresh === "function") onRefresh();
          }}
          setSelectedDate={setSelectedDate}
        />

        {/* Staff Modal */}
        <StaffModal
          open={staffModalOpen}
          onClose={() => setStaffModalOpen(false)}
          onSave={handleSaveStaff}
          staff={editingStaff}
          mode={editingStaff ? "edit" : "create"}
        />

        {/* BlockTimeModal */}
        <BlockTimeModal
          open={blockModalOpen}
          onClose={() => { setBlockModalOpen(false); setBlockModalData(null); }}
          onSave={handleBlockTimeSave}
          initialData={blockModalData}
          staffList={staff}
        />

        {/* BookingDetailsModal */}
        <BookingDetailsModal
          open={detailsModalOpen}
          onClose={() => { setDetailsModalOpen(false); setDetailsModalBooking(null); setDetailsModalCustomer(null); setDetailsModalIsFirstVisit(true); }}
          booking={detailsModalBooking}
          customer={detailsModalCustomer}
          staffList={staff}
          isFirstVisit={detailsModalIsFirstVisit}
          onAddNote={handleAddNote}
          onNoShow={handleNoShow}
          onCancelAppointment={handleCancelAppointment}
          onEdit={() => { openEditModal(detailsModalBooking); setDetailsModalOpen(false); setDetailsModalBooking(null); setDetailsModalCustomer(null); setDetailsModalIsFirstVisit(true); }}
          onCancel={() => { handleDeleteBooking(detailsModalBooking); setDetailsModalOpen(false); setDetailsModalBooking(null); setDetailsModalCustomer(null); setDetailsModalIsFirstVisit(true); }}
          onMarkArrived={() => { /* mark as arrived logic */ setDetailsModalOpen(false); setDetailsModalBooking(null); setDetailsModalCustomer(null); setDetailsModalIsFirstVisit(true); }}
          onViewClientDetails={handleViewClientDetails}
        />
        {/* ClientDetailsModal */}
        <ClientDetailsModal
          open={clientDetailsOpen}
          onClose={() => setClientDetailsOpen(false)}
          client={clientDetailsClient}
          allBookings={bookings}
          staffList={staff}
        />
      </div>
    </div>
  );
}