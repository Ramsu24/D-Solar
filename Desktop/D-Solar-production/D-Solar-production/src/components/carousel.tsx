'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Play, Pause } from 'lucide-react';

// Animation data for each slide
const slides = [
  {
    title: "Solar Panels",
    description: "High-efficiency solar panels for your home and business",
    color: "bg-yellow-500",
    accent: "bg-yellow-700",
    image: "1.jpg"
  },
  {
    title: "Solar Inverters",
    description: "Reliable and efficient solar inverters",
    color: "bg-orange-500",
    accent: "bg-orange-700",
    image: "2.jpg"
  },
  {
    title: "Solar Batteries",
    description: "Store energy with our advanced solar batteries",
    color: "bg-red-500", 
    accent: "bg-red-700",
    image: "3.jpg"
  },
  {
    title: "Solar Installation",
    description: "Professional solar installation services",
    color: "bg-green-500",
    accent: "bg-green-700",
    image: "4.jpg"
  },
  {
    title: "Solar Maintenance",
    description: "Comprehensive solar maintenance and support",
    color: "bg-blue-500",
    accent: "bg-blue-700",
    image: "5.png"
  }
];

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  opacity: number;
}

const AnimatedCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState('forward');
  const [animationParticles, setAnimationParticles] = useState<Particle[]>([]);
  const [transitioning, setTransitioning] = useState(false);

  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      if (direction === 'forward') {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isPlaying, direction]);

  // Generate random particles for the current slide
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 5 + 2,
      angle: Math.random() * 360,
      opacity: Math.random() * 0.7 + 0.3
    }));
    
    setAnimationParticles(newParticles);
  }, [currentSlide]);

  const goToNextSlide = () => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTransitioning(false);
    }, 500);
  };

  const goToPrevSlide = () => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setTransitioning(false);
    }, 500);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleDirection = () => {
    setDirection(prev => prev === 'forward' ? 'backward' : 'forward');
  };

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-xl">
      {/* Background */}
      <div 
        className={`absolute inset-0 w-full h-full transition-colors duration-1000 ease-in-out ${slides[currentSlide].color}`}
      />

      {/* Slide Image */}
      <img 
        src={slides[currentSlide].image} 
        alt={slides[currentSlide].title} 
        className={`absolute inset-0 w-full h-full object-cover opacity-70 transition-opacity duration-500 ${transitioning ? 'opacity-0' : 'opacity-70'}`}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white z-10">
        <h2 
          className="text-4xl font-bold mb-4 transform transition-all duration-700 animate-fadeIn"
          style={{
            animation: `slideIn 0.7s ease-out, pulse 3s infinite`
          }}
        >
          {slides[currentSlide].title}
        </h2>
        <p 
          className="text-xl mb-8 text-center max-w-md opacity-90"
          style={{
            animation: `fadeIn 1.5s ease-out`
          }}
        >
          {slides[currentSlide].description}
        </p>

        {/* Slide indicators */}
        <div className="flex space-x-2 mt-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2 z-20">
        <button
          onClick={goToPrevSlide}
          className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={togglePlayPause}
          className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={goToNextSlide}
          className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        >
          <ArrowRight size={24} />
        </button>
        <button
          onClick={toggleDirection}
          className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        >
          {direction === 'forward' ? '→' : '←'}
        </button>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.7; }
        }
        
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-20px) rotate(360deg); }
        }
        
        @keyframes slideIn {
          0% { transform: translateY(-20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AnimatedCarousel;