'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Testimonials() {
  const reviews = [
    {
      name: 'Olivia',
      review: 'Best nails I\'ve had in London and everyone is so lovely! The attention to detail is incredible.',
      rating: 5,
      service: 'BIAB Manicure',
      date: '2 weeks ago'
    },
    {
      name: 'Victoria',
      review: 'Love it! Amazing range of services and colours. My gel manicure lasted perfectly for 3 weeks.',
      rating: 5,
      service: 'Gel Manicure',
      date: '1 month ago'
    },
    {
      name: 'Mags',
      review: 'Efficient service, nice people. Always have space and tailor to your requests. Highly recommend!',
      rating: 5,
      service: 'Classic Manicure',
      date: '3 weeks ago'
    },
    {
      name: 'Martina',
      review: 'I always come here for Shellac manicure. Good experience and lovely staff! Never disappointed.',
      rating: 5,
      service: 'Shellac Manicure',
      date: '1 week ago'
    },
    {
      name: 'Hazel',
      review: 'I\'ve recently moved back to the area and been going for the past year. They are nice people, calm and reliable - get your nails done perfectly within good time. Always a good vibe there and they remember you which is nice.',
      rating: 5,
      service: 'Mani & Pedi',
      date: '2 months ago'
    },
    {
      name: 'Shezi',
      review: 'Thank you! Happy with my French tips design. Will be back for sure!',
      rating: 5,
      service: 'French Manicure',
      date: '1 week ago'
    },
    {
      name: 'Aya',
      review: 'Super nice team, first time at the location! They were patient and helpful and looked after me well!',
      rating: 5,
      service: 'First Visit',
      date: '2 weeks ago'
    },
    {
      name: 'Sharon',
      review: 'Professional and really lovely set of nails. The quality is outstanding and the staff are so friendly.',
      rating: 5,
      service: 'Nail Extensions',
      date: '3 weeks ago'
    },
    {
      name: 'Julia',
      review: 'Love getting my nails done here - always such great service. My last manicure lasted so long. Excellent work!',
      rating: 5,
      service: 'Gel Manicure',
      date: '1 month ago'
    },
  ];

  const [current, setCurrent] = useState(0);

  // Auto-rotate every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fef9f5] to-[#faf6f0]">
      {/* Hero Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-[#d4af37]/10 to-[#b87333]/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <span className="text-4xl mb-4 block">⭐</span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#2d1b0e] mb-6">
              What Our Clients Say
            </h1>
            <p className="text-lg md:text-xl text-[#5d4e37] max-w-3xl mx-auto">
              Don't just take our word for it - hear from our satisfied clients about their experiences
            </p>
          </div>

          {/* Trust Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="trust-badge">
              <div className="text-3xl font-bold text-[#d4af37] mb-2">4.9</div>
              <div className="text-sm text-[#8b7d6b]">Average Rating</div>
              <div className="flex justify-center mt-2">
                {renderStars(5)}
              </div>
            </div>
            <div className="trust-badge">
              <div className="text-3xl font-bold text-[#d4af37] mb-2">500+</div>
              <div className="text-sm text-[#8b7d6b]">Happy Clients</div>
              <div className="text-xs text-[#8b7d6b] mt-1">This year alone</div>
            </div>
            <div className="trust-badge">
              <div className="text-3xl font-bold text-[#d4af37] mb-2">98%</div>
              <div className="text-sm text-[#8b7d6b]">Would Recommend</div>
              <div className="text-xs text-[#8b7d6b] mt-1">To friends & family</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Featured Testimonial */}
          <div className="mb-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="testimonial-card text-center"
              >
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    {renderStars(reviews[current].rating)}
                  </div>
                  <p className="text-xl md:text-2xl italic text-[#2d1b0e] leading-relaxed mb-6">
                    "{reviews[current].review}"
                  </p>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#d4af37] to-[#b87333] rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
                      {reviews[current].name.charAt(0)}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#2d1b0e]">{reviews[current].name}</h3>
                      <div className="flex text-lg md:text-xl lg:text-lg xl:text-base">
                        {renderStars(reviews[current].rating)}
                      </div>
                    </div>
                    <p className="text-xs text-[#8b7d6b] mb-2">{reviews[current].service}</p>
                    <p className="text-xs text-[#8b7d6b]">
                      {reviews[current].date}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    idx === current 
                      ? 'bg-[#d4af37] scale-125' 
                      : 'bg-[#e8dcc0] hover:bg-[#d4af37]/50'
                  }`}
                  onClick={() => setCurrent(idx)}
                  aria-label={`View review ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* All Reviews Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[#2d1b0e] text-center mb-12">
              More Client Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="testimonial-card p-6"
                >
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#2d1b0e]">{review.name}</h3>
                      <div className="flex text-lg md:text-xl lg:text-lg xl:text-base">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-xs text-[#8b7d6b] mb-2">{review.service}</p>
                  </div>
                  <p className="text-[#5d4e37] text-sm leading-relaxed mb-3">
                    "{review.review}"
                  </p>
                  <p className="text-xs text-[#8b7d6b]">{review.date}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="service-card p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#2d1b0e] mb-4">
                Join Our Happy Clients
              </h2>
              <p className="text-[#5d4e37] mb-6 max-w-2xl mx-auto">
                Experience the same level of care and attention that our clients rave about. 
                Book your appointment today and see why we're rated 4.9 stars!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/booking"
                  className="btn-primary"
                >
                  Book Your Appointment
                </a>
                <a
                  href="https://www.google.com/search?q=nails+design+london+reviews"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  Leave a Review
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
