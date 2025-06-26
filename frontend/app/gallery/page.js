"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Dynamically import react-slick to avoid SSR issues
const Slider = dynamic(() => import("react-slick"), { ssr: false });

export default function Gallery() {
  const images = [
    "/gallery/nail1.jpg",
    "/gallery/nail2.jpg",
    "/gallery/nail3.jpg",
    "/gallery/nail4.jpg",
    "/gallery/nail5.jpg",
    "/gallery/nail6.jpg",
    "/gallery/nail7.jpg",
    "/gallery/nail8.jpg"
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 340,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 4500,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <main className="max-w-4xl mx-auto py-12 px-4 md:px-8 text-gray-800">
      <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center">Our Work</h1>
      <p className="text-center max-w-xl mx-auto text-base md:text-lg text-gray-600 mb-8">
        Explore a selection of our most loved nail styles — from classic elegance to modern nail art.
      </p>

      <div>
        <Slider {...settings}>
          {images.map((src, idx) => (
            <div key={idx} className="px-3">
              <div className="overflow-hidden rounded-xl shadow-lg">
                <Image
                  src={src}
                  alt={`Nail Art ${idx + 1}`}
                  width={500}
                  height={500}
                  className="w-full h-[330px] object-cover transition-transform duration-500 hover:scale-105"
                  priority={idx === 0}
                />
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </main>
  );
}
