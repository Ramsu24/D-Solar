// PurposeSection.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, Target, Users, Lightbulb } from 'lucide-react';

const PurposeSection: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Intersection Observer refs for each card
  const visionRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);

  const [cardsInView, setCardsInView] = useState({
    vision: false,
    mission: false,
    values: false
  });
  
  useEffect(() => {
    // Set isLoaded to true immediately on mount
    setIsLoaded(true);
    
    // Add back the scroll handler for sun animation
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Use Intersection Observer for better performance
    const observerOptions = {
      root: null, // use viewport
      rootMargin: '0px',
      threshold: 0.2 // 20% of the element must be visible
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        if (id === 'vision-card' && entry.isIntersecting) {
          setCardsInView(prev => ({ ...prev, vision: true }));
        } else if (id === 'mission-card' && entry.isIntersecting) {
          setCardsInView(prev => ({ ...prev, mission: true }));
        } else if (id === 'values-card' && entry.isIntersecting) {
          setCardsInView(prev => ({ ...prev, values: true }));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    if (visionRef.current) observer.observe(visionRef.current);
    if (missionRef.current) observer.observe(missionRef.current);
    if (valuesRef.current) observer.observe(valuesRef.current);
    
    // Force cards to be visible after a delay in case observer fails
    const timer = setTimeout(() => {
      setCardsInView({
        vision: true,
        mission: true,
        values: true
      });
    }, 1000);
    
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: (i: number) => ({
      opacity: 0,
      x: i === 0 ? -50 : (i === 2 ? 50 : 0),
      y: i === 1 ? 50 : 0,
    }),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { 
        type: "spring", 
        duration: 0.4, 
        stiffness: 300, 
        damping: 24 
      }
    }
  };

  return (
    <div 
      ref={sectionRef}
      className="relative min-h-screen pt-16 pb-24 overflow-hidden bg-blue-50"
    >
      {/* Background with animated sun */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Animated sun in corner */}
        <div 
          className={`absolute right-0 top-0 w-64 h-64 bg-yellow-200 rounded-full transition-all duration-500 ease-out ${
            isLoaded ? 'opacity-60' : 'opacity-0'
          }`}
          style={{
            transform: `translate(30%, -10%) scale(${1 + scrollY * 0.005})`
          }}
        />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold text-center mb-12 text-gray-800"
        >
          Our Purpose
        </motion.h1>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Vision Card */}
          <motion.div 
            id="vision-card"
            ref={visionRef}
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate={cardsInView.vision ? "visible" : "hidden"}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-14 h-14 flex items-center justify-center mb-4 bg-yellow-100 rounded-full p-3"
              >
                <Eye className="text-yellow-500 w-8 h-8" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-yellow-500 font-medium mb-2"
              >
                Powerful &amp; Easy
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="text-2xl font-bold text-blue-800 mb-4"
              >
                Our Vision
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="text-gray-600"
              >
                We are the prime mover of societal transformation through technological solutions.
              </motion.p>
            </div>
          </motion.div>
          
          {/* Mission Card */}
          <motion.div 
            id="mission-card"
            ref={missionRef}
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate={cardsInView.mission ? "visible" : "hidden"}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-14 h-14 flex items-center justify-center mb-4 bg-blue-100 rounded-full p-3"
              >
                <Target className="text-blue-500 w-8 h-8" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-blue-500 font-medium mb-2"
              >
                Goal Oriented
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="text-2xl font-bold text-blue-800 mb-4"
              >
                Our Mission
              </motion.h2>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <p className="text-gray-600 mb-2">
                  Being a social enterprise, we create an absolute impact!
                </p>
                <p className="text-gray-600 mb-2">
                  We take care of and empower our stakeholders.
                </p>
                <p className="text-gray-600 mb-2">
                  We improve the quality of people's lives through technological solutions.
                </p>
                <p className="text-gray-600 mb-2">
                  We serve as good stewards for a safer society and a more sustainable environment.
                </p>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Core Values Card */}
          <motion.div 
            id="values-card"
            ref={valuesRef}
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate={cardsInView.values ? "visible" : "hidden"}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-14 h-14 flex items-center justify-center mb-4 bg-yellow-100 rounded-full p-3"
              >
                <Users className="text-yellow-500 w-8 h-8" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-yellow-500 font-medium mb-2"
              >
                Ground Breaking
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="text-2xl font-bold text-blue-800 mb-4"
              >
                Our Core Values
              </motion.h2>
              <motion.ul 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                {['Sense of Family', 'Trust & Accountability', 'Integrity & Honesty', 'Service with Empathy', 'Innovation & Technology'].map((value, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.4 + (i * 0.05) }}
                    className="mb-2 text-gray-600"
                  >
                    {value}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 flex justify-center gap-4"
        >
            <a 
            href="/projects" 
            className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
            >
            ABOUT OUR WORKS →
            </a>
            <a 
            href="#footer" 
            className="border-2 border-black text-black px-6 py-3 rounded hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
            CONTACT US NOW →
            </a>
        </motion.div>
      </div>
    </div>
  );
};

export default PurposeSection;