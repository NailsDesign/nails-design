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

// Salon open hours
const openHours = {
  0: { start: 11, end: 17.5 }, // Sunday: 11-17:30
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

// Helper to generate all possible time slots for a given day
function generateTimeSlots(date, openHours) {
  const slots = [];
  const day = date.getDay();
  const { start, end } = openHours[day];
  let current = new Date(date);
  current.setHours(Math.floor(start), (start % 1) * 60, 0, 0);
  const endHour = Math.floor(end);
  const endMinute = (end % 1) * 60;
  while (
    current.getHours() < endHour ||
    (current.getHours() === endHour && current.getMinutes() < endMinute)
  ) {
    slots.push(current.toTimeString().slice(0, 5));
    current = new Date(current.getTime() + 5 * 60000); // add 5 minutes
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
  const [forgotSent, setForgotSent] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  // Real-time clock for time slot updates
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // --- Service selection state ---
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [noAddOns, setNoAddOns] = useState(false);
  const [needsRemoval, setNeedsRemoval] = useState(null);
  const [selectedRemovalType, setSelectedRemovalType] = useState(null);
  const [step1Stage, setStep1Stage] = useState('service');

  // --- Restore booking state from localStorage on mount (client only) ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedBasket = localStorage.getItem('booking_basket');
    if (savedBasket) setBasket(JSON.parse(savedBasket));
    const savedSelectedService = localStorage.getItem('booking_selectedService');
    if (savedSelectedService) setSelectedService(JSON.parse(savedSelectedService));
    const savedSelectedAddOns = localStorage.getItem('booking_selectedAddOns');
    if (savedSelectedAddOns) setSelectedAddOns(JSON.parse(savedSelectedAddOns));
    const savedSelectedRemovalType = localStorage.getItem('booking_selectedRemovalType');
    if (savedSelectedRemovalType) setSelectedRemovalType(JSON.parse(savedSelectedRemovalType));
    const savedForm = localStorage.getItem('booking_form');
    if (savedForm) setForm(JSON.parse(savedForm));
    const savedSelectedDate = localStorage.getItem('booking_selectedDate');
    if (savedSelectedDate) setSelectedDate(new Date(savedSelectedDate));
    const savedCurrentStep = localStorage.getItem('booking_currentStep');
    if (savedCurrentStep) setCurrentStep(Number(savedCurrentStep));
    const savedStep1Stage = localStorage.getItem('booking_step1Stage');
    if (savedStep1Stage) setStep1Stage(savedStep1Stage);

    // Advanced resume logic: set currentStep and step1Stage based on most complete info
    setTimeout(() => {
      const basket = localStorage.getItem('booking_basket');
      const form = localStorage.getItem('booking_form');
      const selectedDate = localStorage.getItem('booking_selectedDate');
      const step1Stage = localStorage.getItem('booking_step1Stage');
      const parsedBasket = basket ? JSON.parse(basket) : [];
      const parsedForm = form ? JSON.parse(form) : {};
      const staffId = parsedForm.staff_id;
      const appointment_datetime = parsedForm.appointment_datetime;
      const name = parsedForm.name;
      const email = parsedForm.email;
      const phone = parsedForm.phone;

      if (!basket || parsedBasket.length === 0) {
        setCurrentStep(1);
        setStep1Stage('service');
        return;
      }

      // If service selected but not add-ons/removal, resume at correct sub-step
      if (step1Stage && step1Stage !== 'service') {
        setCurrentStep(1);
        setStep1Stage(step1Stage);
        return;
      }

      if (!staffId || !selectedDate) {
        setCurrentStep(2);
        return;
      }

      if (staffId && selectedDate && name && email && phone && appointment_datetime) {
        setCurrentStep(3);
        return;
      }

      setCurrentStep(2);
    }, 0);
  }, []);

  // Fetch services and staff on mount
  useEffect(() => {
    axios.get(getApiUrl("/services")).then((res) => setServices(res.data));
    axios.get(getApiUrl("/staff")).then((res) => setStaff(res.data));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      await axios.post(getApiUrl("/appointments"), {
        ...form,
        service_ids: basket.map(s => s.id)
      });
      setSuccess(true);
      setError("");
      setForm({
        name: "",
        email: "",
        phone: "",
        staff_id: "",
        appointment_datetime: ""
      });
      setBasket([]);
      setSelectedDate(null);
      setCurrentStep(1);
    } catch (err) {
      setError("Sorry, booking failed. Please try again or contact us.");
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (step1Stage === 'service') {
        if (!selectedService) {
          setError("Please select a service to continue.");
          return;
        }
        setBasket([selectedService]);
        setStep1Stage('addons');
        setError("");
        return;
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
    } else if (currentStep === 2) {
      if (!form.staff_id || !selectedDate) {
        setError("Please select staff and appointment time.");
        return;
      }
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      setCurrentStep(3);
      setError("");
      return;
    } else if (currentStep === 3) {
      handleSubmit();
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
    setForgotSent(true);
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
      setPromoApplied(true);
      setPromoError("");
      setPromoDiscount(promoCodes[code].discount);
      setPromoMessage(promoCodes[code].message);
    } else {
      setPromoApplied(false);
      setPromoError("Invalid promo code.");
      setPromoDiscount(0);
      setPromoMessage("");
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">We'll contact you soon to confirm your appointment.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-pink-600 text-white px-6 py-3 rounded-full font-medium hover:bg-pink-700 transition-colors"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
      <div className="w-full max-w-7xl p-4 sm:p-8 flex flex-col items-center justify-center mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Book Your Appointment</h1>
          <p className="text-sm sm:text-base text-gray-600">Choose your services and secure your spot</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-6 sm:mb-8 w-full">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold ${
                  currentStep >= step 
                    ? 'bg-pink-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 ${
                    currentStep > step ? 'bg-pink-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-2xl mx-auto mb-4 sm:mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <p className="text-red-600 text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        {/* Centered Main Content for Steps */}
        <div className="flex justify-center items-center w-full min-h-[400px] sm:min-h-[500px]">
          <div className="w-full max-w-2xl flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {currentStep === 1 && step1Stage === 'service' && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-full">
                    <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">CHOOSE YOUR SERVICE</h2>
                    {/* Category Tabs - Mobile Optimized */}
                    <div className="flex flex-col items-center w-full mb-4 sm:mb-6">
                      <div className="flex flex-col sm:flex-row justify-center w-full max-w-3xl gap-2 sm:gap-4">
                        {/* MANI */}
                        <div className="flex-1 flex flex-col items-center justify-end">
                          <button
                            onClick={() => setSelectedCategory('Mani')}
                            className={`w-full py-3 sm:py-4 rounded text-base sm:text-lg font-semibold uppercase transition text-center border
                              ${selectedCategory === 'Mani' ? 'bg-pink-300 text-black border-gray-300' : 'bg-white text-black border-gray-300 hover:bg-pink-50'}`}
                            style={{ minWidth: 0 }}
                          >
                            MANI
                          </button>
                        </div>
                        {/* PEDI */}
                        <div className="flex-1 flex flex-col items-center justify-end">
                          <button
                            onClick={() => setSelectedCategory('Pedi')}
                            className={`w-full py-3 sm:py-4 rounded text-base sm:text-lg font-semibold uppercase transition text-center border
                              ${selectedCategory === 'Pedi' ? 'bg-pink-300 text-black border-gray-300' : 'bg-white text-black border-gray-300 hover:bg-pink-50'}`}
                            style={{ minWidth: 0 }}
                          >
                            PEDI
                          </button>
                        </div>
                        {/* MANI-PEDI with Most Popular label */}
                        <div className="flex-1 flex flex-col items-center justify-end relative">
                          <span className={`w-full flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold z-10 border border-gray-300 rounded-t-md rounded-b-none
                            ${selectedCategory === 'Mani & Pedi' ? 'bg-pink-300 text-pink-900' : 'bg-pink-100 text-pink-900'}`}
                            style={{ borderBottom: 'none', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                            <span className="mr-1 text-pink-600">&#10084;</span> Most Popular!
                          </span>
                          <button
                            onClick={() => setSelectedCategory('Mani & Pedi')}
                            className={`w-full py-3 sm:py-4 text-base sm:text-lg font-semibold uppercase transition text-center z-0 border border-gray-300 rounded-t-none rounded-b-md
                              ${selectedCategory === 'Mani & Pedi' ? 'bg-pink-300 text-black' : 'bg-white text-black hover:bg-pink-50'}`}
                            style={{ minWidth: 0, borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                          >
                            MANI-PEDI
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Service List - Mobile Optimized */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 items-stretch">
                      {(selectedCategory === 'Mani' ? maniServices : selectedCategory === 'Pedi' ? pediServices : maniPediServices.filter(s => s.group === 'MANI-PEDI — MANICURES')).map((service, idx) => (
                        <div
                          key={service.name}
                          className={`rounded-lg border-2 p-4 sm:p-5 bg-white transition cursor-pointer flex flex-col justify-between min-h-[180px] sm:min-h-[220px] h-full ${selectedService && selectedService.name === service.name ? 'bg-pink-100 border-pink-300' : 'border-gray-200 hover:bg-pink-50'}`}
                          onClick={() => setSelectedService(service)}
                        >
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-bold text-base sm:text-lg text-gray-900">{service.name}</div>
                              <div className="text-right text-xs sm:text-sm font-semibold text-gray-700">{service.duration} Mins &nbsp; £{service.price}</div>
                            </div>
                            <div className="text-gray-700 text-xs sm:text-sm mb-2">{service.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Service Selection Sub-Step - Mobile Optimized Buttons */}
                    {step1Stage === 'service' && (
                      <>
                        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-4">
                          <button
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3 rounded bg-[#f5e6df] text-gray-900 font-semibold hover:bg-[#f2d6c2] transition text-sm sm:text-base"
                            onClick={() => prevStep()}
                          >BACK</button>
                          <button
                            className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3 rounded font-semibold transition text-sm sm:text-base ${selectedService ? 'bg-pink-400 text-white hover:bg-pink-500' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            onClick={nextStep}
                            disabled={!selectedService}
                          >NEXT</button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
              {currentStep === 1 && step1Stage === 'addons' && (
                <motion.div
                  key="step1addons"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-full">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-center">CHOOSE YOUR ADD-ONS</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                      {allAddOns.map(addon => (
                        <div
                          key={addon.name}
                          className={`rounded-lg border p-4 sm:p-5 bg-pink-50 transition cursor-pointer flex flex-col justify-between min-h-[120px] sm:min-h-[140px] h-full ${selectedAddOns.includes(addon.name) ? 'bg-pink-200 border-pink-400' : 'border-gray-200 hover:bg-pink-100'}`}
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
                          <div>
                            <div className="font-bold text-sm sm:text-base text-gray-900 mb-1">{addon.name}</div>
                            <div className="text-gray-700 text-xs sm:text-sm mb-2">{addon.description}</div>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-xs text-gray-500">{addon.duration} Mins</div>
                            <div className="text-sm sm:text-base font-semibold text-gray-900">£{addon.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center mb-6 sm:mb-8">
                      <button
                        className={`w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded border text-base sm:text-lg font-semibold uppercase transition text-center ${noAddOns ? 'bg-pink-200 border-pink-400' : 'bg-white border-gray-300 hover:bg-pink-50'}`}
                        onClick={() => {
                          setNoAddOns(true);
                          setSelectedAddOns([]);
                          setError("");
                          setStep1Stage('removal');
                        }}
                      >
                        NO ADDONS NEEDED
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-4">
                      <button
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded bg-[#f5e6df] text-gray-900 font-semibold hover:bg-[#f2d6c2] transition text-sm sm:text-base"
                        onClick={prevStep}
                      >BACK</button>
                      <button
                        className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded font-semibold transition text-sm sm:text-base ${(selectedAddOns.length > 0 || noAddOns) ? 'bg-pink-400 text-white hover:bg-pink-500' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        onClick={nextStep}
                        disabled={!(selectedAddOns.length > 0 || noAddOns)}
                      >NEXT</button>
                    </div>
                  </div>
                </motion.div>
              )}
              {currentStep === 1 && step1Stage === 'removal' && (
                <motion.div
                  key="step1removal"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-full">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-center">DO YOU NEED REMOVAL?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                      <div
                        className={`rounded-lg border p-6 sm:p-8 text-center text-base sm:text-lg font-semibold cursor-pointer transition ${needsRemoval === true ? 'bg-pink-200 border-pink-400' : 'bg-white border-gray-200 hover:bg-pink-100'}`}
                        onClick={() => {
                          setNeedsRemoval(true);
                          setStep1Stage('removalType');
                        }}
                      >
                        YES
                      </div>
                      <div
                        className={`rounded-lg border p-6 sm:p-8 text-center text-base sm:text-lg font-semibold cursor-pointer transition ${needsRemoval === false ? 'bg-pink-200 border-pink-400' : 'bg-white border-gray-200 hover:bg-pink-100'}`}
                        onClick={() => {
                          setNeedsRemoval(false);
                          setError("");
                          setCurrentStep(2);
                          setStep1Stage('service');
                        }}
                      >
                        NO
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-4">
                      <button
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded bg-[#f5e6df] text-gray-900 font-semibold hover:bg-[#f2d6c2] transition text-sm sm:text-base"
                        onClick={prevStep}
                      >BACK</button>
                    </div>
                  </div>
                </motion.div>
              )}
              {currentStep === 1 && step1Stage === 'removalType' && (
                <motion.div
                  key="step1removalType"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-full">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-center">WHAT TYPE OF REMOVAL DO YOU NEED?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                      {removalOptions.map(option => (
                        <div
                          key={option}
                          className={`rounded-lg border p-6 sm:p-8 cursor-pointer transition flex flex-col justify-between min-h-[100px] sm:min-h-[120px] h-full mb-4 ${selectedRemovalType === option ? 'bg-pink-50 border-pink-400' : 'bg-[#f9f3f1] border-[#f9f3f1] hover:border-pink-200'}`}
                          onClick={() => setSelectedRemovalType(option)}
                        >
                          <div className="flex flex-col gap-2">
                            <div className="font-bold text-sm sm:text-lg text-gray-900 mb-1">{option}</div>
                            {/* Optionally add a description for each type here if you want */}
                            {option === 'GEL REMOVAL' && <div className="text-gray-700 text-xs sm:text-sm">Gentle gel removal using a combined method of electric filing and soaking.</div>}
                            {option === 'BIAB/Super Gel Overlay Removal' && <div className="text-gray-700 text-xs sm:text-sm">Gentle BIAB removal using a combined method of electric filing and soaking.</div>}
                            {option === 'Removal of Hard Gel, Extensions or Acrylics' && <div className="text-gray-700 text-xs sm:text-sm">Gentle hard gel, extensions or acrylic removal using a combined method of electric filing and soaking.</div>}
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <a href="#" className="text-xs sm:text-sm text-black font-semibold underline">Learn More &gt;</a>
                            <div className="text-right text-xs sm:text-sm">
                              {option === 'GEL REMOVAL' && <span>15 Mins &nbsp; £10</span>}
                              {option === 'BIAB/Super Gel Overlay Removal' && <span>30 Mins &nbsp; £15</span>}
                              {option === 'Removal of Hard Gel, Extensions or Acrylics' && <span>45 Mins &nbsp; £25</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-4">
                      <button
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded bg-[#f5e6df] text-gray-900 font-semibold hover:bg-[#f2d6c2] transition text-sm sm:text-base"
                        onClick={() => {
                          setStep1Stage('removal');
                          setSelectedRemovalType(null);
                        }}
                      >BACK</button>
                      <button
                        className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded font-semibold transition text-sm sm:text-base ${selectedRemovalType ? 'bg-pink-400 text-white hover:bg-pink-500' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        onClick={nextStep}
                        disabled={!selectedRemovalType}
                      >NEXT</button>
                    </div>
                  </div>
                </motion.div>
              )}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-full">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Select Staff & Time</h2>
                    
                    {/* Staff Selection - Mobile Optimized */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Choose Your Technician</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {staff.map((member) => (
                          <div
                            key={member.id}
                            onClick={() => setForm({ ...form, staff_id: member.id })}
                            className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                              form.staff_id === member.id
                                ? 'border-pink-600 bg-pink-50'
                                : 'border-gray-200 hover:border-pink-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-full flex items-center justify-center">
                                <span className="text-pink-600 font-semibold text-sm sm:text-base">
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-sm sm:text-base">{member.name}</div>
                                <div className="text-xs sm:text-sm text-gray-500">{member.specialization || 'Nail Technician'}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Date & Time Selection - Mobile Optimized */}
                    {form.staff_id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                          <MuiDatePicker
                            value={selectedDate}
                            onChange={date => {
                              setSelectedDate(date);
                              setForm({ ...form, appointment_datetime: "" });
                            }}
                            minDate={new Date()}
                            renderInput={({ inputRef, inputProps, InputProps }) => {
                              let formattedValue = inputProps.value;
                              if (selectedDate instanceof Date && !isNaN(selectedDate)) {
                                formattedValue = `${String(selectedDate.getDate()).padStart(2, '0')}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${selectedDate.getFullYear()}`;
                              }
                              return (
                                <div className="relative mb-4">
                                  <input ref={inputRef} {...inputProps} value={formattedValue} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm sm:text-base" />
                                  {InputProps?.endAdornment}
                                </div>
                              );
                            }}
                            inputFormat="dd-MM-yyyy"
                            disablePast
                            renderDay={(day, _value, DayComponentProps) => {
                              const isToday = new Date().toDateString() === day.toDateString();
                              const isWeekend = [0, 6].includes(day.getDay());
                              return (
                                <div className={
                                  `${isToday ? 'ring-2 ring-pink-500' : ''} ${isWeekend ? 'bg-pink-50' : ''}`
                                }>
                                  <PickersDay {...DayComponentProps} />
                                </div>
                              );
                            }}
                          />
                        </LocalizationProvider>
                        {selectedDate && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                              {Array.from(new Set(generateTimeSlots(selectedDate, openHours))).map((slot) => {
                                const isBooked = bookedSlots.includes(slot);
                                const isSelected = form.appointment_datetime && form.appointment_datetime.slice(11, 16) === slot;
                                // Hide if slot is in the past or booked
                                let isPast = false;
                                if (selectedDate) {
                                  const slotDate = new Date(selectedDate);
                                  const [h, m] = slot.split(":");
                                  slotDate.setHours(Number(h), Number(m), 0, 0);
                                  isPast = selectedDate.toDateString() === now.toDateString() && slotDate < now;
                                }
                                if (isBooked || isPast) return null;
                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setForm({ ...form, appointment_datetime: `${selectedDate.toISOString().slice(0, 10)}T${slot}` })}
                                    className={`py-3 sm:py-2 min-w-[60px] sm:min-w-[70px] rounded text-center font-medium border-2 transition-colors flex items-center justify-center text-xs sm:text-sm
                                      ${isSelected ? 'border-pink-600 bg-pink-50 text-black' : 'border-gray-200 bg-white text-black hover:border-pink-300'}
                                    `}
                                  >
                                    {slot}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-4">
                      <button
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded bg-[#f5e6df] text-gray-900 font-semibold hover:bg-[#f2d6c2] transition text-sm sm:text-base"
                        onClick={prevStep}
                      >BACK</button>
                      <button
                        className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded font-semibold transition text-sm sm:text-base ${(form.staff_id && selectedDate && form.appointment_datetime) ? 'bg-pink-400 text-white hover:bg-pink-500' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        onClick={nextStep}
                        disabled={!(form.staff_id && selectedDate && form.appointment_datetime)}
                      >NEXT</button>
                    </div>
                  </div>
                </motion.div>
              )}
              {currentStep === 3 && (
                <>
                  <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-center">CONFIRM YOUR APPOINTMENT DETAILS</h3>
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-full">
                      {/* Reservation timer */}
                      <div className="mb-4 text-center text-pink-700 font-semibold text-sm sm:text-base">
                        Your reservation will expire in {`${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                        {/* Left: Details (new order) */}
                        <div className="space-y-4">
                          {/* Location (no Edit) */}
                          <div>
                            <div className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Location</div>
                            <div className="text-sm sm:text-base">
                              Nails Design<br />
                              25 Porchester Road, London, W2 5DP
                            </div>
                          </div>
                          {/* Date (with Edit) */}
                          <div>
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Date</span>
                              <button className="text-pink-600 underline text-xs sm:text-sm" onClick={() => setCurrentStep(2)}>Edit</button>
                            </div>
                            <div className="text-sm sm:text-base">
                              {form.appointment_datetime
                                ? new Date(form.appointment_datetime).toLocaleString(undefined, {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : ""}
                            </div>
                          </div>
                          {/* Staff */}
                          <div>
                            <div className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Staff</div>
                            <div className="text-sm sm:text-base">
                              {staff.find(s => s.id === form.staff_id)?.name || "Not selected"}
                            </div>
                          </div>
                          {/* Services (with Edit) */}
                          <div>
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Services</span>
                              <button className="text-pink-600 underline text-xs sm:text-sm" onClick={() => { setCurrentStep(1); setStep1Stage('service'); }}>Edit</button>
                            </div>
                            <div>
                              {basket.length > 0 ? (
                                <ul className="ml-2 text-xs sm:text-sm text-gray-900">
                                  {basket.map(service => (
                                    <li key={service.name}>{service.name}</li>
                                  ))}
                                </ul>
                              ) : <span className="text-gray-500 text-xs sm:text-sm">No services selected</span>}
                              {selectedAddOns.length > 0 && (
                                <ul className="ml-4 text-xs sm:text-sm text-gray-700">
                                  {selectedAddOns.map(addon => (
                                    <li key={addon}>+ {addon}</li>
                                  ))}
                                </ul>
                              )}
                              {selectedRemovalType && (
                                <div className="ml-4 text-xs sm:text-sm text-gray-700">Removal: {selectedRemovalType}</div>
                              )}
                            </div>
                          </div>
                          {/* Total Duration */}
                          <div>
                            <div className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Total duration</div>
                            <div className="text-sm sm:text-base">
                              {basket.length > 0
                                ? `${basket.reduce((sum, s) => sum + (s.duration || s.duration_minutes || 0), 0)} mins`
                                : "0 mins"}
                            </div>
                          </div>
                        </div>
                        {/* Right: Payment & Promo */}
                        <div className="space-y-4">
                          {/* Promo Code */}
                          <div>
                            <label className="block font-semibold mb-1">Have a promo code? (Optional)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={promoCode}
                                onChange={e => setPromoCode(e.target.value)}
                                className="border rounded p-2 flex-1"
                                placeholder="Enter promo code"
                                disabled={promoApplied}
                              />
                              <button
                                type="button"
                                className="bg-pink-600 text-white px-4 py-2 rounded"
                                onClick={handleApplyPromo}
                                disabled={promoApplied}
                              >
                                {promoApplied ? "APPLIED" : "APPLY"}
                              </button>
                            </div>
                            {promoError && <div className="text-red-600 text-sm mt-1">{promoError}</div>}
                            {promoApplied && <div className="text-green-600 text-sm mt-1">{promoMessage}</div>}
                          </div>
                          {/* Total */}
                          <div className="mb-2">
                            <div className="flex justify-between font-semibold text-base">
                              <span>Total</span>
                              <span>£{Math.max(0, basket.reduce((sum, s) => sum + Number(s.price), 0) - promoDiscount)}</span>
                            </div>
                            {promoDiscount > 0 && (
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Discount</span>
                                <span>-£{promoDiscount}</span>
                              </div>
                            )}
                          </div>
                          {/* Secure your booking with card section */}
                          <div className="mt-6">
                            <div className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Secure your booking with</div>
                            <div className="text-xs sm:text-sm text-gray-600 mb-3">(Your card will not be charged until after your appointment)</div>
                            <button
                              className="flex items-center w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg p-3 sm:p-4 transition-colors"
                              // onClick={...} // Your card payment handler
                            >
                              <div className="flex items-center space-x-3">
                                {/* Card icon SVG */}
                                <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="1" y="2" width="22" height="12" rx="2" fill="#fff" stroke="#333" strokeWidth="1.5"/>
                                  <rect x="1" y="5" width="22" height="2" fill="#e5e7eb" />
                                  <rect x="4" y="10" width="6" height="2" rx="1" fill="#e5e7eb" />
                                </svg>
                                <div className="text-left">
                                  <div className="font-semibold text-gray-900 text-sm sm:text-base">Add a new card</div>
                                  <div className="text-xs sm:text-sm text-gray-600">Secure payment processing</div>
                                </div>
                              </div>
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                          {/* Agreement Checkbox */}
                          <div className="mb-4 flex items-start">
                            <input
                              type="checkbox"
                              id="agreement"
                              checked={agreed}
                              onChange={e => setAgreed(e.target.checked)}
                              className="mt-1"
                            />
                            <label htmlFor="agreement" className="ml-2 text-sm">
                              Tick to confirm agreement with our{' '}
                              <a href="/terms" target="_blank" className="underline text-pink-600">Terms</a> and{' '}
                              <a href="/conditions" target="_blank" className="underline text-pink-600">Conditions</a>, and to confirm you have added all details of relevant allergies or medical information.
                            </label>
                          </div>
                          {/* Confirm Booking Button */}
                          <button
                            className={`w-full bg-pink-600 text-white py-3 rounded font-semibold transition ${!agreed ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={!agreed}
                            onClick={handleSubmit}
                          >
                            CONFIRM BOOKING
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Auth Modal (dismissible) */}
      <Dialog open={showAuthModal} onClose={() => setShowAuthModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          {/* Modal content */}
          <div className="relative bg-white rounded-2xl shadow-xl max-w-xl w-full mx-auto p-8 z-10">
            {/* Close button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-2 tracking-wide">
              {showLogin ? "LOG IN" : "CREATE ACCOUNT"}
            </h2>
            {/* Subtitle */}
            <div className="text-center mb-6">
              {showLogin ? (
                <button
                  type="button"
                  className="text-black underline font-medium"
                  onClick={() => setShowLogin(false)}
                >
                  Don&apos;t have an account? Create one
                </button>
              ) : (
                <button
                  type="button"
                  className="text-black underline font-medium"
                  onClick={() => setShowLogin(true)}
                >
                  Already have an account? Log in
                </button>
              )}
            </div>
            {/* Registration Form */}
            {!showLogin ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">First Name</label>
                  <input
                    name="first_name"
                    placeholder="First Name"
                    required
                    className="w-full p-3 border rounded"
                    value={authForm.first_name}
                    onChange={handleAuthChange}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Last Name</label>
                  <input
                    name="last_name"
                    placeholder="Last Name"
                    required
                    className="w-full p-3 border rounded"
                    value={authForm.last_name}
                    onChange={handleAuthChange}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="w-full p-3 border rounded"
                    value={authForm.email}
                    onChange={handleAuthChange}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone</label>
                  <input
                    name="phone"
                    placeholder="Phone"
                    required
                    className="w-full p-3 border rounded"
                    value={authForm.phone}
                    onChange={handleAuthChange}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Date of Birth</label>
                  <input
                    name="birth_date"
                    type="date"
                    placeholder="Date of Birth"
                    required
                    className="w-full p-3 border rounded"
                    value={authForm.birth_date}
                    onChange={handleAuthChange}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Password</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    className="w-full p-3 border rounded"
                    value={authForm.password}
                    onChange={handleAuthChange}
                  />
                </div>
                {authError && <p className="text-red-600">{authError}</p>}
                <button className="w-full bg-rose-300 text-black py-3 rounded font-semibold tracking-wide mt-4 hover:bg-rose-400 transition">
                  CREATE ACCOUNT
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="w-full p-3 border rounded"
                    value={authForm.email}
                    onChange={handleAuthChange}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Password</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    className="w-full p-3 border rounded"
                    value={authForm.password}
                    onChange={handleAuthChange}
                  />
                </div>
                <div className="text-right mb-2">
                  <button type="button" onClick={() => setShowForgotPasswordModal(true)} className="text-pink-600 hover:underline text-sm font-medium">Forgot my password?</button>
                </div>
                {authError && <p className="text-red-600">{authError}</p>}
                <button className="w-full bg-rose-300 text-black py-3 rounded font-semibold tracking-wide mt-4 hover:bg-rose-400 transition">
                  LOG IN
                </button>
              </form>
            )}
          </div>
        </div>
      </Dialog>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotPasswordModal} onClose={() => setShowForgotPasswordModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto p-8 z-10">
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close"
            >×</button>
            <h2 className="text-2xl font-bold text-center mb-2 tracking-wide">RESET PASSWORD</h2>
            <div className="text-center mb-6">Enter your email address and we will send you a verification code.</div>
            <form onSubmit={handleForgotPassword}>
              <label className="block font-semibold mb-1 text-left">Email</label>
              <input
                type="email"
                required
                className="w-full p-3 border rounded mb-6"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
              />
              <button type="submit" className="w-full bg-rose-300 text-black py-3 rounded font-semibold tracking-wide mt-4 hover:bg-rose-400 transition">
                SEND VERIFICATION CODE
              </button>
            </form>
            {forgotSent && <div className="text-green-600 text-center mt-4">Verification code sent!</div>}
          </div>
        </div>
      </Dialog>

      {/* Reservation Expired Modal */}
      {showExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-8 relative text-center">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => {
                setShowExpiredModal(false);
                setCurrentStep(2); // Go back to Select Staff & Time
              }}
              aria-label="Close"
            >×</button>
            <h2 className="text-xl font-bold mb-4">YOUR RESERVATION HAS EXPIRED</h2>
            <p className="mb-8">Choose your date and time and reserve again.</p>
            <button
              className="w-full bg-rose-300 hover:bg-rose-400 text-black py-4 rounded font-semibold tracking-wide text-lg"
              onClick={() => {
                setShowExpiredModal(false);
                setCurrentStep(2); // Go back to Select Staff & Time
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}


