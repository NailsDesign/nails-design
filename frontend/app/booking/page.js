"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { Tab, Dialog } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { enGB } from 'date-fns/locale';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getApiUrl } from '../../config/api';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Example holidays (yyyy-mm-dd)
const holidays = [
  '2024-12-25', // Christmas Day
  '2024-12-26', // Boxing Day
  '2025-01-01', // New Year's Day
  '2025-12-25', // Christmas Day 2025
  '2025-12-26', // Boxing Day 2025
  '2026-01-01'  // New Year's Day 2026
];

function isHoliday(date) {
  const dateString = date.toISOString().slice(0, 10);
  return holidays.includes(dateString);
}

function isOpen(date) {
  const day = date.getDay();
  const { start, end } = openHours[day];
  const h = date.getHours();
  return h >= start && h < end;
}

function isFormComplete(form, basket) {
  return (
    form.name.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    basket.length > 0 &&
    form.staff_id &&
    form.appointment_datetime
  );
}

// Opening hours for each day of the week (0 = Sunday, 1 = Monday, etc.)
const openHours = {
  0: { start: 11, end: 17.5 }, // Sunday: 11am-5:30pm (last booking 5pm)
  1: { start: 10, end: 19 },   // Monday: 10am-7pm (last booking 6:30pm)
  2: { start: 10, end: 19 },   // Tuesday: 10am-7pm (last booking 6:30pm)
  3: { start: 10, end: 19 },   // Wednesday: 10am-7pm (last booking 6:30pm)
  4: { start: 10, end: 19 },   // Thursday: 10am-7pm (last booking 6:30pm)
  5: { start: 10, end: 19 },   // Friday: 10am-7pm (last booking 6:30pm)
  6: { start: 10, end: 19 }    // Saturday: 10am-7pm (last booking 6:30pm)
};

// Generate time slots for a given date and opening hours
function generateTimeSlots(date, openHours) {
  const slots = [];
  const { start, end } = openHours;
  
  for (let hour = start; hour < end; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = new Date(date);
      time.setHours(hour, minute, 0, 0);
      slots.push(time);
    }
  }
  
  return slots;
}

// Helper to generate all possible time slots for a given day
function generateTimeSlotsForDay(date, openHours) {
  const slots = [];
  const day = date.getDay();
  const { start, end } = openHours[day];
  
  // Determine last booking time based on day
  const lastBookingHour = day === 0 ? 17 : 18.5; // Sunday: 5pm, others: 6:30pm
  const lastBookingMinute = day === 0 ? 0 : 30; // Sunday: 5:00pm, others: 6:30pm
  
  let current = new Date(date);
  current.setHours(Math.floor(start), (start % 1) * 60, 0, 0);
  
  while (
    current.getHours() < Math.floor(lastBookingHour) ||
    (current.getHours() === Math.floor(lastBookingHour) && current.getMinutes() <= lastBookingMinute)
  ) {
    slots.push(current.toTimeString().slice(0, 5));
    current = new Date(current.getTime() + 15 * 60000); // add 15 minutes
  }
  
  return slots;
}

// --- Service data (from screenshot) ---
const maniServices = [
  { name: "COLOUR REFRESH", description: "Our essential 25-minute manicure includes expert shaping and buffing, followed by a polish of your choice from our vibrant Colour Library.", duration: 25, price: 30 },
  { name: "CLASSIC MANICURE - POLISH", description: "Flawless nails, Expert shaping, buffing, cuticle care and moisturising, followed by a polish of your choice from our vibrant Colour Library.", duration: 40, price: 40 },
  { name: "CLASSIC MANICURE - GEL", description: "Flawless nails, Expert shaping, buffing, cuticle care and moisturising, followed by a chip-resistant gel of your choice from our vibrant Colour Library.", duration: 45, price: 42 },
  { name: "CLASSIC MANICURE - NO COLOUR", description: "Flawless nails, Expert shaping, buffing (with an optional matte or shine finish), cuticle care and moisturising, with no polish or gel for a natural mani alternative.", duration: 30, price: 32 },
];
const pediServices = [
  { name: "COLOUR REFRESH", description: "Our essential 25-minute pedicure includes expert shaping and buffing, followed by a polish of your choice from our vibrant Colour Library.", duration: 30, price: 30 },
  { name: "CLASSIC PEDICURE - POLISH", description: "Get flawless feet with the . Featuring a soak, expert shaping, buffing, cuticle care, hard skin filing and smoothing and moisturising, followed by a polish of your choice from our vibrant Colour Library.", duration: 50, price: 44 },
  { name: "CLASSIC PEDICURE - GEL", description: "Get flawless feet with the . Featuring a soak, expert shaping, buffing, cuticle care, hard skin filing, smoothing and moisturising, followed by your choice of chip-resistant gel from our vibrant Colour Library.", duration: 55, price: 48 },
  { name: "CLASSIC PEDICURE - NO COLOUR", description: "Get flawless feet with the ' Expert shaping, buffing (with an optional matte or shine finish), cuticle care, hard skin filing, smoothing and moisturising, with no polish or gel for a natural mani alternative.", duration: 40, price: 35 },
];
const maniPediServices = [
  // Manicures
  { name: "CLASSIC MANICURE - POLISH", description: "Flawless nails, Expert shaping, buffing, cuticle care and moisturising, followed by a polish of your choice from our vibrant Colour Library.", duration: 40, price: 40, group: "MANI-PEDI — MANICURES" },
  { name: "CLASSIC MANICURE - NO COLOUR", description: "Flawless nails, Expert shaping, buffing (with an optional matte or shine finish), cuticle care and moisturising, with no polish or gel for a natural mani alternative.", duration: 30, price: 32, group: "MANI-PEDI — MANICURES" },
  { name: "CLASSIC MANICURE - GEL", description: "Flawless nails, Expert shaping, buffing, cuticle care and moisturising, followed by a chip-resistant gel of your choice from our vibrant Colour Library.", duration: 45, price: 42, group: "MANI-PEDI — MANICURES" },
  // Pedicures
  { name: "FULL SET GEL EXTENSIONS", description: "Add natural-looking length to your nails with gel enhancements – a less damaging alternative to acrylics. Featuring our Signature Manicure with expert shaping, buffing, cuticle care, moisturising and nail extensions, followed by a polish or gel of your choice from our vibrant Colour Library.  .", duration: 125, price: 88, group: "MANI-PEDI — PEDICURES" },
  { name: "CLASSIC PEDICURE - GEL", description: "Get flawless feet with the . Featuring a soak, expert shaping, buffing, cuticle care, hard skin filing, smoothing and moisturising, followed by your choice of chip-resistant gel from our vibrant Colour Library.", duration: 55, price: 48 },
  { name: "CLASSIC PEDICURE - NO COLOUR", description: "Get flawless feet with the ' Expert shaping, buffing (with an optional matte or shine finish), cuticle care, hard skin filing, smoothing and moisturising, with no polish or gel for a natural mani alternative.", duration: 40, price: 35 },
  { name: "CLASSIC PEDICURE - POLISH", description: "Get flawless feet with the . Featuring a soak, expert shaping, buffing, cuticle care, hard skin filing and smoothing and moisturising, followed by a polish of your choice from our vibrant Colour Library.", duration: 50, price: 44 },
];

// Nail Extension & Enhancements
const nailExtensionEnhancements = [
  { name: "Acrylic Extensions", description: "Classic acrylic nail extensions for added length and strength.", duration: 60, price: 45 },
  { name: "Gel Extensions", description: "Flexible and natural-looking gel nail extensions.", duration: 60, price: 50 },
  { name: "SNS Extensions", description: "Lightweight SNS dipping powder extensions.", duration: 60, price: 48 },
  { name: "BIAB Enhancements", description: "Builder in a Bottle for extra strength and durability.", duration: 60, price: 52 },
  { name: "Others (specify if needed)", description: "Custom enhancements or requests.", duration: 60, price: 0 }
];

// Add-ons for all services
const addOnOptions = [
  'BIAB',
  'French Tip',
  'Shellac',
  'Acrylic',
  'SNS Dipping Powder',
  'Gel Polish'
];

// Removal options for all add-ons
const removalOptions = [
  'BIAB Removal',
  'French Tip Removal',
  'Shellac Removal',
  'Acrylic Removal',
  'SNS Dipping Powder Removal',
  'Gel Polish Removal'
];

// Example add-ons data (expand as needed)
const allAddOns = [
  {
    name: 'BIAB',
    description: 'Builder in a Bottle for extra strength and durability.',
    duration: 20,
    price: 15
  },
  {
    name: 'French Tip',
    description: 'Classic French tip in white or any color.',
    duration: 15,
    price: 10
  },
  {
    name: 'Shellac',
    description: 'Long-lasting Shellac polish.',
    duration: 20,
    price: 15
  },
  {
    name: 'Acrylic',
    description: 'Acrylic overlay or extensions.',
    duration: 30,
    price: 20
  },
  {
    name: 'SNS Dipping Powder',
    description: 'Strong, lightweight SNS dipping powder.',
    duration: 25,
    price: 18
  },
  {
    name: 'Gel Polish',
    description: 'Chip-resistant gel polish.',
    duration: 20,
    price: 12
  }
];

export default function BookingPage() {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [basket, setBasket] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    staff_id: "",
    appointment_datetime: ""
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null); // Store logged-in user
  const [authTab, setAuthTab] = useState(0); // 0: Login, 1: Register
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    birth_date: ""
  });
  const [authError, setAuthError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false); // Only one modal for auth
  const [showLogin, setShowLogin] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedManiPediManicure, setSelectedManiPediManicure] = useState(null);
  const [selectedManiPediPedicure, setSelectedManiPediPedicure] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [noAddOns, setNoAddOns] = useState(false);
  const [needsRemoval, setNeedsRemoval] = useState(null);
  const [selectedRemovalType, setSelectedRemovalType] = useState(null);
  const [step1Stage, setStep1Stage] = useState('service');
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoError, setPromoError] = useState("");
  const [agreementChecked, setAgreementChecked] = useState(false);

  // Real-time clock for time slot updates
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch services and staff on mount
 useEffect(() => {
  axios.get(getApiUrl("/services")).then((res) => setServices(res.data));
    axios.get(getApiUrl("/staff")).then((res) => setStaff(res.data)).catch(() => {
      // Fallback staff data if API fails
      setStaff([
        {
          id: 1,
          first_name: "Sarah",
          last_name: "Johnson",
          specialization: "Nail Specialist"
        },
        {
          id: 2,
          first_name: "Emma",
          last_name: "Davis",
          specialization: "Senior Nail Technician"
        },
        {
          id: 3,
          first_name: "Maria",
          last_name: "Garcia",
          specialization: "Nail Artist"
        }
      ]);
    });
}, []);

  // Fetch booked slots for selected staff and date
  useEffect(() => {
  if (!selectedDate || !form.staff_id) return;
  const dayString = selectedDate.toISOString().slice(0, 10);
  axios
    .get(getApiUrl(`/appointments/by-day?date=${dayString}&staff_id=${form.staff_id}`))
    .then(res => {
      setBookedSlots(res.data.map(dt =>
        new Date(dt).toTimeString().slice(0, 5)
      ));
    });
}, [selectedDate, form.staff_id]);

  // Check for JWT in localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

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

  const addToBasket = (service) => {
    if (!basket.find(s => s.id === service.id)) {
      setBasket([...basket, service]);
    }
  };

  const removeFromBasket = (serviceId) => {
    setBasket(basket.filter(s => s.id !== serviceId));
  };

  const totalPrice = basket.reduce((sum, s) => sum + Number(s.price), 0);
  const totalDuration = basket.reduce((sum, s) => sum + Number(s.duration_minutes), 0);

  async function finalizeBooking({
    customer_id,
    staff_id,
    service_ids,
    appointment_datetime,
    promo_code
  }) {
    try {
      const res = await axios.post(getApiUrl("/api/bookings/finalize"), {
        customer_id,
        staff_id,
        service_ids,
        appointment_datetime,
        promo_code
      });
      return res.data; // { success: true, booking_id }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        throw new Error(err.response.data.error);
      }
      throw new Error("Booking failed. Please try again.");
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!isFormComplete(form, basket)) {
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
      setError("Please pick a time during our opening hours: Mon–Sat: 10am–7pm, Sun: 11am–5:30pm.");
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
      // Replace with actual customer_id (from logged-in user)
      const customer_id = user?.id;
      const staff_id = form.staff_id;
      const service_ids = basket.map(s => s.id);
      const appointment_datetime = form.appointment_datetime;
      const promo_code = appliedPromo ? promoCode : null;

      const result = await finalizeBooking({
        customer_id,
        staff_id,
        service_ids,
        appointment_datetime,
        promo_code
      });

      if (result.success) {
      setSuccess(true);
        // Optionally redirect to confirmation page:
        // router.push(`/booking/confirmation?booking_id=${result.booking_id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (step1Stage === 'service') {
        if (selectedCategory === 'Mani & Pedi') {
          if (!(selectedManiPediManicure && selectedManiPediPedicure)) {
            setError("Please select one manicure and one pedicure to continue.");
            return;
          }
          setBasket([selectedManiPediManicure, selectedManiPediPedicure]);
          setStep1Stage('addons');
      setError("");
          return;
        } else {
          if (!selectedService) {
            setError("Please select a service to continue.");
            return;
          }
          setBasket([selectedService]);
          setStep1Stage('addons');
          setError("");
          return;
        }
      }
      if (step1Stage === 'addons') {
        if (!(selectedAddOns.length > 0 || noAddOns)) {
          setError("Please select at least one add-on or choose 'No Addons'.");
          return;
        }
        setError("");
        setStep1Stage('removal');
        return;
      }
      if (step1Stage === 'removal') {
        if (needsRemoval === false) {
          setCurrentStep(2);
          setStep1Stage('service');
          setError("");
          return;
        }
        if (needsRemoval === null) {
          setError("Please indicate if you need removal.");
          return;
        }
        if (needsRemoval && !selectedRemovalType) {
          setError("Please select a removal type.");
          return;
        }
        setCurrentStep(2);
        setStep1Stage('service');
        setError("");
        return;
      }
      if (step1Stage === 'removalType') {
        if (!selectedRemovalType) {
          setError("Please select a removal type.");
          return;
        }
        setCurrentStep(2);
        setStep1Stage('service');
        setError("");
        return;
      }
    }
    if (currentStep === 2) {
      if (!form.staff_id) {
        setError("Please select a staff member.");
        return;
      }
      if (!selectedDate) {
        setError("Please select a date.");
        return;
      }
      if (!form.appointment_datetime) {
        setError("Please select a time slot.");
        return;
      }
      setCurrentStep(3);
      setError("");
      return;
    }
  };

  const prevStep = () => {
    if (currentStep === 1) {
      if (step1Stage === 'service') {
        setError("");
        setBasket([]);
        // Optionally: go back to homepage or do nothing
      } else if (step1Stage === 'addons') {
        setStep1Stage('service');
        setError("");
      } else if (step1Stage === 'removal') {
        setStep1Stage('addons');
        setError("");
      }
    } else if (currentStep === 2) {
      setCurrentStep(1);
      setStep1Stage('removal');
      setError("");
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setError("");
    }
  };

  // Auth handlers
  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
    setAuthError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(getApiUrl("/customers/login"), {
        email: authForm.email,
        password: authForm.password
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      setAuthError("");
      setShowAuthModal(false); // Close modal
      setCurrentStep(3); // Advance to step 3
      window.dispatchEvent(new Event('authChanged'));
    } catch (err) {
      setAuthError(err.response?.data?.error || "Login failed.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(getApiUrl("/customers/register"), {
        first_name: authForm.first_name,
        last_name: authForm.last_name,
        email: authForm.email,
        phone: authForm.phone,
        birth_date: authForm.birth_date,
        password: authForm.password
      });
      // Now log in the user
      const res = await axios.post(getApiUrl("/customers/login"), {
        email: authForm.email,
        password: authForm.password
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      setAuthError("");
      setShowAuthModal(false); // Close modal
      setCurrentStep(3); // Advance to step 3
      window.dispatchEvent(new Event('authChanged'));
    } catch (err) {
      setAuthError(err.response?.data?.error || "Registration failed.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    // TODO: Call backend endpoint to send verification code
    setForgotSuccess(true);
  };

  // Reservation timer for confirmation step
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const timerRef = useRef();
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  useEffect(() => {
    if (currentStep !== 3) return;
    setTimer(300); // Reset timer when entering confirmation step
    timerRef.current = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [currentStep]);
  useEffect(() => {
    if (timer <= 0 && timerRef.current) {
      clearInterval(timerRef.current);
      if (currentStep === 3) setShowExpiredModal(true);
    }
  }, [timer]);

  // Persist step1Stage to localStorage on change
  useEffect(() => {
    localStorage.setItem('booking_step1Stage', step1Stage);
  }, [step1Stage]);

  // Multiple promo codes logic
  const promoCodes = {
    WELCOME10: { discount: 10, message: "£10 off your first booking!" },
    SUMMER5: { discount: 5, message: "£5 off summer special!" },
    VIP20: { discount: 20, message: "VIP: £20 off!" }
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (promoCodes[code]) {
      setAppliedPromo(true);
      setPromoError("");
      setPromoDiscount(promoCodes[code].discount);
      setPromoMessage(promoCodes[code].message);
    } else {
      setAppliedPromo(false);
      setPromoError("Invalid promo code.");
      setPromoDiscount(0);
      setPromoMessage("");
    }
  };

  // Add to component state:
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Helper to get all days in the current month
  function getDaysInMonth(monthDate) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const days = [];
    const date = new Date(year, month, 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove time for accurate comparison

    while (date.getMonth() === month) {
      if (date >= today) {
        days.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    return days;
  }

  // Month navigation handlers
  const goToPrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Add this before rendering the month navigation
  const isCurrentMonth = (
    currentMonth.getFullYear() === new Date().getFullYear() &&
    currentMonth.getMonth() === new Date().getMonth()
  );

  if (success) {
  return (
      <main className="min-h-screen bg-gradient-to-br from-[#fef9f5] to-[#faf6f0] flex items-center justify-center p-4">
        <div className="max-w-md mx-auto">
          <div className="service-card p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#2d1b0e] mb-4">Booking Confirmed! 🎉</h2>
            <p className="text-[#5d4e37] mb-8 text-lg">We'll contact you soon to confirm your appointment details.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fef9f5] to-[#faf6f0]">
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <span className="text-4xl mb-4 block">💅</span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#2d1b0e] mb-4">
              Book Your Appointment
            </h1>
            <p className="text-lg md:text-xl text-[#5d4e37] max-w-2xl mx-auto">
              Choose your services and secure your spot with our expert technicians
            </p>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-[#8b7d6b]">
              <span>⭐</span>
              <span>5-Star Rated</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#8b7d6b]">
              <span>🧼</span>
              <span>Hygiene First</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#8b7d6b]">
              <span>⏰</span>
              <span>On Time</span>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="flex justify-center w-full mb-8">
          <div className="relative w-full max-w-2xl">
            {/* Progress background */}
            <div className="absolute inset-0 rounded-full overflow-hidden" aria-hidden="true">
              <div 
                className="h-full transition-all duration-500 bg-gradient-to-r from-[#d4af37] to-[#b87333]" 
                style={{ width: `${(currentStep/3)*100}%` }}
              ></div>
              <div className="h-full w-full bg-[#e8dcc0] rounded-full absolute left-0 top-0"></div>
            </div>
            
            {/* Progress steps */}
            <div className="relative flex items-center justify-between w-full px-4 py-3">
              {[1, 2, 3].map((step, idx) => {
                const stepLabels = ['Services', 'Details', 'Confirm'];
                const stepIcons = ['💅', '📅', '✅'];
                const isActive = currentStep === step;
                const isCompleted = currentStep > step;
                return (
                  <button
                    key={step}
                    type="button"
                    className="flex flex-col items-center flex-1 focus:outline-none"
                    onClick={() => { if (isCompleted) setCurrentStep(step); }}
                    disabled={!isCompleted && !isActive}
                  >
                    <span className={`flex items-center gap-3 text-base md:text-lg transition-all duration-300
                      ${isActive ? 'font-bold text-[#2d1b0e]' : 'font-medium text-[#8b7d6b]'}`}
                    >
                      <span className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg transition-all duration-300
                        ${isActive ? 'bg-white text-[#d4af37] shadow-lg' : 
                          isCompleted ? 'bg-[#d4af37] text-white' : 'bg-[#e8dcc0] text-[#8b7d6b]'}`}>
                        {stepIcons[step-1]}
                      </span>
                      <span className="hidden sm:block">{stepLabels[step-1]}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error Message */}
      {error && (
          <div className="w-full max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex justify-center items-start w-full">
          <div className="w-full max-w-4xl">
            <AnimatePresence mode="wait">
              {currentStep === 1 && step1Stage === 'service' && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="service-card p-8">
                    <h2 className="text-center text-3xl md:text-4xl font-bold text-[#2d1b0e] mb-8">
                      Choose Your Service
                    </h2>
                    
                    {/* Service Categories */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                      {/* MANI */}
                      <button
                        onClick={() => setSelectedCategory('Mani')}
                        className={`service-card p-6 text-center transition-all duration-300 group
                          ${selectedCategory === 'Mani' ? 'ring-2 ring-[#d4af37] bg-gradient-to-br from-[#d4af37]/10 to-[#b87333]/10' : 
                            'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'}`}
                      >
                        <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-300">💅</span>
                        <h3 className="text-xl md:text-2xl font-bold text-[#2d1b0e] mb-2">Manicure</h3>
                        <p className="text-[#8b7d6b] text-sm">Perfect nails for any occasion</p>
                      </button>

                      {/* MANI-PEDI */}
                      <button
                        onClick={() => setSelectedCategory('Mani & Pedi')}
                        className={`service-card p-6 text-center transition-all duration-300 group relative
                          ${selectedCategory === 'Mani & Pedi' ? 'ring-2 ring-[#d4af37] bg-gradient-to-br from-[#d4af37]/10 to-[#b87333]/10' : 
                            'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'}`}
                      >
                        <span className="absolute top-3 right-3 bg-gradient-to-r from-[#d4af37] to-[#b87333] text-white text-xs font-bold rounded-full px-3 py-1">
                          Most Popular
                        </span>
                        <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-300">🖐️</span>
                        <h3 className="text-xl md:text-2xl font-bold text-[#2d1b0e] mb-2">Mani & Pedi</h3>
                        <p className="text-[#8b7d6b] text-sm">Complete nail care experience</p>
                      </button>

                      {/* PEDI */}
                      <button
                        onClick={() => setSelectedCategory('Pedi')}
                        className={`service-card p-6 text-center transition-all duration-300 group
                          ${selectedCategory === 'Pedi' ? 'ring-2 ring-[#d4af37] bg-gradient-to-br from-[#d4af37]/10 to-[#b87333]/10' : 
                            'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'}`}
                      >
                        <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-300">🦶</span>
                        <h3 className="text-xl md:text-2xl font-bold text-[#2d1b0e] mb-2">Pedicure</h3>
                        <p className="text-[#8b7d6b] text-sm">Beautiful feet for sandal season</p>
                      </button>

                      {/* EXTENSIONS */}
                      <button
                        onClick={() => setSelectedCategory('Nail Extension & Enhancements')}
                        className={`service-card p-6 text-center transition-all duration-300 group
                          ${selectedCategory === 'Nail Extension & Enhancements' ? 'ring-2 ring-[#d4af37] bg-gradient-to-br from-[#d4af37]/10 to-[#b87333]/10' : 
                            'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'}`}
                      >
                        <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-300">✨</span>
                        <h3 className="text-xl md:text-2xl font-bold text-[#2d1b0e] mb-2">Extensions</h3>
                        <p className="text-[#8b7d6b] text-sm">Add length and strength</p>
                      </button>
                    </div>

                    {/* Service List */}
                    {selectedCategory === 'Mani & Pedi' ? (
                      <div className="space-y-8">
                        {/* MANI-PEDI — MANICURES */}
                        <div>
                          <h4 className="text-xl font-bold text-[#2d1b0e] mb-4 flex items-center gap-2">
                            <span>💅</span>
                            Manicures
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {maniPediServices.filter(s => s.group === 'MANI-PEDI — MANICURES').map(service => (
                              <div
                                key={service.name}
                                className={`service-card p-4 cursor-pointer transition-all duration-300
                                  ${selectedManiPediManicure && selectedManiPediManicure.name === service.name ? 
                                    'ring-2 ring-[#d4af37] bg-gradient-to-br from-[#d4af37]/10 to-[#b87333]/10' : 
                                    'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'}`}
                                onClick={() => setSelectedManiPediManicure(selectedManiPediManicure && selectedManiPediManicure.name === service.name ? null : service)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{service.name}</h5>
                                  <div className="price-tag text-xs">
                                    £{service.price}
                                  </div>
                                </div>
                                <p className="text-[#8b7d6b] text-xs mb-2">{service.description}</p>
                                <div className="flex items-center gap-2 text-xs text-[#8b7d6b]">
                                  <span>⏱️</span>
                                  <span>{service.duration} mins</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* MANI-PEDI — PEDICURES */}
                        <div>
                          <h4 className="text-xl font-bold text-[#2d1b0e] mb-4 flex items-center gap-2">
                            <span>🦶</span>
                            Pedicures
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {maniPediServices.filter(s => s.group === 'MANI-PEDI — PEDICURES' || !s.group).map(service => (
                              <div
                                key={service.name}
                                className={`service-card p-4 cursor-pointer transition-all duration-300
                                  ${selectedManiPediPedicure && selectedManiPediPedicure.name === service.name ? 
                                    'ring-2 ring-[#d4af37] bg-gradient-to-br from-[#d4af37]/10 to-[#b87333]/10' : 
                                    'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'}`}
                                onClick={() => setSelectedManiPediPedicure(selectedManiPediPedicure && selectedManiPediPedicure.name === service.name ? null : service)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{service.name}</h5>
                                  <div className="price-tag text-xs">
                                    £{service.price}
                                  </div>
                                </div>
                                <p className="text-[#8b7d6b] text-xs mb-2">{service.description}</p>
                                <div className="flex items-center gap-2 text-xs text-[#8b7d6b]">
                                  <span>⏱️</span>
                                  <span>{service.duration} mins</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : selectedCategory === 'Mani' ? (
        <div>
                        <h4 className="text-xl font-bold text-[#2d1b0e] mb-6 flex items-center gap-2">
                          <span>💅</span>
                          Manicure Services
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {maniServices.map(service => (
                            <div
                              key={service.name}
                              className={`service-card p-4 cursor-pointer transition-all duration-300
                                ${selectedService && selectedService.name === service.name ? 
                                  'ring-2 ring-[#d4af37] bg-gradient-to-br from-[#d4af37]/10 to-[#b87333]/10' : 
                                  'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'}`}
                              onClick={() => setSelectedService(selectedService && selectedService.name === service.name ? null : service)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{service.name}</h5>
                                <div className="price-tag text-xs">
                                  £{service.price}
                                </div>
                              </div>
                              <p className="text-[#8b7d6b] text-xs mb-2">{service.description}</p>
                              <div className="flex items-center gap-2 text-xs text-[#8b7d6b]">
                                <span>⏱️</span>
                                <span>{service.duration} mins</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : selectedCategory === 'Pedi' ? (
                      <div>
                        <h4 className="text-xl font-bold text-[#2d1b0e] mb-6 flex items-center gap-2">
                          <span>🦶</span>
                          Pedicure Services
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pediServices.map(service => (
                            <div
                              key={service.name}
                              className={`service-card p-4 cursor-pointer transition-all duration-300
                                ${selectedService && selectedService.name === service.name ? 
                                  'ring-2 ring-[#d4af37] bg-gradient-to-br from-[#d4af37]/10 to-[#b87333]/10' : 
                                  'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'}`}
                              onClick={() => setSelectedService(selectedService && selectedService.name === service.name ? null : service)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{service.name}</h5>
                                <div className="price-tag text-xs">
                                  £{service.price}
                                </div>
                              </div>
                              <p className="text-[#8b7d6b] text-xs mb-2">{service.description}</p>
                              <div className="flex items-center gap-2 text-xs text-[#8b7d6b]">
                                <span>⏱️</span>
                                <span>{service.duration} mins</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : selectedCategory === 'Nail Extension & Enhancements' ? (
                      <div>
                        <h4 className="text-xl font-bold text-[#2d1b0e] mb-6 flex items-center gap-2">
                          <span>✨</span>
                          Nail Extensions & Enhancements
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {nailExtensionEnhancements.map(service => (
                            <div
                              key={service.name}
                              className={`service-card p-4 cursor-pointer transition-all duration-300
                                ${selectedService && selectedService.name === service.name ? 
                                  'ring-2 ring-[#d4af37] bg-gradient-to-br from-[#d4af37]/10 to-[#b87333]/10' : 
                                  'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'}`}
                              onClick={() => setSelectedService(selectedService && selectedService.name === service.name ? null : service)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{service.name}</h5>
                                <div className="price-tag text-xs">
                                  £{service.price}
                                </div>
                              </div>
                              <p className="text-[#8b7d6b] text-xs mb-2">{service.description}</p>
                              <div className="flex items-center gap-2 text-xs text-[#8b7d6b]">
                                <span>⏱️</span>
                                <span>{service.duration} mins</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-[#8b7d6b] py-8">
                        <span className="text-4xl mb-4 block">💅</span>
                        <p className="text-lg">Select a service category above to see available options</p>
                      </div>
                    )}

                    {/* Next Button */}
                    {selectedCategory && (
                      <div className="mt-8 text-center">
                        <button
                          onClick={nextStep}
                          className="btn-primary"
                          disabled={
                            selectedCategory === 'Mani & Pedi' 
                              ? !(selectedManiPediManicure && selectedManiPediPedicure)
                              : !selectedService
                          }
                        >
                          Continue to Add-ons
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Add-ons Step */}
              {currentStep === 1 && step1Stage === 'addons' && (
                <motion.div
                  key="addons"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="service-card p-8">
                    <h2 className="text-center text-3xl md:text-4xl font-bold text-[#2d1b0e] mb-8">
                      Choose Your Add-ons
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {allAddOns.map(addon => (
                        <div
                          key={addon.name}
                          className={`service-card p-4 cursor-pointer transition-all duration-300
                            ${selectedAddOns.includes(addon.name) ? 
                              'ring-2 ring-[#d4af37] bg-gradient-to-br from-[#d4af37]/10 to-[#b87333]/10' : 
                              'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'}`}
                          onClick={() => {
                            if (selectedAddOns.includes(addon.name)) {
                              setSelectedAddOns(selectedAddOns.filter(a => a !== addon.name));
                              setNoAddOns(false);
                            } else {
                              setSelectedAddOns([...selectedAddOns, addon.name]);
                              setNoAddOns(false);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{addon.name}</h5>
                            <div className="price-tag text-xs">
                              £{addon.price}
                            </div>
                          </div>
                          <p className="text-[#8b7d6b] text-xs mb-2">{addon.description}</p>
                          <div className="flex items-center gap-2 text-xs text-[#8b7d6b]">
                            <span>⏱️</span>
                            <span>{addon.duration} mins</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-center mb-8">
                      <button
                        className={`service-card p-4 w-full transition-all duration-300 ${
                          noAddOns ? 'ring-2 ring-[#d4af37] bg-gradient-to-br from-[#d4af37]/10 to-[#b87333]/10' : 
                          'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'
                        }`}
                        onClick={() => {
                          setNoAddOns(true);
                          setSelectedAddOns([]);
                          setStep1Stage('removal');
                        }}
                      >
                        <span className="text-lg font-bold text-[#2d1b0e]">No Add-ons Needed</span>
                      </button>
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => setStep1Stage('service')}
                        className="btn-secondary"
                      >
                        Back to Services
                      </button>
                      <button
                        onClick={nextStep}
                        className="btn-primary"
                        disabled={!(selectedAddOns.length > 0 || noAddOns)}
                      >
                        Continue to Removal
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Removal Step */}
              {currentStep === 1 && step1Stage === 'removal' && (
                <motion.div
                  key="removal"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="service-card p-8">
                    <h2 className="text-center text-3xl md:text-4xl font-bold text-[#2d1b0e] mb-8">
                      Do You Need Removal?
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <button
                        className={`service-card p-8 text-center transition-all duration-300 ${
                          needsRemoval === true ? 'ring-2 ring-[#d4af37] bg-gradient-to-br from-[#d4af37]/10 to-[#b87333]/10' : 
                          'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'
                        }`}
                        onClick={() => {
                          setNeedsRemoval(true);
                          setStep1Stage('removalType');
                        }}
                      >
                        <span className="text-2xl mb-4 block">🧽</span>
                        <span className="text-xl font-bold text-[#2d1b0e]">Yes, I need removal</span>
                      </button>
                      <button
                        className={`service-card p-8 text-center transition-all duration-300 ${
                          needsRemoval === false ? 'ring-2 ring-[#d4af37] bg-gradient-to-br from-[#d4af37]/10 to-[#b87333]/10' : 
                          'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'
                        }`}
                        onClick={() => {
                          setNeedsRemoval(false);
                          setCurrentStep(2);
                        }}
                      >
                        <span className="text-2xl mb-4 block">✨</span>
                        <span className="text-xl font-bold text-[#2d1b0e]">No removal needed</span>
                      </button>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={() => setStep1Stage('addons')}
                        className="btn-secondary"
                      >
                        Back to Add-ons
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Removal Type Step */}
              {currentStep === 1 && step1Stage === 'removalType' && (
                <motion.div
                  key="removalType"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="service-card p-8">
                    <h2 className="text-center text-3xl md:text-4xl font-bold text-[#2d1b0e] mb-8">
                      What Type of Removal?
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {removalOptions.map(option => (
                        <div
                          key={option}
                          className={`service-card p-4 cursor-pointer transition-all duration-300 ${
                            selectedRemovalType === option ? 
                              'ring-2 ring-[#d4af37] bg-gradient-to-br from-[#d4af37]/10 to-[#b87333]/10' : 
                              'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'
                          }`}
                          onClick={() => setSelectedRemovalType(option)}
                        >
                          <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base mb-2">{option}</h5>
                          <div className="flex justify-between items-center text-xs text-[#8b7d6b]">
                            <span>Duration varies</span>
                            <span>Price varies</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                      <button
                        onClick={() => {
                          setCurrentStep(1);
                          setStep1Stage('removal');
                        }}
                        className="btn-secondary"
                      >
                        Back to Removal
                      </button>
                      <button
                        onClick={() => {
                          setCurrentStep(2);
                          setStep1Stage('service');
                        }}
                        className="btn-primary"
                        disabled={!selectedRemovalType}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Staff & Time Selection */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="service-card p-8">
                    <h2 className="text-center text-3xl md:text-4xl font-bold text-[#2d1b0e] mb-8">
                      Choose Your Staff & Time
                    </h2>
                    
                    {/* Step 2 Content */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-[#2d1b0e] mb-2">Choose Your Details</h3>
                      <p className="text-[#8b7d6b]">Select your preferred staff member, date, and time</p>
                    </div>
                    
                    {/* Staff Selection */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-[#2d1b0e] mb-4">Available Staff:</h3>
                      {staff.length === 0 ? (
                        <p className="text-[#8b7d6b]">No staff available</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {staff.map(member => {
                            const isSelected = form.staff_id === member.id;
                            
                            return (
                              <div
                                key={member.id}
                                style={{
                                  padding: '16px',
                                  cursor: 'pointer',
                                  borderRadius: '12px',
                                  border: '2px solid',
                                  backgroundColor: isSelected ? '#fef3c7' : 'white',
                                  borderColor: isSelected ? '#f59e0b' : '#e5e7eb',
                                  transition: 'all 0.3s ease'
                                }}
                                onClick={() => {
                                  setForm(prevForm => ({ ...prevForm, staff_id: member.id }));
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gradient-to-r from-[#d4af37] to-[#b87333] rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-[#2d1b0e]">{member.first_name} {member.last_name}</h4>
                                    <p className="text-[#8b7d6b] text-sm">{member.specialization || 'Nail Specialist'}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {/* Date Selection */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-[#2d1b0e] mb-4 flex items-center gap-2">
                        <span>📅</span>
                        Select Your Date
                      </h3>
                      <div className="flex items-center justify-between mb-2">
                        <button
                          type="button"
                          onClick={goToPrevMonth}
                          className={`p-2 rounded-full hover:bg-gray-100 ${isCurrentMonth ? 'opacity-50 cursor-not-allowed' : ''}`}
                          aria-label="Previous Month"
                          disabled={isCurrentMonth}
                        >
                          <FaChevronLeft />
                        </button>
                        <div className="text-lg font-bold text-center flex-1">
                          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </div>
                        <button
                          type="button"
                          onClick={goToNextMonth}
                          className="p-2 rounded-full hover:bg-gray-100"
                          aria-label="Next Month"
                        >
                          <FaChevronRight />
                        </button>
                      </div>
                      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                        <div className="flex min-w-max gap-4 pb-2">
                          {getDaysInMonth(currentMonth).map(date => {
                            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                            return (
                              <button
                                key={date.toISOString()}
                                onClick={() => setSelectedDate(date)}
                                className={`flex flex-col items-center px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-[#d4af37] to-[#b87333] text-white border-yellow-600 shadow-lg'
                                    : 'bg-white text-[#2d1b0e] border-gray-200 hover:bg-gray-50'
                                }`}
                                style={{ minWidth: 64 }}
                              >
                                <span className="text-xs font-semibold uppercase tracking-widest">
                                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                <span className="text-lg font-bold">
                                  {date.getDate()}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Time Selection */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-[#2d1b0e] mb-4 flex items-center gap-2">
                        <span>⏰</span>
                        Select Your Time
                      </h3>
                      {selectedDate ? (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                          {generateTimeSlotsForDay(selectedDate, openHours).map(time => {
                            const [hours, minutes] = time.split(':').map(Number);
                            const year = selectedDate.getFullYear();
                            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                            const day = String(selectedDate.getDate()).padStart(2, '0');
                            const hour = String(hours).padStart(2, '0');
                            const minute = String(minutes).padStart(2, '0');
                            const datetimeString = `${year}-${month}-${day}T${hour}:${minute}`;
                            
                            return (
                              <button
                                key={time}
                                onClick={() => {
                                  setForm({ ...form, appointment_datetime: datetimeString });
                                }}
                                className={`p-3 text-center rounded-lg transition-all duration-300 border ${
                                  form.appointment_datetime === datetimeString
                                    ? 'bg-gradient-to-r from-[#d4af37] to-[#b87333] text-white'
                                    : 'bg-white hover:bg-gray-50'
                                }`}
                              >
                                {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[#8b7d6b] text-center py-4">Please select a date first to see available time slots</p>
                      )}
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                      <button
                        onClick={() => {
                          setCurrentStep(1);
                          setStep1Stage('removal');
                        }}
                        className="btn-secondary"
                      >
                        Back to Removal
                      </button>
                      <button
                        onClick={nextStep}
                        className="btn-primary"
                        disabled={!form.staff_id || !selectedDate || !form.appointment_datetime}
                      >
                        Continue to Confirmation
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="service-card p-8">
                    <h2 className="text-center text-3xl md:text-4xl font-bold text-[#2d1b0e] mb-8">
                      Confirm Your Booking
                    </h2>
                    
                    {/* Booking Summary */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-[#2d1b0e] mb-4">Booking Summary</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gradient-to-br from-[#d4af37]/5 to-[#b87333]/5 rounded-lg">
                          <span className="font-semibold text-[#2d1b0e]">Services:</span>
                          <span className="text-[#8b7d6b]">
                            {basket.map(service => service.name).join(', ')}
                          </span>
                        </div>
                        {selectedAddOns.length > 0 && (
                          <div className="flex justify-between items-center p-4 bg-gradient-to-br from-[#d4af37]/5 to-[#b87333]/5 rounded-lg">
                            <span className="font-semibold text-[#2d1b0e]">Add-ons:</span>
                            <span className="text-[#8b7d6b]">
                              {selectedAddOns.join(', ')}
                            </span>
                          </div>
                        )}
                        {needsRemoval && selectedRemovalType && (
                          <div className="flex justify-between items-center p-4 bg-gradient-to-br from-[#d4af37]/5 to-[#b87333]/5 rounded-lg">
                            <span className="font-semibold text-[#2d1b0e]">Removal:</span>
                            <span className="text-[#8b7d6b]">{selectedRemovalType}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center p-4 bg-gradient-to-br from-[#d4af37]/5 to-[#b87333]/5 rounded-lg">
                          <span className="font-semibold text-[#2d1b0e]">Date & Time:</span>
                          <span className="text-[#8b7d6b]">
                            {new Date(form.appointment_datetime).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })} at {new Date(form.appointment_datetime).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gradient-to-br from-[#d4af37]/5 to-[#b87333]/5 rounded-lg">
                          <span className="font-semibold text-[#2d1b0e]">Staff:</span>
                          <span className="text-[#8b7d6b]">
                            {staff.find(s => s.id === form.staff_id)?.first_name} {staff.find(s => s.id === form.staff_id)?.last_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Promo Code */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-[#2d1b0e] mb-4">Promo Code (Optional)</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 p-3 border border-[#d4af37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                        />
                        <button
                          onClick={handleApplyPromo}
                          className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b87333] text-white font-bold rounded-lg hover:from-[#b87333] hover:to-[#d4af37] transition-all duration-300"
                        >
                          Apply
                        </button>
          </div>
                      {promoError && <p className="text-red-500 text-sm mt-2">{promoError}</p>}
                      {promoMessage && <p className="text-green-600 text-sm mt-2">{promoMessage}</p>}
        </div>

                    {/* Agreement */}
                    <div className="mb-8">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreementChecked}
                          onChange={(e) => setAgreementChecked(e.target.checked)}
                          className="mt-1 w-4 h-4 text-[#d4af37] border-[#d4af37] rounded focus:ring-[#d4af37]"
                        />
                        <span className="text-[#8b7d6b] text-sm">
                          I agree to the terms and conditions and confirm that I will arrive on time for my appointment.
                        </span>
                      </label>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                      <button
                        onClick={() => {
                          setCurrentStep(1);
                          setStep1Stage('removal');
                        }}
                        className="btn-secondary"
                      >
                        Back to Removal
        </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={!agreementChecked}
                      >
                        Confirm Booking
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}



