'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Services() {
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const openModal = (serviceName) => {
    setSelectedService(serviceName);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
  };

  const categories = [
    {
      title: 'BIAB - Builder Gel',
      description: 'Our strongest and most natural-looking nail enhancement system',
      icon: '💎',
      features: ['Lasts 3-4 weeks', 'Natural look', 'Strengthens nails'],
      services: [
        { name: 'BIAB only', duration: '45 min', price: '£40', image: '/images/biab-only.jpg' },
        { name: 'BIAB with Manicure', duration: '1 hr', price: '£45', image: '/images/biab-with-manicure.jpg' },
        { name: 'BIAB Infill', duration: '45 min', price: '£37', image: '/images/biab-infill.jpg' },
        { name: 'BIAB Infill with manicure', duration: '1 hr', price: '£42', image: '/images/biab-infill-manicure.jpg' },
        { name: 'BIAB take off', duration: '20 min', price: '£14', image: '/images/biab-takeoff.jpg' },
        { name: 'BIAB with take off', duration: '1 hr 05 min', price: '£45', image: '/images/biab-with-takeoff.jpg' },
        { name: 'BIAB with take off and manicure', duration: '1 hr 20 min', price: '£50', image: '/images/biab-takeoff-manicure.jpg' },
      ],
    },
    {
      title: 'Gel Manicures & Pedicures',
      description: 'Long-lasting color with our premium gel polish system',
      icon: '✨',
      features: ['Lasts 2-3 weeks', 'Chip-resistant', 'High shine finish'],
      services: [
        { name: 'Shellac Manicure & Pedicure', duration: '1 hr 30 min', price: '£68', image: '/images/shellac-mani-pedi.jpg' },
        { name: 'Shellac Manicure with Classic Shellac Polish', duration: '45 min', price: '£30', image: '/images/shellac-mani-classic.jpg' },
        { name: 'Shellac Manicure with French Shellac Polish', duration: '50 min', price: '£35', image: '/images/shellac-mani-french.jpg' },
        { name: 'Shellac Pedicure', duration: '1 hr', price: '£38', image: '/images/shellac-pedicure.jpg' },
        { name: 'Shellac Polish on toe nails', duration: '30 min', price: '£27', image: '/images/shellac-toes.jpg' },
        { name: 'Shellac Removal with Manicure (no colour)', duration: '45 min', price: '£26', image: '/images/shellac-removal-mani.jpg' },
        { name: 'Shellac Removal', duration: '20 min', price: '£14', image: '/images/shellac-removal.jpg' },
      ],
    },
    {
      title: 'SNS Dipping Powder',
      description: 'Lightweight, durable nails with our signature dipping system',
      icon: '🌟',
      features: ['Lightweight feel', 'Durable finish', 'No UV light needed'],
      services: [
        { name: 'SNS Classic Dipping Powder (No take off)', duration: '1 hr', price: '£33', image: '/images/sns-no-takeoff.jpg' },
        { name: 'SNS Classic Dipping Powder (With take off)', duration: '1 hr 15 min', price: '£38', image: '/images/sns-with-takeoff.jpg' },
        { name: 'SNS With Manicure', duration: '1 hr', price: '£40', image: '/images/sns-manicure.jpg' },
        { name: 'SNS Dipping Powder Extensions', duration: '1 hr 15 min', price: '£42', image: '/images/sns-extensions.jpg' },
        { name: 'SNS Refill with Same Colour', duration: '50 min', price: '£35', image: '/images/sns-refill.jpg' },
      ],
    },
    {
      title: 'Nail Extensions & Enhancements',
      description: 'Custom nail extensions for your perfect length and shape',
      icon: '💅',
      features: ['Custom length', 'Perfect shape', 'Long-lasting'],
      services: [
        { name: 'Full Set Acrylic', duration: '1 hr', price: '£34', image: '/images/acrylic-fullset.jpg' },
        { name: 'Full Set Ombre', duration: '1 hr', price: '£43', image: '/images/ombre-fullset.jpg' },
        { name: 'Full Set Acrylic with gel color', duration: '1 hr', price: '£40', image: '/images/acrylic-gel-color.jpg' },
        { name: 'Overlays - Acrylic', duration: '1 hr', price: '£29', image: '/images/acrylic-overlays.jpg' },
        { name: 'Infills Acrylic', duration: '45 min', price: '£24', image: '/images/acrylic-infills.jpg' },
        { name: 'Infills Ombre', duration: '45 min', price: '£35', image: '/images/ombre-infills.jpg' },
        { name: 'Infills Acrylic with gel color', duration: '45 min', price: '£33', image: '/images/acrylic-infills-gel.jpg' },
        { name: 'Removal', duration: '20 min', price: '£17', image: '/images/nail-removal.jpg' },
        { name: 'Removal and manicure', duration: '40 min', price: '£26', image: '/images/removal-manicure.jpg' },
      ],
    },
    {
      title: 'Classic Manicures & Pedicures',
      description: 'Traditional nail care with our luxury treatments',
      icon: '🌸',
      features: ['Relaxing experience', 'Hand massage included', 'Premium polish'],
      services: [
        { name: 'Manicure & Pedicure with Classic Polish', duration: '1 hr 15 min', price: '£42', image: '/images/classic-mani-pedi.jpg' },
        { name: 'Manicure & Pedicure with French Polish', duration: '1 hr 45 min', price: '£52', image: '/images/french-mani-pedi.jpg' },
        { name: 'Manicure with Classic Polish', duration: '30 min', price: '£18', image: '/images/classic-mani.jpg' },
        { name: 'Manicure with French Polish', duration: '35 min', price: '£25', image: '/images/french-mani.jpg' },
        { name: 'Pedicure with Classic Polish', duration: '40 min', price: '£30', image: '/images/classic-pedi.jpg' },
        { name: 'Pedicure with French Polish', duration: '1 hr', price: '£35', image: '/images/french-pedi.jpg' },
        { name: 'Polish Change - Toes', duration: '20 min', price: '£17', image: '/images/polish-change-toes.jpg' },
        { name: 'One Toe Extension', duration: '20 min', price: '£6', image: '/images/one-toe-extension.jpg' },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fef9f5] to-[#faf6f0]">
      {/* Hero Section */}
      <section className="relative py-16 px-4 md:px-8 bg-gradient-to-r from-[#d4af37]/10 to-[#b87333]/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <span className="text-4xl mb-4 block">💅</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#2d1b0e]">
              Premium Nail Services
            </h1>
            <p className="text-lg md:text-xl text-[#5d4e37] max-w-3xl mx-auto leading-relaxed">
              Experience luxury nail care with our expert technicians. From classic manicures to advanced BIAB treatments, 
              we offer everything you need for beautiful, long-lasting nails.
            </p>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <div className="trust-badge">
              <div className="text-2xl mb-2">⭐</div>
              <div className="font-semibold text-[#2d1b0e]">5-Star Rated</div>
              <div className="text-sm text-[#8b7d6b]">Trusted by 1000+ clients</div>
            </div>
            <div className="trust-badge">
              <div className="text-2xl mb-2">🧼</div>
              <div className="font-semibold text-[#2d1b0e]">Hygiene First</div>
              <div className="text-sm text-[#8b7d6b]">Sterilized tools & equipment</div>
            </div>
            <div className="trust-badge">
              <div className="text-2xl mb-2">⏰</div>
              <div className="font-semibold text-[#2d1b0e]">On Time</div>
              <div className="text-sm text-[#8b7d6b]">Respect your schedule</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-16">
            {categories.map((category, catIndex) => (
              <div key={catIndex} className="service-card p-8">
                {/* Category Header */}
                <div className="text-center mb-12">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#2d1b0e]">
                    {category.title}
                  </h2>
                  <p className="text-lg text-[#5d4e37] mb-6 max-w-2xl mx-auto">
                    {category.description}
                  </p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {category.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-[#d4af37]/20 to-[#b87333]/20 text-[#5d4e37] rounded-full text-sm font-medium border border-[#e8dcc0]"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Services Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {category.services.map((service, svcIndex) => (
                    <div
                      key={svcIndex}
                      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-[#e8dcc0]/50"
                      onClick={() => openModal(service.name)}
                    >
                      {/* Image with hover overlay */}
                      <div className="relative w-full h-48 overflow-hidden">
                        <img
                          src={service.image || '/images/placeholder.jpg'}
                          alt={service.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Hover content */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            <div className="text-[#d4af37] font-bold text-lg">Book Now</div>
                            <div className="text-[#8b7d6b] text-sm">Click to reserve</div>
                          </div>
                        </div>
                      </div>

                      {/* Service Info */}
                      <div className="p-6">
                        <h3 className="text-lg font-semibold mb-3 text-[#2d1b0e] group-hover:text-[#d4af37] transition-colors duration-300">
                          {service.name}
                        </h3>
                        <div className="flex justify-between items-center">
                          <div className="price-tag">
                            {service.price}
                          </div>
                          <div className="flex items-center gap-2 text-[#8b7d6b]">
                            <span className="text-sm">⏱️</span>
                            <span className="text-sm font-medium">{service.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-[#d4af37]/10 to-[#b87333]/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#2d1b0e]">
            Ready for Beautiful Nails?
          </h2>
          <p className="text-lg text-[#5d4e37] mb-8 max-w-2xl mx-auto">
            Book your appointment today and experience the difference that professional nail care makes. 
            Our expert technicians are ready to give you the nails you've always wanted.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="btn-primary"
            >
              Book Your Appointment
            </Link>
            <Link
              href="/gallery"
              className="btn-secondary"
            >
              View Our Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#d4af37] to-[#b87333] p-6 text-white">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl transition-colors duration-300"
              >
                ×
              </button>
              <h3 className="text-xl font-bold">Book: {selectedService}</h3>
              <p className="text-white/90 mt-1">Ready to get started?</p>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">💅</div>
                <p className="text-[#5d4e37]">
                  You'll be redirected to our booking page where you can select your preferred date and time.
                </p>
              </div>
              
              <div className="space-y-4">
                <Link
                  href="/booking"
                  className="btn-primary w-full text-center"
                  onClick={closeModal}
                >
                  Continue to Booking
                </Link>
                <button
                  onClick={closeModal}
                  className="w-full py-3 px-4 text-[#5d4e37] hover:text-[#d4af37] transition-colors duration-300 font-medium"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
