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
import BookingProgressBar from "../components/BookingProgressBar";
import { usePathname } from 'next/navigation';

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
  { name: "CLASSIC MANICURE - POLISH", description: "Flawless nails, Expert shaping, buffing, cuticle care and moisturising, followed by a polish of your choice from our vibrant Colour Library.", duration: 40, price: 40 },
  { name: "CLASSIC MANICURE - GEL", description: "Flawless nails, Expert shaping, buffing, cuticle care and moisturising, followed by a chip-resistant gel of your choice from our vibrant Colour Library.", duration: 45, price: 42 },
  { name: "CLASSIC MANICURE - NO COLOUR", description: "Flawless nails, Expert shaping, buffing (with an optional matte or shine finish), cuticle care and moisturising, with no polish or gel for a natural mani alternative.", duration: 30, price: 32 },
  { name: "SNS CLASSIC DIPPING POWDER", description: "Long-lasting, lightweight, and durable manicure using SNS dipping powder. Includes shaping, buffing, and your choice of color.", duration: 60, price: 40 },
  { name: "CLASSIC MANICURE - BIAB", description: "Builder in a Bottle (BIAB) for extra strength and durability. Choose your BIAB treatment in the next step.", duration: 60, price: 40 },
];

const biabVariants = [
  { name: "BIAB Infill", description: "", duration: 60, price: 37 },
  { name: "BIAB Only", description: "", duration: 65, price: 45 },
  { name: "BIAB with Manicure", description: "", duration: 80, price: 59 },
  { name: "BIAB Removal", description: "", duration: 20, price: 14 },
  { name: "BIAB Infill with Manicure", description: "", duration: 60, price: 42 },
];

const pediServices = [
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
  { name: "CLASSIC PEDICURE - GEL", description: "Get flawless feet with the . Featuring a soak, expert shaping, buffing, cuticle care, hard skin filing, smoothing and moisturising, followed by your choice of chip-resistant gel from our vibrant Colour Library.", duration: 55, price: 48 },
  { name: "CLASSIC PEDICURE - NO COLOUR", description: "Get flawless feet with the ' Expert shaping, buffing (with an optional matte or shine finish), cuticle care, hard skin filing, smoothing and moisturising, with no polish or gel for a natural mani alternative.", duration: 40, price: 35 },
  { name: "CLASSIC PEDICURE - POLISH", description: "Get flawless feet with the . Featuring a soak, expert shaping, buffing, cuticle care, hard skin filing and smoothing and moisturising, followed by a polish of your choice from our vibrant Colour Library.", duration: 50, price: 44 },
];

// Nail Extension & Enhancements
const nailExtensionEnhancements = [
  {
    name: "Acrylic Extensions",
    description: "Transform your nails with classic acrylic extensions for added length, strength, and a flawless finish. Perfect for those who want durable, beautiful nails that last. Choose your acrylic option in the next step.",
    duration: 60,
    price: 45,
    children: [
      { name: "Full Set Acrylic", description: "", duration: 60, price: 34 },
      { name: "Full Set Ombre", description: "", duration: 60, price: 43 },
      { name: "Full Set Acrylic with gel color", description: "", duration: 60, price: 40 },
      { name: "Overlays - Acrylic", description: "", duration: 60, price: 29 },
      { name: "Infills Acrylic", description: "", duration: 45, price: 24 },
      { name: "Infills Ombre", description: "", duration: 45, price: 35 },
      { name: "Infills Acrylic with gel color", description: "", duration: 45, price: 33 }
    ]
  },
  { name: "Gel Extensions", description: "Flexible and natural-looking gel nail extensions.", duration: 60, price: 50 },
  { name: "SNS Dipping Powder Extensions", description: "Lightweight SNS dipping powder extensions.", duration: 75, price: 42 },
  { name: "SNS Refill with Same Colour", description: "SNS refill service using the same colour as your previous set. Includes shaping, buffing, and strengthening for a refreshed look.", duration: 60, price: 35 },
  { name: "BIAB Enhancements", description: "Builder in a Bottle for extra strength and durability.", duration: 60, price: 52 }
];

// Add-ons for all services
const allAddOns = [
  {
    name: 'BIAB',
    description: 'Builder in a Bottle for extra strength and durability.',
    duration: 20,
    price: 15,
    onlyFor: 'CLASSIC MANICURE - GEL'
  },
  {
    name: 'French tips (Polish or gel)',
    description: 'Classic French tip in white or any color, available in polish or gel.',
    duration: 15,
    price: 10,
    onlyFor: 'CLASSIC MANICURE - POLISH'
  },
  {
    name: 'Nail art',
    description: 'Custom nail art design.',
    duration: 20,
    price: 10,
    onlyFor: 'CLASSIC MANICURE - GEL'
  },
  {
    name: 'Ombre',
    description: 'Beautiful ombre gradient finish.',
    duration: 20,
    price: 15,
    onlyFor: 'CLASSIC MANICURE - GEL'
  },
  {
    name: 'Chrome finish',
    description: 'Mirror-like chrome effect for your nails.',
    duration: 10,
    price: 10,
    onlyFor: 'CLASSIC MANICURE - GEL'
  },
  {
    name: 'Strengthening base coat',
    description: 'Extra strengthening base coat for added durability.',
    duration: 5,
    price: 5,
    onlyFor: 'CLASSIC MANICURE - POLISH'
  },
  {
    name: 'Repair and Extension of Single Nail',
    description: 'Restore and extend a broken or short nail so it blends seamlessly with your manicure. Our high-quality gel enhancements guarantee strength, durability and a flawless finish.',
    duration: 10,
    price: 8,
    onlyFor: 'CLASSIC MANICURE - POLISH'
  },
  {
    name: 'Extended Massage',
    description: 'Extend any treatment with 10 more minutes of indulgent massage.',
    duration: 10,
    price: 10,
    onlyFor: 'CLASSIC MANICURE - POLISH'
  },
  {
    name: 'French tips',
    description: 'Classic French tip in white or any color, available in polish or gel.',
    duration: 15,
    price: 10,
    onlyFor: 'CLASSIC PEDICURE - GEL'
  },
  {
    name: 'Extended Massage',
    description: 'Extend any treatment with 10 more minutes of indulgent massage.',
    duration: 10,
    price: 10,
    onlyFor: 'CLASSIC PEDICURE - GEL'
  },
  {
    name: 'French tips',
    description: 'Classic French tip in white or any color, available in polish or gel.',
    duration: 15,
    price: 10,
    onlyFor: 'CLASSIC PEDICURE - POLISH'
  },
  {
    name: 'Extended Massage',
    description: 'Extend any treatment with 10 more minutes of indulgent massage.',
    duration: 10,
    price: 10,
    onlyFor: 'CLASSIC PEDICURE - POLISH'
  },
  {
    name: 'French tips',
    description: 'Classic French tip in white or any color, available in polish or gel.',
    duration: 15,
    price: 10,
    onlyFor: 'CLASSIC MANICURE - GEL'
  },
  {
    name: 'Repair and Extension of Single Nail',
    description: 'Restore and extend a broken or short nail so it blends seamlessly with your manicure. Our high-quality gel enhancements guarantee strength, durability and a flawless finish.',
    duration: 10,
    price: 8,
    onlyFor: 'CLASSIC MANICURE - GEL'
  },
  {
    name: 'Extended Massage',
    description: 'Extend any treatment with 10 more minutes of indulgent massage.',
    duration: 10,
    price: 10,
    onlyFor: 'CLASSIC MANICURE - GEL'
  },
  // SNS Classic Dipping Powder Add-ons
  {
    name: 'French Tips',
    description: 'White or colored tips using dip powder or gel top layer.',
    duration: 15,
    price: 10,
    onlyFor: 'SNS CLASSIC DIPPING POWDER'
  },
  {
    name: 'Nail Art',
    description: 'Stickers, decals, freehand art, or foil.',
    duration: 20,
    price: 10,
    onlyFor: 'SNS CLASSIC DIPPING POWDER'
  },
  {
    name: 'Chrome Finish',
    description: 'Mirror-like chrome effect for your nails.',
    duration: 10,
    price: 10,
    onlyFor: 'SNS CLASSIC DIPPING POWDER'
  },
  {
    name: 'Extended Massage',
    description: 'Extend any treatment with 10 more minutes of indulgent massage.',
    duration: 10,
    price: 10,
    onlyFor: 'SNS CLASSIC DIPPING POWDER'
  },
  {
    name: 'Repair and Extension of Single Nail',
    description: 'Restore and extend a broken or short nail so it blends seamlessly with your manicure. Our high-quality gel enhancements guarantee strength, durability and a flawless finish.',
    duration: 10,
    price: 8,
    onlyFor: 'SNS CLASSIC DIPPING POWDER'
  },
  // BIAB Add-ons
  {
    name: 'French Tips',
    description: 'Classic French tip in white or any color.',
    duration: 15,
    price: 5,
    onlyFor: 'CLASSIC MANICURE - BIAB'
  },
  {
    name: 'Chrome/Glazed Finish',
    description: 'Mirror-like chrome or glazed effect for your nails.',
    duration: 10,
    price: 10,
    onlyFor: 'CLASSIC MANICURE - BIAB'
  },
  {
    name: 'Nail Art',
    description: 'Stickers, decals, freehand art, or foil.',
    duration: 20,
    price: 'from 5',
    onlyFor: 'CLASSIC MANICURE - BIAB'
  },
  {
    name: 'Extra Strength Layer',
    description: 'Extra strength layer for added durability.',
    duration: 10,
    price: 5,
    onlyFor: 'CLASSIC MANICURE - BIAB'
  },
  {
    name: 'Extended Massage',
    description: 'Extend any treatment with 10 more minutes of indulgent massage.',
    duration: 10,
    price: 5,
    onlyFor: 'CLASSIC MANICURE - BIAB'
  },
];

// Removal options for all add-ons
const removalOptions = [
  'BIAB Removal',
  'French Tip Removal',
  'Shellac Removal',
  'Acrylic Removal',
  'SNS Dipping Powder Removal',
  'Gel Polish Removal',
  { name: 'REMOVAL OF HARD GEL, EXTENSIONS OR ACRYLICS', duration: 40, price: 30 }
];

export default function BookingPage() {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [basket, setBasket] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [hydrated, setHydrated] = useState(false);
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
  const [addonsStepIndex, setAddonsStepIndex] = useState(0);
  const [selectedAddOnsMani, setSelectedAddOnsMani] = useState([]);
  const [selectedAddOnsPedi, setSelectedAddOnsPedi] = useState([]);
  const [noAddOnsMani, setNoAddOnsMani] = useState(false);
  const [noAddOnsPedi, setNoAddOnsPedi] = useState(false);
  const [selectedBiabVariant, setSelectedBiabVariant] = useState(null);
  const [selectedAcrylicOption, setSelectedAcrylicOption] = useState(null);
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

  const [loading, setLoading] = useState(true);

  // Fetch services and staff on mount
  useEffect(() => {
    setLoading(true);
    axios.get(getApiUrl("/services"))
      .then((res) => {
        setServices(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setServices([]);
        setLoading(false);
      });
    axios.get(getApiUrl("/staff")).then((res) => {
      setStaff([
        { id: 'any', first_name: 'Any', last_name: 'professional', specialization: 'Any available staff' },
        ...res.data
      ]);
    }).catch(() => {
      setStaff([
        { id: 'any', first_name: 'Any', last_name: 'professional', specialization: 'Any available staff' },
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

  // Set 'Any professional' as the default selected staff
  useEffect(() => {
    setForm((prev) => ({ ...prev, staff_id: 'any' }));
  }, [staff.length]);

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

  // In useEffect, restore currentStep from localStorage and set hydrated to true:
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Restore all state from localStorage
      const savedStep = localStorage.getItem('booking_currentStep');
      const parsedStep = Number(savedStep);
      if (savedStep !== null && !isNaN(parsedStep) && parsedStep !== 3) setCurrentStep(parsedStep);
      else if (savedStep !== null && parsedStep === 3) setCurrentStep(2);
      else setCurrentStep(1);

      const savedStep1Stage = localStorage.getItem('booking_step1Stage');
      if (savedStep1Stage) setStep1Stage(savedStep1Stage);
      const savedSelectedCategory = localStorage.getItem('booking_selectedCategory');
      if (savedSelectedCategory) setSelectedCategory(savedSelectedCategory);
      const savedSelectedService = localStorage.getItem('booking_selectedService');
      if (savedSelectedService) setSelectedService(JSON.parse(savedSelectedService));
      const savedSelectedManiPediManicure = localStorage.getItem('booking_selectedManiPediManicure');
      if (savedSelectedManiPediManicure) setSelectedManiPediManicure(JSON.parse(savedSelectedManiPediManicure));
      const savedSelectedManiPediPedicure = localStorage.getItem('booking_selectedManiPediPedicure');
      if (savedSelectedManiPediPedicure) setSelectedManiPediPedicure(JSON.parse(savedSelectedManiPediPedicure));
      const savedBasket = localStorage.getItem('booking_basket');
      if (savedBasket) setBasket(JSON.parse(savedBasket));
      const savedSelectedAddOns = localStorage.getItem('booking_selectedAddOns');
      if (savedSelectedAddOns) setSelectedAddOns(JSON.parse(savedSelectedAddOns));
      const savedSelectedAddOnsMani = localStorage.getItem('booking_selectedAddOnsMani');
      if (savedSelectedAddOnsMani) setSelectedAddOnsMani(JSON.parse(savedSelectedAddOnsMani));
      const savedSelectedAddOnsPedi = localStorage.getItem('booking_selectedAddOnsPedi');
      if (savedSelectedAddOnsPedi) setSelectedAddOnsPedi(JSON.parse(savedSelectedAddOnsPedi));
      const savedNoAddOns = localStorage.getItem('booking_noAddOns');
      if (savedNoAddOns) setNoAddOns(JSON.parse(savedNoAddOns));
      const savedNoAddOnsMani = localStorage.getItem('booking_noAddOnsMani');
      if (savedNoAddOnsMani) setNoAddOnsMani(JSON.parse(savedNoAddOnsMani));
      const savedNoAddOnsPedi = localStorage.getItem('booking_noAddOnsPedi');
      if (savedNoAddOnsPedi) setNoAddOnsPedi(JSON.parse(savedNoAddOnsPedi));
      const savedNeedsRemoval = localStorage.getItem('booking_needsRemoval');
      if (savedNeedsRemoval) setNeedsRemoval(JSON.parse(savedNeedsRemoval));
      const savedSelectedRemovalType = localStorage.getItem('booking_selectedRemovalType');
      if (savedSelectedRemovalType) setSelectedRemovalType(savedSelectedRemovalType);
      const savedSelectedDate = localStorage.getItem('booking_selectedDate');
      if (savedSelectedDate) setSelectedDate(new Date(savedSelectedDate));
      const savedForm = localStorage.getItem('booking_form');
      if (savedForm) setForm(JSON.parse(savedForm));
      const savedAddonsStepIndex = localStorage.getItem('booking_addonsStepIndex');
      if (savedAddonsStepIndex) setAddonsStepIndex(Number(savedAddonsStepIndex));
      const savedSelectedBiabVariant = localStorage.getItem('booking_selectedBiabVariant');
      if (savedSelectedBiabVariant) setSelectedBiabVariant(JSON.parse(savedSelectedBiabVariant));
      const savedSelectedAcrylicOption = localStorage.getItem('booking_selectedAcrylicOption');
      if (savedSelectedAcrylicOption) setSelectedAcrylicOption(JSON.parse(savedSelectedAcrylicOption));

      setHydrated(true);
    }
  }, []);

  // Add this function inside BookingPage so it has access to state:
  function getTotalPrice() {
    let sum = 0;
    // 1. Basket (main services)
    sum += basket.reduce((acc, s) => acc + (s.price ? Number(s.price) : 0), 0);

    // 2. Add-ons
    if (selectedCategory === 'Mani & Pedi') {
      sum += selectedAddOnsMani.reduce((acc, name) => {
        const addon = allAddOns.find(a => a.name === name);
        return acc + (addon && !isNaN(Number(addon.price)) ? Number(addon.price) : 0);
      }, 0);
      sum += selectedAddOnsPedi.reduce((acc, name) => {
        const addon = allAddOns.find(a => a.name === name);
        return acc + (addon && !isNaN(Number(addon.price)) ? Number(addon.price) : 0);
      }, 0);
    } else {
      sum += selectedAddOns.reduce((acc, name) => {
        const addon = allAddOns.find(a => a.name === name);
        return acc + (addon && !isNaN(Number(addon.price)) ? Number(addon.price) : 0);
      }, 0);
    }

    // 3. Removal
    if (needsRemoval && selectedRemovalType) {
      if (selectedRemovalType === 'BIAB Removal') sum += 14;
      else if (selectedRemovalType === 'SNS Dipping Powder Removal') sum += 10;
      else if (selectedRemovalType === 'Gel Polish Removal') sum += 10;
      else if (selectedRemovalType === 'REMOVAL OF HARD GEL, EXTENSIONS OR ACRYLICS') sum += 20;
      else {
        // Try to find a matching removal option with a price
        const removal = removalOptions.find(r => (typeof r === 'object' ? r.name : r) === selectedRemovalType);
        if (removal && typeof removal === 'object' && removal.price && !isNaN(Number(removal.price))) sum += Number(removal.price);
      }
    }
    return sum;
  }

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
          setAddonsStepIndex(0); // Start with mani add-ons
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
        if (selectedCategory === 'Mani & Pedi') {
          if (addonsStepIndex === 0) {
            // Validate mani add-ons
            if (!(selectedAddOnsMani.length > 0 || noAddOnsMani)) {
              setError("Please select at least one add-on or choose 'No Addons' for Manicure.");
              return;
            }
            setError("");
            setAddonsStepIndex(1); // Move to pedi add-ons
            return;
          } else if (addonsStepIndex === 1) {
            // Validate pedi add-ons
            if (!(selectedAddOnsPedi.length > 0 || noAddOnsPedi)) {
              setError("Please select at least one add-on or choose 'No Addons' for Pedicure.");
              return;
            }
            setError("");
            setStep1Stage('removal');
            return;
          }
        } else {
          if (!(selectedAddOns.length > 0 || noAddOns)) {
            setError("Please select at least one add-on or choose 'No Addons'.");
            return;
          }
          setError("");
          setStep1Stage('removal');
          return;
        }
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
      // Require login before confirmation
      if (!user) {
        setShowAuthModal(true);
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
      if (currentStep === 3) {
        setCurrentStep(2); // Redirect to staff & time selection
        setShowExpiredModal(false); // Hide modal if shown
        setTimer(300); // Optionally reset timer for next time
        setError("Your reservation expired. Please select a new time.");
      }
    }
  }, [timer, currentStep]);

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

  const serviceListRef = useRef(null);

  function getTotalDuration() {
    let sum = 0;
    // 1. Basket (main services)
    sum += basket.reduce((acc, s) => acc + (s.duration ? Number(s.duration) : 0), 0);

    // 2. Add-ons
    // Mani & Pedi booking
    if (selectedCategory === 'Mani & Pedi') {
      sum += selectedAddOnsMani.reduce((acc, name) => {
        const addon = allAddOns.find(a => a.name === name);
        return acc + (addon ? Number(addon.duration) : 0);
      }, 0);
      sum += selectedAddOnsPedi.reduce((acc, name) => {
        const addon = allAddOns.find(a => a.name === name);
        return acc + (addon ? Number(addon.duration) : 0);
      }, 0);
    } else {
      sum += selectedAddOns.reduce((acc, name) => {
        const addon = allAddOns.find(a => a.name === name);
        return acc + (addon ? Number(addon.duration) : 0);
      }, 0);
    }

    // 3. Removal
    if (needsRemoval && selectedRemovalType) {
      if (selectedRemovalType === 'BIAB Removal') sum += 20;
      else if (selectedRemovalType === 'SNS Dipping Powder Removal') sum += 15;
      else if (selectedRemovalType === 'Gel Polish Removal') sum += 15;
      else {
        // Try to find a matching removal option with a duration
        const removal = removalOptions.find(r => (typeof r === 'object' ? r.name : r) === selectedRemovalType);
        if (removal && typeof removal === 'object' && removal.duration) sum += Number(removal.duration);
      }
    }
    return sum;
  }

  const pathname = usePathname();

  // --- Reset booking state on navigation away ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Only run this effect if the component is mounted
    const handleRouteChange = () => {
      if (window.location.pathname !== '/booking') {
        clearBookingLocalStorage();
      }
    };
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('pushstate', handleRouteChange);
    window.addEventListener('replacestate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('pushstate', handleRouteChange);
      window.removeEventListener('replacestate', handleRouteChange);
      // Removed clearBookingLocalStorage from cleanup to avoid clearing on refresh
    };
  }, [pathname]);

  // Persist booking state to localStorage on change
  useEffect(() => {
    localStorage.setItem('booking_currentStep', currentStep);
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('booking_basket', JSON.stringify(basket));
  }, [basket]);

  useEffect(() => {
    localStorage.setItem('booking_selectedCategory', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem('booking_selectedService', JSON.stringify(selectedService));
  }, [selectedService]);

  useEffect(() => {
    localStorage.setItem('booking_selectedManiPediManicure', JSON.stringify(selectedManiPediManicure));
  }, [selectedManiPediManicure]);

  useEffect(() => {
    localStorage.setItem('booking_selectedManiPediPedicure', JSON.stringify(selectedManiPediPedicure));
  }, [selectedManiPediPedicure]);

  useEffect(() => {
    localStorage.setItem('booking_selectedAddOns', JSON.stringify(selectedAddOns));
  }, [selectedAddOns]);

  useEffect(() => {
    localStorage.setItem('booking_selectedAddOnsMani', JSON.stringify(selectedAddOnsMani));
  }, [selectedAddOnsMani]);

  useEffect(() => {
    localStorage.setItem('booking_selectedAddOnsPedi', JSON.stringify(selectedAddOnsPedi));
  }, [selectedAddOnsPedi]);

  useEffect(() => {
    localStorage.setItem('booking_noAddOns', JSON.stringify(noAddOns));
  }, [noAddOns]);

  useEffect(() => {
    localStorage.setItem('booking_noAddOnsMani', JSON.stringify(noAddOnsMani));
  }, [noAddOnsMani]);

  useEffect(() => {
    localStorage.setItem('booking_noAddOnsPedi', JSON.stringify(noAddOnsPedi));
  }, [noAddOnsPedi]);

  useEffect(() => {
    localStorage.setItem('booking_needsRemoval', JSON.stringify(needsRemoval));
  }, [needsRemoval]);

  useEffect(() => {
    localStorage.setItem('booking_selectedRemovalType', selectedRemovalType);
  }, [selectedRemovalType]);

  useEffect(() => {
    localStorage.setItem('booking_selectedDate', selectedDate ? selectedDate.toISOString() : '');
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem('booking_form', JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    localStorage.setItem('booking_addonsStepIndex', addonsStepIndex);
  }, [addonsStepIndex]);

  useEffect(() => {
    localStorage.setItem('booking_selectedBiabVariant', JSON.stringify(selectedBiabVariant));
  }, [selectedBiabVariant]);

  useEffect(() => {
    localStorage.setItem('booking_selectedAcrylicOption', JSON.stringify(selectedAcrylicOption));
  }, [selectedAcrylicOption]);

  if (success) {
    return (
      <>
        {/* Auth Modal */}
        <Dialog open={showAuthModal} onClose={() => setShowAuthModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6 z-10">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                onClick={() => setShowAuthModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <Tab.Group selectedIndex={authTab} onChange={setAuthTab}>
                <Tab.List className="flex space-x-2 mb-6">
                  <Tab className={({ selected }) =>
                    `flex-1 py-2 rounded-lg font-bold text-lg ${selected ? 'bg-[#f6c453] text-[#2d1b0e]' : 'bg-gray-100 text-gray-500'}`
                  }>Login</Tab>
                  <Tab className={({ selected }) =>
                    `flex-1 py-2 rounded-lg font-bold text-lg ${selected ? 'bg-[#f6c453] text-[#2d1b0e]' : 'bg-gray-100 text-gray-500'}`
                  }>Register</Tab>
                </Tab.List>
                <Tab.Panels>
                  {/* Login Panel */}
                  <Tab.Panel>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={authForm.email}
                          onChange={handleAuthChange}
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                          type="password"
                          name="password"
                          value={authForm.password}
                          onChange={handleAuthChange}
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                          required
                        />
                      </div>
                      {authError && <div className="text-red-500 text-sm">{authError}</div>}
                      <button
                        type="submit"
                        className="w-full py-2 px-4 bg-[#f6c453] text-[#2d1b0e] font-bold rounded-lg hover:bg-[#e6be7e] transition"
                      >
                        Login
                      </button>
                    </form>
                  </Tab.Panel>
                  {/* Register Panel */}
                  <Tab.Panel>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">First Name</label>
                          <input
                            type="text"
                            name="first_name"
                            value={authForm.first_name}
                            onChange={handleAuthChange}
                            className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">Last Name</label>
                          <input
                            type="text"
                            name="last_name"
                            value={authForm.last_name}
                            onChange={handleAuthChange}
                            className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={authForm.email}
                          onChange={handleAuthChange}
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={authForm.phone}
                          onChange={handleAuthChange}
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                        <input
                          type="date"
                          name="birth_date"
                          value={authForm.birth_date}
                          onChange={handleAuthChange}
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                          type="password"
                          name="password"
                          value={authForm.password}
                          onChange={handleAuthChange}
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                          required
                        />
                      </div>
                      {authError && <div className="text-red-500 text-sm">{authError}</div>}
                      <button
                        type="submit"
                        className="w-full py-2 px-4 bg-[#f6c453] text-[#2d1b0e] font-bold rounded-lg hover:bg-[#e6be7e] transition"
                      >
                        Register
                      </button>
                    </form>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>
        </Dialog>
        {/* End Auth Modal */}
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
                onClick={() => { clearBookingLocalStorage(); window.location.reload(); }}
                className="btn-primary"
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }
  return (
    <>
      {/* Auth Modal */}
      <Dialog open={showAuthModal} onClose={() => setShowAuthModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6 z-10">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
              onClick={() => setShowAuthModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <Tab.Group selectedIndex={authTab} onChange={setAuthTab}>
              <Tab.List className="flex space-x-2 mb-6">
                <Tab className={({ selected }) =>
                  `flex-1 py-2 rounded-lg font-bold text-lg ${selected ? 'bg-[#f6c453] text-[#2d1b0e]' : 'bg-gray-100 text-gray-500'}`
                }>Login</Tab>
                <Tab className={({ selected }) =>
                  `flex-1 py-2 rounded-lg font-bold text-lg ${selected ? 'bg-[#f6c453] text-[#2d1b0e]' : 'bg-gray-100 text-gray-500'}`
                }>Register</Tab>
              </Tab.List>
              <Tab.Panels>
                {/* Login Panel */}
                <Tab.Panel>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={authForm.email}
                        onChange={handleAuthChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={authForm.password}
                        onChange={handleAuthChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                        required
                      />
                    </div>
                    {authError && <div className="text-red-500 text-sm">{authError}</div>}
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-[#f6c453] text-[#2d1b0e] font-bold rounded-lg hover:bg-[#e6be7e] transition"
                    >
                      Login
                    </button>
                  </form>
                </Tab.Panel>
                {/* Register Panel */}
                <Tab.Panel>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={authForm.first_name}
                          onChange={handleAuthChange}
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={authForm.last_name}
                          onChange={handleAuthChange}
                          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={authForm.email}
                        onChange={handleAuthChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={authForm.phone}
                        onChange={handleAuthChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                      <input
                        type="date"
                        name="birth_date"
                        value={authForm.birth_date}
                        onChange={handleAuthChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={authForm.password}
                        onChange={handleAuthChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-[#f6c453] focus:border-[#f6c453]"
                        required
                      />
                    </div>
                    {authError && <div className="text-red-500 text-sm">{authError}</div>}
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-[#f6c453] text-[#2d1b0e] font-bold rounded-lg hover:bg-[#e6be7e] transition"
                    >
                      Register
                    </button>
                  </form>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </Dialog>
      {/* End Auth Modal */}
      <main className="min-h-screen bg-gradient-to-br from-[#fef9f5] to-[#faf6f0] pb-24">
        <BookingProgressBar currentStep={currentStep} />
        <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-8">
          {/* Enhanced Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mb-2 sm:mb-4">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#2d1b0e] mb-2 sm:mb-4">
                Book Your Appointment
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-[#5d4e37] max-w-2xl mx-auto">
                Choose your services and secure your spot with our expert technicians
              </p>
            </div>
            {/* Trust Indicators - hide on xs, show on sm+ */}
            <div className="hidden sm:flex flex-wrap justify-center gap-4 mt-4 sm:mt-6">
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
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 mb-6 sm:mb-8">
                        {/* MANI */}
                        <button
                          onClick={() => {
                            setSelectedCategory('Mani');
                            setTimeout(() => {
                              serviceListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                          }}
                          className={`service-card p-6 text-center transition-all duration-300 group bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e]
                            ${selectedCategory === 'Mani' ? 'ring-2 ring-[#f6c453] bg-[#f6c453]' : 
                              'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'}`}
                          style={selectedCategory === 'Mani' ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                        >
                          <h3 className="text-xl md:text-2xl font-bold text-[#2d1b0e] mb-2">Manicure</h3>
                          <p className="text-[#8b7d6b] text-sm">Perfect nails for any occasion</p>
                        </button>

                        {/* MANI-PEDI */}
                        <button
                          onClick={() => {
                            setSelectedCategory('Mani & Pedi');
                            setTimeout(() => {
                              serviceListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                          }}
                          className={`service-card pt-7 pb-4 px-4 sm:p-6 text-center transition-all duration-300 group relative bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e]
                            ${selectedCategory === 'Mani & Pedi' ? 'ring-2 ring-[#f6c453] bg-[#f6c453]' : 
                              'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'}`}
                          style={selectedCategory === 'Mani & Pedi' ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                        >
                          <span
                            className="absolute top-1.5 right-1.5 bg-gradient-to-r from-[#d4af37] to-[#b87333] text-white text-[10px] font-bold rounded-full px-2 py-0.5 z-10 pointer-events-none"
                          >
                            Most Popular
                          </span>
                          <h3 className="text-xl md:text-2xl font-bold text-[#2d1b0e] mb-2">Mani & Pedi</h3>
                          <p className="text-[#8b7d6b] text-sm">Complete nail care experience</p>
                        </button>
                        {/* PEDI */}
                        <button
                          onClick={() => {
                            setSelectedCategory('Pedi');
                            setTimeout(() => {
                              serviceListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                          }}
                          className={`service-card p-6 text-center transition-all duration-300 group bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e]
                            ${selectedCategory === 'Pedi' ? 'ring-2 ring-[#f6c453] bg-[#f6c453]' : 
                              'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'}`}
                          style={selectedCategory === 'Pedi' ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                        >
                          <h3 className="text-xl md:text-2xl font-bold text-[#2d1b0e] mb-2">Pedicure</h3>
                          <p className="text-[#8b7d6b] text-sm">Beautiful feet for sandal season</p>
                        </button>

                        {/* EXTENSIONS */}
                        <button
                          onClick={() => {
                            setSelectedCategory('Nail Extension & Enhancements');
                            setTimeout(() => {
                              serviceListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                          }}
                          className={`service-card p-6 text-center transition-all duration-300 group bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e]
                            ${selectedCategory === 'Nail Extension & Enhancements' ? 'ring-2 ring-[#f6c453] bg-[#f6c453]' : 
                              'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'}`}
                          style={selectedCategory === 'Nail Extension & Enhancements' ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                        >
                          <h3 className="text-xl md:text-2xl font-bold text-[#2d1b0e] mb-2">Extensions & Enhancement</h3>
                          <p className="text-[#8b7d6b] text-sm">Add length and strength</p>
                        </button>
                      </div>

                      {/* Service List */}
                      <div ref={serviceListRef} className="mt-4 sm:mt-0">
                        {selectedCategory === 'Mani & Pedi' ? (
                          <div className="space-y-8">
                            {/* MANI-PEDI — MANICURES */}
                            <div>
                              <h4 className="text-xl font-bold text-[#2d1b0e] mb-4 flex items-center gap-2">
                                Manicures
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {maniPediServices.filter(s => s.group === 'MANI-PEDI — MANICURES').map(service => (
                                  <div
                                    key={service.name}
                                    className={`service-card p-4 cursor-pointer transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] relative` +
                                      (selectedManiPediManicure && selectedManiPediManicure.name === service.name ? 
                                        'ring-2 ring-[#f6c453] bg-[#f6c453]' : 
                                        'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5')}
                                    onClick={() => setSelectedManiPediManicure(selectedManiPediManicure && selectedManiPediManicure.name === service.name ? null : service)}
                                    style={selectedManiPediManicure && selectedManiPediManicure.name === service.name ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{service.name}</h5>
                                    </div>
                                    <p className="text-[#8b7d6b] text-xs mb-2">{service.description}</p>
                                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                                      <span className="text-xs text-[#8b7d6b]">{service.duration} mins</span>
                                      <span className="text-xs font-bold text-[#2d1b0e]">{typeof service.price === 'number' ? `£${service.price}` : service.price}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* MANI-PEDI — PEDICURES */}
                            <div>
                              <h4 className="text-xl font-bold text-[#2d1b0e] mb-4 flex items-center gap-2">
                                Pedicures
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {maniPediServices.filter(s => s.group === 'MANI-PEDI — PEDICURES' || !s.group).map(service => (
                                  <div
                                    key={service.name}
                                    className={`service-card p-4 cursor-pointer transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] relative` +
                                      (selectedManiPediPedicure && selectedManiPediPedicure.name === service.name ? 
                                        'ring-2 ring-[#f6c453] bg-[#f6c453]' : 
                                        'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5')}
                                    onClick={() => setSelectedManiPediPedicure(selectedManiPediPedicure && selectedManiPediPedicure.name === service.name ? null : service)}
                                    style={selectedManiPediPedicure && selectedManiPediPedicure.name === service.name ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{service.name}</h5>
                                    </div>
                                    <p className="text-[#8b7d6b] text-xs mb-2">{service.description}</p>
                                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                                      <span className="text-xs text-[#8b7d6b]">{service.duration} mins</span>
                                      <span className="text-xs font-bold text-[#2d1b0e]">{typeof service.price === 'number' ? `£${service.price}` : service.price}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : selectedCategory === 'Mani' ? (
        <div>
                        <h4 className="text-xl font-bold text-[#2d1b0e] mb-6 flex items-center gap-2">
                          Manicure Services
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {maniServices.map(service => (
                            <div
                              key={service.name}
                              className={`service-card p-4 cursor-pointer transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] relative` +
                                (selectedService && selectedService.name === service.name ?
                                  ' ring-2 ring-[#f6c453] bg-[#f6c453]' :
                                  ' hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5')}
                              onClick={() => {
                                if (service.name === 'CLASSIC MANICURE - BIAB') {
                                  setSelectedService(service);
                                  setStep1Stage('biabVariant');
                                } else {
                                  setSelectedService(selectedService && selectedService.name === service.name ? null : service);
                                }
                              }}
                              style={selectedService && selectedService.name === service.name ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                            >
                              <div className="mb-2">
                                <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{service.name}</h5>
                              </div>
                              <p className="text-[#8b7d6b] text-xs mb-2">{service.description}</p>
                              {/* Duration & Price bottom right */}
                              <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                                <span className="text-xs text-[#8b7d6b]">{service.duration} mins</span>
                                <span className="text-xs font-bold text-[#2d1b0e]">{typeof service.price === 'number' ? `£${service.price}` : service.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : selectedCategory === 'Pedi' ? (
                      <div>
                        <h4 className="text-xl font-bold text-[#2d1b0e] mb-6 flex items-center gap-2">
                          Pedicure Services
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pediServices.map(service => (
                            <div
                              key={service.name}
                              className={`service-card p-4 cursor-pointer transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] relative` +
                                (selectedService && selectedService.name === service.name ?
                                  ' ring-2 ring-[#f6c453] bg-[#f6c453]' :
                                  ' hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5')}
                              onClick={() => setSelectedService(selectedService && selectedService.name === service.name ? null : service)}
                              style={selectedService && selectedService.name === service.name ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{service.name}</h5>
                              </div>
                              <p className="text-[#8b7d6b] text-xs mb-2">{service.description}</p>
                              <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                                <span className="text-xs text-[#8b7d6b]">{service.duration} mins</span>
                                <span className="text-xs font-bold text-[#2d1b0e]">{typeof service.price === 'number' ? `£${service.price}` : service.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : selectedCategory === 'Nail Extension & Enhancements' ? (
                      <div>
                        <h4 className="text-xl font-bold text-[#2d1b0e] mb-6 flex items-center gap-2">
                          Nail Extensions & Enhancements
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {nailExtensionEnhancements.map(service => (
                            <div
                              key={service.name}
                              className={`service-card p-4 cursor-pointer transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] relative` +
                                (selectedService && selectedService.name === service.name ?
                                  ' ring-2 ring-[#f6c453] bg-[#f6c453]' :
                                  ' hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5')}
                              onClick={() => {
                                if (service.name === 'Acrylic Extensions') {
                                  setSelectedService(service);
                                  setStep1Stage('acrylicOptions');
                                } else {
                                  setSelectedService(selectedService && selectedService.name === service.name ? null : service);
                                }
                              }}
                              style={selectedService && selectedService.name === service.name ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{service.name}</h5>
                              </div>
                              <p className="text-[#8b7d6b] text-xs mb-2">{service.description}</p>
                              <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                                <span className="text-xs text-[#8b7d6b]">{service.duration} mins</span>
                                <span className="text-xs font-bold text-[#2d1b0e]">{typeof service.price === 'number' ? `£${service.price}` : service.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-[#8b7d6b] py-8">
                        <p className="text-lg">Select a service category above to see available options</p>
                      </div>
                    )}
                    </div>

                    {/* Next Button */}
                    {selectedCategory && (
                      <div className="mt-6 sm:mt-8 text-center">
                        <button
                          onClick={nextStep}
                          className="btn-primary w-full sm:w-auto py-3 text-base min-w-[160px] px-6 font-bold"
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
                  <div className="service-card p-4 sm:p-8">
                    <h2 className="text-center text-3xl md:text-4xl font-bold text-[#2d1b0e] mb-8">
                      {selectedCategory === 'Mani & Pedi'
                        ? addonsStepIndex === 0
                          ? 'Choose Your Manicure Add-ons'
                          : 'Choose Your Pedicure Add-ons'
                        : 'Choose Your Add-ons'}
                    </h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 mb-6 sm:mb-8">
                      {selectedCategory === 'Mani & Pedi'
                        ? (addonsStepIndex === 0
                            ? (
                              (selectedManiPediManicure &&
                                ((selectedManiPediManicure.name === 'CLASSIC MANICURE - NO COLOUR' || selectedManiPediManicure.name === 'CLASSIC PEDICURE - NO COLOUR')
                                  ? allAddOns.filter((addon, idx, arr) => addon.name === 'Extended Massage' && arr.findIndex(a => a.name === 'Extended Massage') === idx)
                                  : selectedManiPediManicure.name === 'CLASSIC MANICURE - GEL'
                                    ? allAddOns.filter(addon => addon.onlyFor === 'CLASSIC MANICURE - GEL')
                                    : selectedManiPediManicure.name === 'CLASSIC MANICURE - POLISH'
                                      ? allAddOns.filter(addon => addon.onlyFor === 'CLASSIC MANICURE - POLISH')
                                      : selectedManiPediManicure.name === 'SNS CLASSIC DIPPING POWDER'
                                        ? allAddOns.filter(addon => addon.onlyFor === 'SNS CLASSIC DIPPING POWDER')
                                        : allAddOns.filter(addon => !addon.onlyFor)
                                )
                              ).map(addon => (
                                <div
                                  key={addon.name}
                                  className={`service-card p-4 cursor-pointer transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] relative` +
                                    (selectedAddOnsMani.includes(addon.name) ?
                                      'ring-2 ring-[#f6c453] bg-[#f6c453]' :
                                      'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5')}
                                  onClick={() => {
                                    if (selectedAddOnsMani.includes(addon.name)) {
                                      setSelectedAddOnsMani(selectedAddOnsMani.filter(a => a !== addon.name));
                                      setNoAddOnsMani(false);
                                    } else {
                                      setSelectedAddOnsMani([...selectedAddOnsMani, addon.name]);
                                      setNoAddOnsMani(false);
                                    }
                                  }}
                                  style={selectedAddOnsMani.includes(addon.name) ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{addon.name}</h5>
                                  </div>
                                  <p className="text-[#8b7d6b] text-xs mb-2">{addon.description}</p>
                                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                                    <span className="text-xs text-[#8b7d6b]">{addon.duration} mins</span>
                                    <span className="text-xs font-bold text-[#2d1b0e]">{typeof addon.price === 'number' ? `£${addon.price}` : addon.price}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              (selectedManiPediPedicure &&
                                ((selectedManiPediPedicure.name === 'CLASSIC MANICURE - NO COLOUR' || selectedManiPediPedicure.name === 'CLASSIC PEDICURE - NO COLOUR')
                                  ? allAddOns.filter((addon, idx, arr) => addon.name === 'Extended Massage' && arr.findIndex(a => a.name === 'Extended Massage') === idx)
                                  : selectedManiPediPedicure.name === 'CLASSIC PEDICURE - GEL'
                                    ? allAddOns.filter(addon => addon.onlyFor === 'CLASSIC PEDICURE - GEL')
                                    : selectedManiPediPedicure.name === 'CLASSIC PEDICURE - POLISH'
                                      ? allAddOns.filter(addon => addon.onlyFor === 'CLASSIC PEDICURE - POLISH')
                                      : allAddOns.filter(addon => !addon.onlyFor)
                                )
                              ).map(addon => (
                                <div
                                  key={addon.name}
                                  className={`service-card p-4 cursor-pointer transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] relative` +
                                    (selectedAddOnsPedi.includes(addon.name) ?
                                      'ring-2 ring-[#f6c453] bg-[#f6c453]' :
                                      'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5')}
                                  onClick={() => {
                                    if (selectedAddOnsPedi.includes(addon.name)) {
                                      setSelectedAddOnsPedi(selectedAddOnsPedi.filter(a => a !== addon.name));
                                      setNoAddOnsPedi(false);
                                    } else {
                                      setSelectedAddOnsPedi([...selectedAddOnsPedi, addon.name]);
                                      setNoAddOnsPedi(false);
                                    }
                                  }}
                                  style={selectedAddOnsPedi.includes(addon.name) ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{addon.name}</h5>
                                  </div>
                                  <p className="text-[#8b7d6b] text-xs mb-2">{addon.description}</p>
                                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                                    <span className="text-xs text-[#8b7d6b]">{addon.duration} mins</span>
                                    <span className="text-xs font-bold text-[#2d1b0e]">{typeof addon.price === 'number' ? `£${addon.price}` : addon.price}</span>
                                  </div>
                                </div>
                              ))
                            )
                          )
                        : (
                          // Default single-service add-ons logic
                          (selectedService && selectedService.name === 'CLASSIC MANICURE - BIAB' && selectedBiabVariant)
                            ? allAddOns.filter(addon => addon.onlyFor === 'CLASSIC MANICURE - BIAB').map(addon => (
                                <div
                                  key={addon.name}
                                  className={`service-card p-4 cursor-pointer transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] relative` +
                                    (selectedAddOns.includes(addon.name) ?
                                      'ring-2 ring-[#f6c453] bg-[#f6c453]' :
                                      'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5')}
                                  onClick={() => {
                                    if (selectedAddOns.includes(addon.name)) {
                                      setSelectedAddOns(selectedAddOns.filter(a => a !== addon.name));
                                      setNoAddOns(false);
                                    } else {
                                      setSelectedAddOns([...selectedAddOns, addon.name]);
                                      setNoAddOns(false);
                                    }
                                  }}
                                  style={selectedAddOns.includes(addon.name) ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{addon.name}</h5>
                                  </div>
                                  <p className="text-[#8b7d6b] text-xs mb-2">{addon.description}</p>
                                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                                    <span className="text-xs text-[#8b7d6b]">{addon.duration} mins</span>
                                    <span className="text-xs font-bold text-[#2d1b0e]">{typeof addon.price === 'number' ? `£${addon.price}` : addon.price}</span>
                                  </div>
                                </div>
                              ))
                            : (selectedService && (selectedService.name === 'CLASSIC MANICURE - NO COLOUR' || selectedService.name === 'CLASSIC PEDICURE - NO COLOUR')
                              ? allAddOns.filter((addon, idx, arr) => addon.name === 'Extended Massage' && arr.findIndex(a => a.name === 'Extended Massage') === idx)
                              : selectedService && selectedService.name === 'CLASSIC MANICURE - GEL'
                                ? allAddOns.filter(addon => addon.onlyFor === 'CLASSIC MANICURE - GEL')
                                : selectedService && selectedService.name === 'CLASSIC MANICURE - POLISH'
                                  ? allAddOns.filter(addon => addon.onlyFor === 'CLASSIC MANICURE - POLISH')
                                  : selectedService && selectedService.name === 'CLASSIC PEDICURE - GEL'
                                    ? allAddOns.filter(addon => addon.onlyFor === 'CLASSIC PEDICURE - GEL')
                                    : selectedService && selectedService.name === 'CLASSIC PEDICURE - POLISH'
                                      ? allAddOns.filter(addon => addon.onlyFor === 'CLASSIC PEDICURE - POLISH')
                                      : selectedService && selectedService.name === 'SNS CLASSIC DIPPING POWDER'
                                        ? allAddOns.filter(addon => addon.onlyFor === 'SNS CLASSIC DIPPING POWDER')
                                        : allAddOns.filter(addon => !addon.onlyFor)
                            ).map(addon => (
                              <div
                                key={addon.name}
                                className={`service-card p-4 cursor-pointer transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] relative` +
                                  (selectedAddOns.includes(addon.name) ?
                                    'ring-2 ring-[#f6c453] bg-[#f6c453]' :
                                    'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5')}
                                onClick={() => {
                                  if (selectedAddOns.includes(addon.name)) {
                                    setSelectedAddOns(selectedAddOns.filter(a => a !== addon.name));
                                    setNoAddOns(false);
                                  } else {
                                    setSelectedAddOns([...selectedAddOns, addon.name]);
                                    setNoAddOns(false);
                                  }
                                }}
                                style={selectedAddOns.includes(addon.name) ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{addon.name}</h5>
                                </div>
                                <p className="text-[#8b7d6b] text-xs mb-2">{addon.description}</p>
                                <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                                  <span className="text-xs text-[#8b7d6b]">{addon.duration} mins</span>
                                  <span className="text-xs font-bold text-[#2d1b0e]">{typeof addon.price === 'number' ? `£${addon.price}` : addon.price}</span>
                                </div>
                              </div>
                            ))
                        )}
                    </div>
                    {/* No Add-ons Button */}
                    {selectedCategory === 'Mani & Pedi' ? (
                      <div className="text-center mb-6 sm:mb-8">
                        <button
                          className={`service-card p-4 w-full transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] ${
                            (addonsStepIndex === 0 ? noAddOnsMani : noAddOnsPedi)
                              ? 'ring-2 ring-[#f6c453] bg-[#f6c453]'
                              : 'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'
                          }`}
                          onClick={() => {
                            if (addonsStepIndex === 0) {
                              setNoAddOnsMani(true);
                              setSelectedAddOnsMani([]);
                            } else {
                              setNoAddOnsPedi(true);
                              setSelectedAddOnsPedi([]);
                            }
                          }}
                          style={(addonsStepIndex === 0 ? noAddOnsMani : noAddOnsPedi) ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                        >
                          <span className="text-base sm:text-lg font-bold text-[#2d1b0e]">No Add-ons Needed</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center mb-6 sm:mb-8">
                        <button
                          className={`service-card p-4 w-full transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] ${
                            noAddOns ? 'ring-2 ring-[#f6c453] bg-[#f6c453]' :
                            'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'
                          }`}
                          onClick={() => {
                            setNoAddOns(true);
                            setSelectedAddOns([]);
                            setStep1Stage('removal');
                          }}
                          style={noAddOns ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                        >
                          <span className="text-base sm:text-lg font-bold text-[#2d1b0e]">No Add-ons Needed</span>
                        </button>
                      </div>
                    )}
                    {/* Navigation Buttons */}
                    <div className="flex justify-end gap-2 mt-6 sm:mt-8">
                      <button
                        className="btn-secondary w-full sm:w-auto py-3 text-base min-w-[160px] px-6 font-bold"
                        onClick={() => {
                          setStep1Stage('service');
                          setSelectedAddOns([]);
                          setNoAddOns(false);
                          setSelectedAddOnsMani([]);
                          setSelectedAddOnsPedi([]);
                          setNoAddOnsMani(false);
                          setNoAddOnsPedi(false);
                        }}
                      >
                        Back to Services
                      </button>
                      <button
                        onClick={nextStep}
                        className="btn-primary w-full sm:w-auto py-3 text-base min-w-[160px] px-6 font-bold"
                        disabled={selectedCategory === 'Mani & Pedi'
                          ? (addonsStepIndex === 0
                              ? !(selectedAddOnsMani.length > 0 || noAddOnsMani)
                              : !(selectedAddOnsPedi.length > 0 || noAddOnsPedi))
                          : !(selectedAddOns.length > 0 || noAddOns)
                        }
                      >
                        {selectedCategory === 'Mani & Pedi'
                          ? (addonsStepIndex === 0 ? 'Continue to Pedicure Add-ons' : 'Continue to Removal')
                          : 'Continue to Removal'}
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
                        className={`service-card p-8 text-center transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] ${
                          needsRemoval === true ? 'ring-2 ring-[#f6c453] bg-[#f6c453]' : 
                          'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'
                        }`}
                        onClick={() => {
                          setNeedsRemoval(true);
                          setStep1Stage('removalType');
                        }}
                        style={needsRemoval === true ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                      >
                        <span className="text-xl font-bold text-[#2d1b0e]">Yes, I need removal</span>
                      </button>
                      <button
                        className={`service-card p-8 text-center transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] ${
                          needsRemoval === false ? 'ring-2 ring-[#f6c453] bg-[#f6c453]' : 
                          'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'
                        }`}
                        onClick={() => {
                          setNeedsRemoval(false);
                          setCurrentStep(2);
                        }}
                        style={needsRemoval === false ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                      >
                        <span className="text-xl font-bold text-[#2d1b0e]">No removal needed</span>
                      </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-end gap-2 mt-6 sm:mt-8">
                      <button
                        className="btn-secondary w-full sm:w-auto py-3 text-base min-w-[160px] px-6 font-bold"
                        onClick={() => setStep1Stage('addons')}
                      >
                        Back to Add-ons
                      </button>
                      <button
                        onClick={nextStep}
                        className="btn-primary w-full sm:w-auto py-3 text-base min-w-[160px] px-6 font-bold"
                      >
                        Continue
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
                      {(
                        selectedService && selectedService.name === 'CLASSIC MANICURE - NO COLOUR'
                          ? [
                              'BIAB Removal',
                              'SNS Dipping Powder Removal',
                              'Gel Polish Removal',
                              { name: 'REMOVAL OF HARD GEL, EXTENSIONS OR ACRYLICS', duration: 40, price: 30 }
                            ]
                        : selectedService && selectedService.name === 'CLASSIC PEDICURE - NO COLOUR'
                          ? [
                              'BIAB Removal',
                              'Gel Polish Removal'
                            ]
                        : selectedService && selectedService.name === 'CLASSIC MANICURE - GEL'
                            ? [
                                'BIAB Removal',
                                'SNS Dipping Powder Removal',
                                'Gel Polish Removal',
                                { name: 'REMOVAL OF HARD GEL, EXTENSIONS OR ACRYLICS', duration: 40, price: 30 }
                              ]
                            : selectedService && selectedService.name === 'CLASSIC MANICURE - POLISH'
                              ? [
                                  'BIAB Removal',
                                  'SNS Dipping Powder Removal',
                                  'Gel Polish Removal',
                                  { name: 'REMOVAL OF HARD GEL, EXTENSIONS OR ACRYLICS', duration: 40, price: 30 }
                                ]
                              : selectedService && selectedService.name === 'CLASSIC PEDICURE - GEL'
                                ? [
                                    'BIAB Removal',
                                    'SNS Dipping Powder Removal',
                                    'Gel Polish Removal'
                                  ]
                              : selectedService && selectedService.name === 'CLASSIC PEDICURE - POLISH'
                                ? [
                                    'BIAB Removal',
                                    'SNS Dipping Powder Removal',
                                    'Gel Polish Removal'
                                  ]
                              : selectedService && selectedService.name === 'SNS CLASSIC DIPPING POWDER'
                                ? [
                                    'SNS Dipping Powder Removal',
                                    'Gel Polish Removal',
                                    { name: 'REMOVAL OF HARD GEL, EXTENSIONS OR ACRYLICS', duration: 40, price: 30 }
                                  ]
                              : removalOptions
                      ).map(option => {
                        const isObj = typeof option === 'object';
                        const label = isObj ? option.name : option;
                        let price = option.price;
                        let duration = isObj ? (option.duration ? `${option.duration} mins` : 'Duration varies') : 'Duration varies';
                        if (typeof price === 'number') price = `£${price}`;
                        if (label === 'BIAB Removal') {
                          duration = '20 mins';
                          price = '£14';
                        }
                        if (label === 'SNS Dipping Powder Removal') {
                          duration = '15 mins';
                          price = '£10';
                        }
                        if (label === 'Gel Polish Removal') {
                          duration = '15 mins';
                          price = '£10';
                        }
                        if (label === 'REMOVAL OF HARD GEL, EXTENSIONS OR ACRYLICS') {
                          duration = '25 mins';
                          price = '£20';
                        }
                        return (
                          <div
                            key={label}
                            className={`service-card p-4 cursor-pointer transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] relative` +
                              (selectedRemovalType === label ?
                                'ring-2 ring-[#f6c453] bg-[#f6c453]' :
                                'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5')}
                            onClick={() => setSelectedRemovalType(selectedRemovalType === label ? null : label)}
                            style={selectedRemovalType === label ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                          >
                            {/* Special case: split label for REMOVAL OF HARD GEL, EXTENSIONS OR ACRYLICS */}
                            {label === 'REMOVAL OF HARD GEL, EXTENSIONS OR ACRYLICS' ? (
                              <>
                                <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base mb-0">Removal of Hard gel,</h5>
                                <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base mb-2">Extensions or Acrylics</h5>
                              </>
                            ) : (
                              <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base mb-2">{label}</h5>
                            )}
                            {/* Only show duration/price block if not 'REMOVAL OF HARD GEL, EXTENSIONS OR ACRYLICS' */}
                            {label !== 'REMOVAL OF HARD GEL, EXTENSIONS OR ACRYLICS' && !['BIAB Removal', 'SNS Dipping Powder Removal', 'Gel Polish Removal'].includes(label) && (
                              <div className="flex justify-between items-center text-xs text-[#8b7d6b]">
                                <span>{duration}</span>
                                <span>{price}</span>
                              </div>
                            )}
                            {/* Duration & Price bottom right (keep for all, unless you want to remove for this option as well) */}
                            <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                              <span className="text-xs text-[#8b7d6b]">{duration}</span>
                              <span className="text-xs font-bold text-[#2d1b0e]">{price}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Navigation */}
                    {error && currentStep === 2 && (
                      <div className="w-full mb-4">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-red-500">⚠️</span>
                            <p className="text-red-600 font-medium text-sm">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 mt-8">
                      <button
                        className="btn-secondary w-full sm:w-auto py-3 text-base min-w-[160px] px-6 font-bold"
                        onClick={() => { setStep1Stage('removal'); setError(""); }}
                      >
                        Back to Removal Question
                      </button>
                      <button
                        onClick={() => {
                          if (!selectedRemovalType) {
                            setError('Please select a removal type.');
                            return;
                          }
                          setCurrentStep(2);
                          setStep1Stage('service');
                          setError("");
                        }}
                        className="btn-primary w-full sm:w-auto py-3 text-base min-w-[160px] px-6 font-bold"
                        disabled={false}
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
                                className={`service-card p-4 cursor-pointer transition-all duration-300 border-2 text-[#2d1b0e] ${isSelected ? 'ring-2 ring-[#e6be7e]' : 'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'}`}
                                style={isSelected ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                                onClick={() => {
                                  setForm(prevForm => ({ ...prevForm, staff_id: member.id }));
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gradient-to-r from-[#d4af37] to-[#b87333] rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-[#2d1b0e]">
                                      {member.id === 'any'
                                        ? 'Any professional'
                                        : member.first_name}
                                    </h4>
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
                    <div className="mb-6 sm:mb-8">
                      <h3 className="text-lg sm:text-xl font-bold text-[#2d1b0e] mb-2 sm:mb-4 flex items-center gap-2">
                        Select Your Date
                      </h3>
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <button
                          type="button"
                          onClick={goToPrevMonth}
                          className={`p-2 rounded-full hover:bg-gray-100 ${isCurrentMonth ? 'opacity-50 cursor-not-allowed' : ''}`}
                          aria-label="Previous Month"
                          disabled={isCurrentMonth}
                        >
                          <FaChevronLeft />
                        </button>
                        <div className="text-base sm:text-lg font-bold text-center flex-1">
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
                        <div className="flex min-w-max gap-2 sm:gap-4 pb-2">
                          {getDaysInMonth(currentMonth).map(date => {
                            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                            return (
                              <button
                                key={date.toISOString()}
                                onClick={() => setSelectedDate(date)}
                                className={`flex flex-col items-center px-2 py-2 sm:px-4 sm:py-2 rounded-lg border-2 transition-all duration-300 focus:outline-none ${
                                  isSelected
                                    ? 'ring-2 ring-[#e6be7e] bg-[#fff3d1] border-[#e6be7e]'
                                    : 'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'
                                }`}
                                style={{ minWidth: 48, maxWidth: 64 }}
                              >
                                <span className="text-xs font-semibold uppercase tracking-widest">
                                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                <span className="text-base sm:text-lg font-bold">
                                  {date.getDate()}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Time Selection */}
                    <div className="mb-6 sm:mb-8">
                      <h3 className="text-lg sm:text-xl font-bold text-[#2d1b0e] mb-2 sm:mb-4 flex items-center gap-2">
                        Select Your Time
                      </h3>
                      {selectedDate ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {generateTimeSlotsForDay(selectedDate, openHours).map(time => {
                            const [hours, minutes] = time.split(':').map(Number);
                            const year = selectedDate.getFullYear();
                            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                            const day = String(selectedDate.getDate()).padStart(2, '0');
                            const hour = String(hours).padStart(2, '0');
                            const minute = String(minutes).padStart(2, '0');
                            const datetimeString = `${year}-${month}-${day}T${hour}:${minute}`;

                            // --- Real-time disabling logic ---
                            const isToday = selectedDate.getFullYear() === now.getFullYear() &&
                              selectedDate.getMonth() === now.getMonth() &&
                              selectedDate.getDate() === now.getDate();
                            let slotDate = new Date(selectedDate);
                            slotDate.setHours(hours, minutes, 0, 0);
                            const isPast = isToday && slotDate < now;
                            // --- End real-time disabling logic ---

                            return (
                              <button
                                key={time}
                                onClick={() => {
                                  if (!isPast) {
                                    setForm({ ...form, appointment_datetime: datetimeString });
                                  }
                                }}
                                className={`p-2 sm:p-3 text-center rounded-lg border-2 transition-all duration-300 text-xs sm:text-base ${
                                  form.appointment_datetime === datetimeString
                                    ? 'ring-2 ring-[#e6be7e] bg-[#fff3d1] border-[#e6be7e]'
                                    : isPast
                                      ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400'
                                      : 'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5'
                                }`}
                                disabled={isPast}
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
                    {/* Error message block goes here */}
      {error && (
        <div className="w-full mb-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <p className="text-red-600 font-medium text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}


                    {/* Navigation */}
                    <div className="flex justify-end gap-2 mt-6 sm:mt-8">
                      <button
                        className="btn-secondary w-full sm:w-auto py-3 text-base min-w-[160px] px-6 font-bold"
                        onClick={() => {
                          if (needsRemoval === false) {
                            setCurrentStep(1);
                            setStep1Stage('removal');
                          } else {
                            setCurrentStep(1);
                            setStep1Stage('removalType');
                          }
                        }}
                      >
                        Back to Removal
                      </button>
                      <button
                        onClick={nextStep}
                        className="btn-primary w-full sm:w-auto py-3 text-base min-w-[160px] px-6 font-bold"
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
                  <div className="service-card p-6 sm:p-8">
                    {/* Reservation Expiry Timer */}
                    <div className="mb-8 sm:mb-10 text-center">
                      <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold text-base">
                        Your reservation will expire in {`${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}`}
                      </span>
                    </div>
                    {/* Booking Summary */}
                    <div className="mb-10">
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
                      {/* Total, Discount, and Duration */}
                      <div className="mt-8 space-y-2">
                        <div className="flex justify-between items-center text-lg font-bold border-t pt-4">
                          <span>Total:</span>
                          <span>
                            £{(getTotalPrice() - (appliedPromo ? promoDiscount : 0)).toFixed(2)}
                          </span>
                        </div>
                        {appliedPromo && (
                          <div className="flex justify-between items-center text-base text-green-700">
                            <span>Promo ({promoCode.toUpperCase()}):</span>
                            <span>-£{promoDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-base text-[#8b7d6b]">
                          <span>Total Duration:</span>
                          <span>{getTotalDuration()} mins</span>
                        </div>
                      </div>
                    </div>
                    {/* Promo Code and Card Payment Row */}
                    <div className="flex flex-col sm:flex-row gap-6 mb-10">
                      {/* Promo Code Box */}
                      <div className="flex-1 max-w-xs bg-[#fff3d1] border border-[#e6be7e] rounded-xl p-3 flex flex-col justify-center shadow-sm">
                        <label className="text-xs font-semibold text-[#2d1b0e] mb-1">Promo Code</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Enter promo code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="flex-1 p-2 text-sm border border-[#d4af37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] min-w-0"
                            style={{ minWidth: 0 }}
                          />
                          <button
                            onClick={handleApplyPromo}
                            className="px-3 py-2 bg-gradient-to-r from-[#d4af37] to-[#b87333] text-white font-bold rounded-lg text-xs hover:from-[#b87333] hover:to-[#d4af37] transition-all duration-300"
                            style={{ minWidth: 0 }}
                          >
                            Apply
                          </button>
                        </div>
                        {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                        {promoMessage && <p className="text-green-600 text-xs mt-1">{promoMessage}</p>}
                      </div>
                      {/* Card Payment Box */}
                      <div className="flex-1 max-w-xs flex flex-col justify-center bg-[#fff3d1] border border-[#e6be7e] rounded-xl p-3 shadow-sm">
                        <div className="text-[#2d1b0e] text-xs font-semibold text-center mb-2">
                          Secure your booking with your bank card.<br />
                          <span className="text-[#8b7d6b] text-xs">Your card will not be charged until after your appointment.</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center mr-3">
                            <svg width="20" height="20" fill="none" stroke="#d4af37" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="2" y="6" width="20" height="12" rx="2" stroke="#d4af37" strokeWidth="2"/>
                              <path d="M2 10h20" stroke="#d4af37" strokeWidth="2"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-[#2d1b0e] text-sm">Card Payment</div>
                            <div className="text-[#8b7d6b] text-xs">Secure payment processing</div>
                          </div>
                          <div>
                            <svg width="16" height="16" fill="none" stroke="#d4af37" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M9 6l6 6-6 6" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Agreement */}
                    <div className="mb-8 sm:mb-10">
                      <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreementChecked}
                          onChange={(e) => setAgreementChecked(e.target.checked)}
                          className="mt-1 w-4 h-4 text-[#d4af37] border-[#d4af37] rounded focus:ring-[#d4af37]"
                        />
                        <span className="text-[#8b7d6b] text-xs sm:text-sm">
                          I agree to the terms and conditions and confirm that I will arrive on time for my appointment.
                        </span>
                      </label>
                    </div>
                    {/* Navigation */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-8">
                      <div className="w-full flex">
                        <button
                          className="btn-secondary w-full sm:w-auto py-3 text-base min-w-[160px] px-6 font-bold"
                          onClick={() => {
                            setCurrentStep(2);
                          }}
                        >
                          Back to Staff & Time
                        </button>
                      </div>
                      <div className="w-full flex">
                        <button
                          type="submit"
                          className="btn-primary w-full sm:w-auto py-3 text-base min-w-[160px] px-6 font-bold"
                          disabled={!agreementChecked}
                        >
                          Confirm Booking
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* BIAB Variant Selection */}
              {currentStep === 1 && step1Stage === 'biabVariant' && (
                <motion.div
                  key="biabVariant"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="service-card p-8">
                    <h2 className="text-center text-3xl md:text-4xl font-bold text-[#2d1b0e] mb-8">
                      Choose Your BIAB Option
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {biabVariants.map(variant => (
                        <div
                          key={variant.name}
                          className={`service-card p-4 cursor-pointer transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] relative` +
                            (selectedBiabVariant && selectedBiabVariant.name === variant.name ?
                              'ring-2 ring-[#f6c453] bg-[#f6c453]' :
                              'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5')}
                          onClick={() => setSelectedBiabVariant(selectedBiabVariant && selectedBiabVariant.name === variant.name ? null : variant)}
                          style={selectedBiabVariant && selectedBiabVariant.name === variant.name ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                      >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{variant.name}</h5>
                          </div>
                          <p className="text-[#8b7d6b] text-xs mb-2">{variant.description}</p>
                          <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                            <span className="text-xs text-[#8b7d6b]">{variant.duration} mins</span>
                            <span className="text-xs font-bold text-[#2d1b0e]">{typeof variant.price === 'number' ? `£${variant.price}` : variant.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-6 sm:mt-8">
                      <button
                        className="btn-secondary w-full sm:w-auto py-3 text-base min-w-[160px] px-6 font-bold"
                        onClick={() => setStep1Stage('service')}
                      >
                        Back to Services
                      </button>
                      <button
                        onClick={() => {
                          if (!selectedBiabVariant) return;
                          if (selectedBiabVariant.name === 'BIAB Removal') {
                            setCurrentStep(2); // Go directly to confirmation
                          } else {
                            setStep1Stage('addons');
                          }
                        }}
                        className="btn-primary w-full sm:w-auto py-3 text-base min-w-[160px] px-6 font-bold"
                        disabled={!selectedBiabVariant}
                      >
                        Continue{selectedBiabVariant && selectedBiabVariant.name === 'BIAB Removal' ? ' to Confirmation' : ' to Add-ons'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Acrylic Options Subpage */}
              {currentStep === 1 && step1Stage === 'acrylicOptions' && selectedService && selectedService.name === 'Acrylic Extensions' && (
                <motion.div
                  key="acrylicOptions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="service-card p-8">
                    <h2 className="text-center text-3xl md:text-4xl font-bold text-[#2d1b0e] mb-8">
                      Choose Your Acrylic Extension Option
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {selectedService.children && selectedService.children.filter(opt => !opt.removalOptions).map(opt => (
                        <div
                          key={opt.name}
                          className={`service-card p-4 cursor-pointer transition-all duration-300 bg-[#f6c453] border-2 border-[#d4af37] text-[#2d1b0e] relative` +
                            (selectedAcrylicOption && selectedAcrylicOption.name === opt.name ? 'ring-2 ring-[#f6c453] bg-[#f6c453]' : 'hover:bg-gradient-to-br hover:from-[#d4af37]/5 hover:to-[#b87333]/5')}
                          onClick={() => setSelectedAcrylicOption(selectedAcrylicOption && selectedAcrylicOption.name === opt.name ? null : opt)}
                          style={selectedAcrylicOption && selectedAcrylicOption.name === opt.name ? { background: '#fff3d1', borderColor: '#e6be7e' } : {}}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-[#2d1b0e] text-sm md:text-base">{opt.name}</h5>
                          </div>
                          <p className="text-[#8b7d6b] text-xs mb-2">{opt.description}</p>
                          <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                            <span className="text-xs text-[#8b7d6b]">{opt.duration} mins</span>
                            <span className="text-xs font-bold text-[#2d1b0e]">{typeof opt.price === 'number' ? `£${opt.price}` : opt.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-6 sm:mt-8">
                      <button
                        className="btn-secondary w-full sm:w-auto py-3 text-base min-w-[160px] px-6 font-bold"
                        onClick={() => setStep1Stage('service')}
                      >
                        Back to Services
                      </button>
                      <button
                        onClick={() => {
                          if (!selectedAcrylicOption) return;
                          setBasket([selectedAcrylicOption]);
                          setStep1Stage('addons');
                        }}
                        className="btn-primary w-full sm:w-auto py-3 text-base min-w-[160px] px-6 font-bold"
                        disabled={!selectedAcrylicOption}
                      >
                        Continue to Add-ons
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
  </>
  );
}

// --- Clear localStorage on booking completion or reset ---
function clearBookingLocalStorage() {
  [
    'booking_currentStep',
    'booking_step1Stage',
    'booking_selectedCategory',
    'booking_selectedService',
    'booking_selectedManiPediManicure',
    'booking_selectedManiPediPedicure',
    'booking_basket',
    'booking_selectedAddOns',
    'booking_selectedAddOnsMani',
    'booking_selectedAddOnsPedi',
    'booking_noAddOns',
    'booking_noAddOnsMani',
    'booking_noAddOnsPedi',
    'booking_needsRemoval',
    'booking_selectedRemovalType',
    'booking_selectedDate',
    'booking_form',
    'booking_addonsStepIndex',
    'booking_selectedBiabVariant',
    'booking_selectedAcrylicOption'
  ].forEach(key => localStorage.removeItem(key));
  setServices([]); // Reset services state as well
}
