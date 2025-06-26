'use client';
import { useEffect, useState } from 'react';


export default function Testimonials() {
  const reviews = [
    {
      name: 'Olivia',
      review: 'best nails i’ve had in london and everyone is so lovely :)',
    },
    {
      name: 'Victoria',
      review: 'Love it! Amazing range of services and colours',
    },
    {
      name: 'Mags',
      review: 'Efficient service Nice people Always have space and tailor to your requests',
    },
    {
      name: 'Martina',
      review: 'I always come here for Shellac manicure, good experience and lovely staff!',
    },
    {
      name: 'Hazel',
      review: 'Ive recently moved back in the area and been going for the past year, they are nice people, calm and reliable - get your nails done perfectly within good time. Always a good vibe there and they remember you which is nice. 🙂',
    },
    {
      name: 'Shezi',
      review: 'Thank you happy with my French tips design Will be back x',
    },
    {
      name: 'Aya',
      review: 'Super nice team, first time at the location! They were patient and helpful and looked after me well!',
    },
    {
      name: 'Sharon',
      review: 'Professional and really lovely set of nails.',
    },
    {
      name: 'Julia',
      review: 'Love getting my nails done here - always such great service. My last manicure lasted so long. Excellent work',
    },
  ];

  const [current, setCurrent] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  return (

      <main className="max-w-3xl mx-auto py-12 px-4 md:px-8 text-center">
        <h1 className="text-4xl font-bold mb-10">What Our Clients Say</h1>

        <div className="bg-pink-50 p-8 rounded shadow-md transition-all duration-500 ease-in-out min-h-[200px]">
          <p className="text-xl italic mb-4">“{reviews[current].review}”</p>
          <p className="text-lg font-semibold text-pink-600">– {reviews[current].name}</p>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              className={`h-2 w-2 rounded-full transition-all ${
                idx === current ? 'bg-pink-600' : 'bg-gray-300'
              }`}
              onClick={() => setCurrent(idx)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-2">Want to leave a review?</h2>
          <p>
            Leave your feedback on{' '}
            <a
              href="https://www.google.com/search?q=serenity+nails+reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 underline"
            >
              Google
            </a>
            !
          </p>
        </div>
      </main>
   
  );
}
