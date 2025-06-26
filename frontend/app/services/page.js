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
    <main className="max-w-6xl mx-auto py-12 px-4 md:px-8">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 font-serif">Our Nail Services</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Premium nail treatments designed to enhance your natural beauty with lasting results
        </p>
      </section>

      {/* Services Grid */}
      <div className="space-y-12">
        {categories.map((category, catIndex) => (
          <div key={catIndex} className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{category.title}</h2>
            <p className="text-gray-600 mb-6">{category.description}</p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.services.map((service, svcIndex) => (
                <div
                  key={svcIndex}
                  className="group border border-gray-200 rounded-lg overflow-hidden shadow hover:shadow-xl transition-all bg-white cursor-pointer"
                  onClick={() => openModal(service.name)}
                >
                  {/* Image with hover overlay */}
<div className="relative w-full h-48 overflow-hidden">
  <img
    src={service.image || '/images/placeholder.jpg'}
    alt={service.name}
    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
  />

  {/* Overlay with box */}
  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300">
    <div className="px-4 py-2 bg-[#b38b6d]/90 text-white rounded-md text-sm font-semibold shadow-md transform scale-90 group-hover:scale-100 transition-transform duration-300">
      Book Now
    </div>
  </div>
</div>

                  {/* Info Box */}
                  <div className="p-4 text-gray-800">
                    <h3 className="text-md font-semibold mb-1">{service.name}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-[#b38b6d] font-bold">{service.price}</p>
                      <span className="text-sm text-gray-500">{service.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative text-center">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-2 text-[#b38b6d]">Book: {selectedService}</h3>
            <p className="text-gray-600 mb-6">You&apos;ll be redirected to our booking page.</p>
            <Link
              href="/booking"
              className="bg-[#b38b6d] hover:bg-[#9a7554] text-white px-6 py-3 rounded-full font-medium shadow"
            >
              Go to Booking
            </Link>
          </div>
        </div>
      )}

    </main>
  );
}
