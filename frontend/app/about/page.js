import React from 'react';

export default function About() {
  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center text-[#2d1b0e] mb-8">About Us</h1>
      <section className="mb-12 bg-gradient-to-br from-[#fff8e1] to-[#fdf6ed] rounded-2xl shadow-lg p-8 border border-[#f3e5ab]">
        <h2 className="text-2xl font-bold text-[#d4af37] mb-4">Discover Nail Bliss in Bayswater</h2>
        <p className="text-[#8b7d6b] text-lg leading-relaxed">
          Welcome to Nail Bliss, your sanctuary of beauty and relaxation in the heart of Bayswater. Our talented team of nail artists and beauty professionals are dedicated to delivering a premium experience, using only the finest products and the latest techniques. Whether you seek a classic manicure, luxurious spa pedicure, or stunning nail art, we promise a warm welcome and flawless results every time.
        </p>
      </section>
      <section className="mb-12 bg-gradient-to-br from-[#fff8e1] to-[#fdf6ed] rounded-2xl shadow-lg p-8 border border-[#f3e5ab]">
        <h2 className="text-2xl font-bold text-[#d4af37] mb-4">Why Choose Nails Design?</h2>
        <ul className="list-disc pl-6 text-[#8b7d6b] text-lg space-y-2">
          <li>Expert technicians with years of experience</li>
          <li>Premium, hygienic products and tools</li>
          <li>Relaxing, modern salon environment</li>
          <li>Wide range of services and custom nail art</li>
          <li>Commitment to your comfort, safety, and satisfaction</li>
        </ul>
      </section>
    </main>
  );
} 