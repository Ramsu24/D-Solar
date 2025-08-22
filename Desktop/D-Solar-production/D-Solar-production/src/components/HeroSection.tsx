'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface HeroSectionProps {
  onCalculateClick: () => void;
}

export default function HeroSection({ onCalculateClick }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Transform scroll progress into color values
  const gradientProgress = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="object-cover w-full h-full"
        >
          <source src="/home.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      {/* Gradient Overlay - Now positioned at the top */}
      <div 
        className="absolute inset-0 z-1"
        style={{
          background: 'linear-gradient(to bottom, rgba(26, 59, 41, 0.8) 0%, rgba(26, 59, 41, 0.4) 50%, transparent 100%)'
        }}
      />

      {/* Animated Wave Gradient */}
      <motion.div 
        className="absolute bottom-0 left-0 w-full h-32 z-2"
        style={{
          background: useTransform(
            gradientProgress,
            [0, 50, 100],
            [
              'linear-gradient(90deg, rgba(255,215,0,0.9) 0%, rgba(255,255,255,0.9) 50%, rgba(0,122,255,0.9) 100%)',
              'linear-gradient(90deg, rgba(0,122,255,0.9) 0%, rgba(255,215,0,0.9) 50%, rgba(255,255,255,0.9) 100%)',
              'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(0,122,255,0.9) 50%, rgba(255,215,0,0.9) 100%)'
            ]
          ),
          clipPath: 'url(#wave)',
        }}
      />

      {/* Wave SVG Clippath */}
      <svg className="absolute bottom-0 left-0 w-full h-0 overflow-hidden">
        <defs>
          <clipPath id="wave" clipPathUnits="objectBoundingBox">
            <path d="M0,0.3 C0.3,0.5 0.7,0.1 1,0.3 L1,1 L0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 container mx-auto px-4 h-full flex items-center"
      >
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl text-white font-bold mb-6">
            Cut Your Energy Bills by 70% with PH's First Solar Loan
          </h1>
          <p className="text-xl text-white/90 mb-8">
            ₱0 Down - 25-Year Warranty - Typhoon-Ready Systems
          </p>
            {/* Button removed as per request */}
        </div>
      </motion.div>
    </div>
  );
}