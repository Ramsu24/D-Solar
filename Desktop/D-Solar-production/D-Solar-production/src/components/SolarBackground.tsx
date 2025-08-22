// SolarBackground.tsx
import React, { useEffect, useState } from 'react';

const SolarBackground: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate rotation based on scroll position
  const sunRotation = scrollY * 0.05; // Slow rotation
  const rayScale = 1 + (scrollY * 0.0003); // Gradually expand rays
  const rayOpacity = Math.max(0.3, 1 - (scrollY * 0.001)); // Fade slightly on scroll

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden -z-10">
      {/* Light blue background gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-blue-50 to-blue-100"
        style={{ 
          opacity: Math.max(0.6, 1 - (scrollY * 0.001)) 
        }}
      />
      
      {/* Sun with rotating rays */}
      <div 
        className="absolute"
        style={{ 
          top: `${30 - scrollY * 0.02}%`,
          right: `${10 - scrollY * 0.01}%`,
          transform: `scale(${1 + scrollY * 0.0005})`,
          opacity: Math.max(0.5, 1 - (scrollY * 0.0007))
        }}
      >
        {/* Sun circle */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-yellow-400 shadow-lg shadow-yellow-300/50" />
          
          {/* Sun rays */}
          <div 
            className="absolute top-1/2 left-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2"
            style={{ 
              transform: `translate(-50%, -50%) rotate(${sunRotation}deg) scale(${rayScale})`,
              opacity: rayOpacity
            }}
          >
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className="absolute top-1/2 left-1/2 h-1 bg-yellow-300"
                style={{
                  width: '120px',
                  transformOrigin: '0 50%',
                  transform: `rotate(${i * 30}deg) translateX(30px)`,
                  opacity: 0.7
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Floating solar panels */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-blue-800 rounded-sm"
          style={{
            width: `${80 + i * 10}px`,
            height: `${60 + i * 5}px`,
            top: `${20 + i * 15}%`,
            left: `${5 + i * 20}%`,
            transform: `rotate(${i * 5}deg) translateY(${scrollY * (0.03 + i * 0.01)}px)`,
            opacity: 0.2,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.1s ease-out'
          }}
        >
          {/* Panel grid lines */}
          <div className="w-full h-full grid grid-cols-2 grid-rows-3">
            {[...Array(6)].map((_, j) => (
              <div key={j} className="border border-blue-700" />
            ))}
          </div>
        </div>
      ))}
      
      {/* Light beams from top */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bg-yellow-100"
          style={{
            left: `${5 + i * 12}%`,
            width: '3px',
            height: `${300 + i * 50}px`,
            opacity: Math.max(0.1, 0.3 - (scrollY * 0.0005)),
            transform: `rotate(${-5 + i * 2}deg) translateY(${-20 + scrollY * 0.1}px)`,
            boxShadow: '0 0 15px rgba(254, 240, 138, 0.5)'
          }}
        />
      ))}
      
      {/* Moving clouds */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${120 + i * 40}px`,
            height: `${40 + i * 15}px`,
            top: `${5 + i * 10}%`,
            left: `${20 + i * 20}%`,
            opacity: 0.4,
            transform: `translateX(${scrollY * (-0.1 - i * 0.05)}px)`,
            filter: 'blur(5px)'
          }}
        />
      ))}
      
      {/* Energy "bubbles" that float up */}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-yellow-200"
          style={{
            width: `${4 + i % 3 * 2}px`,
            height: `${4 + i % 3 * 2}px`,
            bottom: `${scrollY * 0.05 + (i * 10) % 100}%`,
            left: `${10 + (i * 8) % 80}%`,
            opacity: 0.3,
            animation: `float-${i} ${10 + i * 2}s linear infinite`,
            boxShadow: '0 0 5px rgba(254, 240, 138, 0.5)'
          }}
        />
      ))}
      
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: Math.max(0.2, 0.5 - (scrollY * 0.001)),
          transform: `translateY(${scrollY * 0.1}px)`
        }}
      />
      
      <style jsx>{`
        @keyframes float-0 { 0% { transform: translateY(0); } 100% { transform: translateY(-100vh); } }
        @keyframes float-1 { 0% { transform: translateY(0); } 100% { transform: translateY(-100vh); } }
        @keyframes float-2 { 0% { transform: translateY(0); } 100% { transform: translateY(-100vh); } }
        @keyframes float-3 { 0% { transform: translateY(0); } 100% { transform: translateY(-100vh); } }
        @keyframes float-4 { 0% { transform: translateY(0); } 100% { transform: translateY(-100vh); } }
        @keyframes float-5 { 0% { transform: translateY(0); } 100% { transform: translateY(-100vh); } }
        @keyframes float-6 { 0% { transform: translateY(0); } 100% { transform: translateY(-100vh); } }
        @keyframes float-7 { 0% { transform: translateY(0); } 100% { transform: translateY(-100vh); } }
        @keyframes float-8 { 0% { transform: translateY(0); } 100% { transform: translateY(-100vh); } }
        @keyframes float-9 { 0% { transform: translateY(0); } 100% { transform: translateY(-100vh); } }
      `}</style>
    </div>
  );
};

export default SolarBackground;