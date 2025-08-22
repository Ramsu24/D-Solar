// src/app/page.tsx
'use client';
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import Footer from '@/components/Footer'
import React, { useState, useRef, useEffect } from 'react';
import Clientcarousel from '@/components/clientcarousel';
import PurposeSection from '@/components/PurposeSection';
import SocialCard from '@/components/socialcard';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import ServicesSection from '@/components/ServicesSection';
import AboutUsSection from '@/components/AboutUsSection';
import RecentBlogs from '@/components/RecentBlogs';
import ChatBot from '@/components/ChatBot';
import CalculatorPromoSection from '@/components/CalculatorPromoSection';
import dynamic from 'next/dynamic';


// Dynamically import the SolarCalculator component with SSR disabled
const SolarCalculator = dynamic(
  () => import('@/components/SolarCalculator'),
  { ssr: false }
);

export default function Home() {
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Scroll to calculator when it becomes visible
  useEffect(() => {
    if (isCalculatorVisible && calculatorRef.current) {
      calculatorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [isCalculatorVisible]);

  return ( 
    <main className="min-h-screen">
      <HeroSection onCalculateClick={() => setIsCalculatorVisible(true)} />
      <div className="-mt-1"> {/* Removed space-y-12 to eliminate gaps */}
        <CalculatorPromoSection onCalculateClick={() => setIsCalculatorVisible(true)} />
        <SolarCalculator ref={calculatorRef} isVisible={isCalculatorVisible} />
        <PurposeSection />
        <Clientcarousel />
        <TestimonialCarousel />
        <ServicesSection />
        <AboutUsSection />
        <RecentBlogs />
        <ChatBot />
      </div>
    </main>
  )
}