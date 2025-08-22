'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Sun, ArrowUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Don't show header on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      const headerHeight = headerRef.current?.offsetHeight || 0;
      setShowScrollTop(window.scrollY > headerHeight);
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Set loaded state after a small delay to trigger animations
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle mouse move for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const header = headerRef.current;
    if (header) {
      header.addEventListener('mousemove', handleMouseMove);
      header.addEventListener('mouseenter', () => setIsHovering(true));
      header.addEventListener('mouseleave', () => setIsHovering(false));
    }

    return () => {
      if (header) {
        header.removeEventListener('mousemove', handleMouseMove);
        header.removeEventListener('mouseenter', () => setIsHovering(true));
        header.removeEventListener('mouseleave', () => setIsHovering(false));
      }
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navItems = ['Home', 'Projects', 'Blogs', 'About'];

  return (
    <>
      <header 
        ref={headerRef}
        className={`absolute top-0 left-0 right-0 w-full z-[100] transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/85 backdrop-blur-md shadow-lg py-1' 
            : 'bg-white/70 backdrop-blur-sm py-2'
        }`}
      >
        {/* Spotlight gradient overlay - uses CSS variables for performance */}
        <div 
          className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: `radial-gradient(circle 150px at ${mousePosition.x}px ${mousePosition.y}px, rgba(37, 99, 235, 0.15), transparent)`,
          }}
        ></div>
        
        {/* Blue and orange accent background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-orange-500/20 pointer-events-none"></div>
        
        <div className="container mx-auto px-4 flex items-center justify-between relative z-10">
          <Link 
            href="/" 
            className={`flex items-center transform transition-all duration-500 ${
              isScrolled ? 'scale-95' : 'scale-100'
            } ${isLoaded ? 'slide-in-left' : 'opacity-0'}`}
          >
            <div className="relative">
              <Image 
                src="/logo.png" 
                alt="D-Solar" 
                width={120} 
                height={40} 
                className="transition-all duration-500 logo-pulse"
              />
              <div className="absolute -inset-1 bg-orange-400/30 rounded-full blur-lg logo-glow opacity-0"></div>
            </div>
            <div className="tagline-container ml-3 relative group">
              <span className={`font-sans transition-all duration-500 text-primary font-bold relative z-10 ${
                isScrolled ? 'text-lg' : 'text-xl'
              } tagline-text`}>
                Powering Filipino Energy Independence
              </span>
              <div className="absolute -inset-1 bg-orange-400/0 rounded-lg blur-md transition-all duration-300 group-hover:bg-orange-400/50 group-hover:blur-lg z-0"></div>
              <Sun className="absolute -right-6 -top-1 text-orange-500 opacity-0 group-hover:opacity-100 transition-all duration-300 sun-spin" size={18} />
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center space-x-6 ${isLoaded ? 'fade-in' : 'opacity-0'}`}>
            {navItems.map((item, index) => {
              const path = item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`;
              return item === 'Home' ? (
                <a 
                  key={item} 
                  href={path}
                  className={`relative font-medium text-primary hover:text-blue-600 transition-colors overflow-hidden group nav-item-${index} px-3 py-2 rounded`}
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                >
                  <span className="relative z-10">{item}</span>
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full transform ${
                    isScrolled ? 'opacity-100' : 'opacity-80'
                  }`}></span>
                </a>
              ) : (
                <Link 
                  key={item} 
                  href={path}
                  className={`relative font-medium text-primary hover:text-blue-600 transition-colors overflow-hidden group nav-item-${index} px-3 py-2 rounded`}
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                >
                  <span className="relative z-10">{item}</span>
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full transform ${
                    isScrolled ? 'opacity-100' : 'opacity-80'
                  }`}></span>
                </Link>
              );
            })}
            
            {/* CTA Button */}
            <Link href="https://forms.office.com/Pages/ResponsePage.aspx?id=2oL6x5gizEChlRfKiUssJgG8alKsvA9Ik4XEW8xjkIJUNEhXWTVQTEpaNUxUQkZaRU1ZOVdGUktFUS4u&origin=QRCode">
              <button className="button hidden md:block">
              Free Solar Analysis
              </button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className={`md:hidden text-primary z-50 ${isLoaded ? 'fade-in' : 'opacity-0'}`}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X size={28} className="text-white" />
            ) : (
              <Menu size={28} className="text-primary hover:text-blue-600 transition-colors" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Navigation - Separate from header */}
      <div
        className={`fixed inset-0 bg-blue-600 z-40 transition-transform duration-300 md:hidden ${
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ 
          height: '100vh',
          overflow: 'auto'
        }}
      >
        <div className="w-full h-full flex flex-col justify-center items-center px-6 pt-16 pb-8 overflow-y-auto">
          {/* Logo in mobile menu */}
          <div className="mb-8 relative">
            <Image 
              src="/logo.png" 
              alt="D-Solar" 
              width={100} 
              height={33} 
              className="mx-auto mb-2 brightness-0 invert"
            />
            <div className="absolute -inset-2 bg-orange-400/30 rounded-full blur-lg logo-glow-mobile opacity-0"></div>
          </div>
          
          {/* Navigation Links */}
          <nav className="w-full max-w-sm mx-auto">
            {navItems.map((item, index) => {
              const path = item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`;
              return item === 'Home' ? (
                <a 
                  key={item} 
                  href={path}
                  className={`block text-white text-center text-xl font-medium py-4 border-b border-white/20 mobile-nav-item-${index} w-full hover:bg-white/10 transition-all`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ) : (
                <Link 
                  key={item} 
                  href={path}
                  className={`block text-white text-center text-xl font-medium py-4 border-b border-white/20 mobile-nav-item-${index} w-full hover:bg-white/10 transition-all`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              );
            })}
            
            <Link 
              href="https://forms.office.com/Pages/ResponsePage.aspx?id=2oL6x5gizEChlRfKiUssJgG8alKsvA9Ik4XEW8xjkIJUNEhXWTVQTEpaNUxUQkZaRU1ZOVdGUktFUS4u&origin=QRCode"
              className="w-full mt-6 py-3 px-6 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg mobile-nav-button"
              onClick={() => setIsMenuOpen(false)}
            >
              Free Solar Analysis
            </Link>
          </nav>
          
          {/* Social media icons */}
          <div className="flex space-x-4 mt-12">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all transform hover:scale-110">
              <span className="text-white">FB</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all transform hover:scale-110">
              <span className="text-white">IG</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all transform hover:scale-110">
              <span className="text-white">TW</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed top-4 right-4 z-[100] bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-110 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} />
      </button>

      {/* Animation styles */}
      <style jsx global>{`
        /* Entrance Animations */
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes popUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          60% {
            transform: translateY(-5px) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Logo and Tagline Effects */
        @keyframes logoPulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes glow {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 0;
          }
        }
        
        @keyframes sunSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes textShine {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        
        /* Mobile Navigation Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Applied Animation Classes */
        .slide-in-left {
          animation: slideInLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .bounce-in {
          animation: bounceIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .logo-pulse {
          animation: logoPulse 4s ease-in-out infinite;
        }
        
        .logo-glow, .logo-glow-mobile {
          animation: glow 4s ease-in-out infinite;
        }
        
        .sun-spin {
          animation: sunSpin 8s linear infinite;
        }
        
        .tagline-text {
          background: linear-gradient(90deg, #ff8a00, #2563eb, #ff8a00);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textShine 6s linear infinite;
          transition: all 0.3s ease;
          text-shadow: 0 0 5px rgba(255, 200, 0, 0.3);
        }
        
        .tagline-container:hover .tagline-text {
          letter-spacing: 0.5px;
          transform: scale(1.05);
        }
        
        /* Nav item animations */
        .nav-item-0, .nav-item-1, .nav-item-2, .nav-item-3, .nav-item-4, .nav-item-5 {
          animation: popUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          opacity: 0;
        }
        
        /* Mobile Nav Animations */
        .mobile-nav-item-0 {
          animation-name: fadeInUp;
          animation-duration: 0.5s;
          animation-fill-mode: both;
          animation-delay: 0.05s;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .mobile-nav-item-1 {
          animation-name: fadeInUp;
          animation-duration: 0.5s;
          animation-fill-mode: both;
          animation-delay: 0.1s;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .mobile-nav-item-2 {
          animation-name: fadeInUp;
          animation-duration: 0.5s;
          animation-fill-mode: both;
          animation-delay: 0.15s;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .mobile-nav-item-3 {
          animation-name: fadeInUp;
          animation-duration: 0.5s;
          animation-fill-mode: both;
          animation-delay: 0.2s;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .mobile-nav-item-4 {
          animation-name: fadeInUp;
          animation-duration: 0.5s;
          animation-fill-mode: both;
          animation-delay: 0.25s;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .mobile-nav-item-5 {
          animation-name: fadeInUp;
          animation-duration: 0.5s;
          animation-fill-mode: both;
          animation-delay: 0.3s;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .mobile-nav-button {
          animation-name: bounceIn;
          animation-duration: 0.7s;
          animation-fill-mode: both;
          animation-delay: 0.4s;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        /* Added text shadow for better visibility */
        .text-shadow {
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
        }

        /* CTA Button styling */
        .button {
          background: linear-gradient(135deg, #ff8a00, #e53e3e);
          color: white;
          font-weight: bold;
          padding: 0.5rem 1.5rem;
          border-radius: 9999px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .button:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </>
  );
}