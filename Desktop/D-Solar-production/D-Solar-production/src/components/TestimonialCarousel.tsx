import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { siteColors } from '@/utils/theme';

interface Testimonial {
  quote: string;
  author: string;
  position: string;
  company: string;
  logo?: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoplaySpeed?: number;
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  testimonials,
  autoplaySpeed = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-advance carousel
  useEffect(() => {
    if (isHovering) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, autoplaySpeed);
    
    return () => clearInterval(interval);
  }, [testimonials.length, autoplaySpeed, isHovering]);

  // Track mouse position for gradient and spotlight effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    
    const rect = carouselRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

return (
    <div 
        ref={carouselRef}
        className="relative overflow-hidden rounded-xl shadow-xl w-full max-w-5xl mx-auto p-8 md:p-12"
        style={{ background: `linear-gradient(to bottom right, ${siteColors.primary.blue}CC, ${siteColors.primary.blue}EE)` }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
    >
            <div 
                className="absolute w-96 h-96 rounded-full blur-3xl"
                style={{ 
                    left: `${mousePosition.x}%`, 
                    top: `${mousePosition.y}%`, 
                    transform: 'translate(-50%, -50%)', 
                    opacity: isHovering ? 0.6 : 0.2,
                    transition: 'opacity 0.3s ease',
                    backgroundColor: `${siteColors.primary.blue}33`
                }}
            />
            <div 
                className="absolute w-64 h-64 rounded-full blur-3xl animate-pulse"
                style={{ 
                    right: '5%', 
                    top: '15%',
                    backgroundColor: `${siteColors.primary.orange}33`
                }}
            />
            
            {/* Content */}
        <div className="relative z-10">
          {/* Company logo */}
          {testimonials[currentIndex].logo && (
            <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 relative">
              <Image 
                src={testimonials[currentIndex].logo || ''}
                alt={`${testimonials[currentIndex].company} logo`}
                fill
                sizes="(max-width: 768px) 100vw, 128px"
                style={{ objectFit: "contain" }}
              />
            </div>
            </div>
          )}
        
        {/* Quote */}
        <div 
          className="relative text-xl md:text-2xl font-light text-center mb-8 transition-all duration-300"
          style={{
            color: isHovering ? 'transparent' : '#fff',
            backgroundImage: isHovering ? `linear-gradient(to right, ${siteColors.secondary.yellow}, ${siteColors.primary.orange}, ${siteColors.secondary.yellow})` : 'none',
            backgroundClip: isHovering ? 'text' : 'none',
            backgroundPosition: isHovering ? `${mousePosition.x}% ${mousePosition.y}%` : '0% 0%',
            WebkitBackgroundClip: isHovering ? 'text' : 'none'
          }}
        >
          <span style={{ color: siteColors.primary.orange }}>"</span>
          {testimonials[currentIndex].quote}
          <span style={{ color: siteColors.primary.orange }}>"</span>
        </div>
        
        {/* Author info */}
        <div className="text-center">
          <p className="font-semibold text-lg" style={{ color: siteColors.primary.orange }}>
            {testimonials[currentIndex].author}
          </p>
          <p className="text-gray-300 text-sm">
            {testimonials[currentIndex].position}, {testimonials[currentIndex].company}
          </p>
        </div>
      </div>
      
      {/* Navigation dots */}
      <div className="flex justify-center mt-8 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="w-3 h-3 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: index === currentIndex ? siteColors.primary.orange : 'rgba(156, 163, 175, 0.5)'
            }}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Navigation arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          color: '#fff'
        }}
        aria-label="Previous testimonial"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          color: '#fff'
        }}
        aria-label="Next testimonial"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
};

// Example usage with your testimonials
export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "I would recommend D-TEC Solutions to anyone who is thinking of having CCTV installed. The service I received was very quick, efficient and informative. Installation was trouble free and subsequent response to support requests have been rapid. A pleasure to do business with and I can highly recommend them.",
      author: "Leslie Lappay",
      position: "Unilever Philippines",
      company: "Paco",
      logo: "/uniliver.png" // Path to your logo
    },
    {
      quote: "Switching to solar with D-Solar was one of the best business decisions we've made. Our energy bills have been reduced by over 60% and the typhoon-ready system gives us peace of mind during storm season.",
      author: "Maria Santos",
      position: "Operations Manager",
      company: "Manila Food Processing",
      logo: "/manila.png"
    },
    {
      quote: "The team at D-Solar provided exceptional service from initial consultation through installation. Their financing options made going solar accessible for our business with zero upfront costs.",
      author: "Carlos Reyes",
      position: "Finance Director",
      company: "Cebu Retail Group",
      logo: "/cebu.jpg"
    },
  ];

  return (
    <section style={{ background: `linear-gradient(to bottom, ${siteColors.primary.blue}, ${siteColors.primary.blue}DD)` }} className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          <span className="text-white">What Our </span>
          <span style={{ color: siteColors.primary.orange }}>Clients Say</span>
        </h2>
        
        <TestimonialCarousel testimonials={testimonials} />
      </div>
    </section>
  );
}