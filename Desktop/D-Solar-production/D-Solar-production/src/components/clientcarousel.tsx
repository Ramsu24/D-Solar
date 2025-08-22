import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { siteColors } from '@/utils/theme';

interface Client {
  id: number;
  name: string;
  logoUrl: string;
  alt: string;
}

interface OurClientsProps {
  clients?: Client[];
  title?: string;
}

const OurClients: React.FC<OurClientsProps> = ({ 
  clients = [
    { id: 1, name: 'CanadianSolar', logoUrl: '/canadiansolar-logo.png', alt: 'CanadianSolar logo' },
    { id: 2, name: 'Dyness', logoUrl: '/dyness-logo.png', alt: 'Dyness logo' },
    { id: 3, name: 'Enphase', logoUrl: '/enphase-logo.png', alt: 'Enphase logo' },
    { id: 4, name: 'JA Solar', logoUrl: '/JA Solar-logo.png', alt: 'JA Solar logo' },
    { id: 5, name: 'Solis', logoUrl: '/Solis-Logo.png', alt: 'Solis logo' },
    { id: 6, name: 'Panasonic', logoUrl: '/Panasonic-logo.png', alt: 'Panasonic logo' },
  ],
  title = 'Certified Brand Installers'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(5);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(5);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Set loaded state after a small delay for initial animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Recalculate slide position whenever itemsPerView changes
  useEffect(() => {
    if (slideContainerRef.current) {
      const newIndex = Math.min(currentIndex, clients.length - itemsPerView);
      setCurrentIndex(newIndex < 0 ? 0 : newIndex);
      updateSlidePosition(newIndex < 0 ? 0 : newIndex);
    }
  }, [itemsPerView, clients.length]);

  // Function to update slide position without animation
  const updateSlidePosition = (index: number) => {
    if (!slideContainerRef.current) return;
    
    const itemWidth = calculateItemWidth();
    slideContainerRef.current.style.transition = 'none';
    slideContainerRef.current.style.transform = `translateX(-${index * itemWidth}px)`;
  };

  // Function to calculate item width based on container and items per view
  const calculateItemWidth = (): number => {
    if (!carouselRef.current) return 0;
    
    const containerWidth = carouselRef.current.clientWidth;
    return containerWidth / Math.min(itemsPerView, clients.length);
  };

  // Function to animate the slide transition
  const animateSlide = (newIndex: number) => {
    if (!slideContainerRef.current || isAnimating) return;
    
    setIsAnimating(true);
    const itemWidth = calculateItemWidth();
    const offset = newIndex * itemWidth;
    
    // Apply the transform for the animation
    slideContainerRef.current.style.transition = 'transform 0.5s ease-in-out';
    slideContainerRef.current.style.transform = `translateX(-${offset}px)`;
    
    // Update the current index and reset animating state after transition
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsAnimating(false);
    }, 500);
  };

  const nextSlide = () => {
    const newIndex = Math.min(currentIndex + 1, clients.length - itemsPerView);
    if (newIndex !== currentIndex) {
      animateSlide(newIndex);
    }
  };

  const prevSlide = () => {
    const newIndex = Math.max(currentIndex - 1, 0);
    if (newIndex !== currentIndex) {
      animateSlide(newIndex);
    }
  };

  return (
    <section className="py-8 pb-16" style={{ backgroundColor: siteColors.secondary.yellow }}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-8 transition-opacity duration-1000 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'} transform ${isLoaded ? 'translate-y-0' : 'translate-y-4'}`}>
          <h2 className="text-4xl font-bold">
            <span style={{ color: siteColors.primary.blue }}>Certified Brand </span>
            <span style={{ color: siteColors.primary.orange }}>Installers</span>
          </h2>
          <div className="w-16 h-1 bg-gray-300 mx-auto mt-4"></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <button 
            onClick={prevSlide} 
            disabled={currentIndex === 0 || isAnimating}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 transition-all duration-300
              ${currentIndex === 0 || isAnimating ? 'text-gray-300 cursor-not-allowed opacity-50' : 'hover:scale-110'}`}
            style={{ color: currentIndex === 0 || isAnimating ? '#ccc' : siteColors.primary.blue }}
            aria-label="Previous clients"
          >
            <ChevronLeft size={36} />
          </button>

          <div 
            ref={carouselRef}
            className="overflow-hidden mx-12"
          >
            <div 
              className={`transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            >
              <div 
                ref={slideContainerRef}
                className="flex space-x-4 md:space-x-8"
                style={{ 
                  width: `${100 * (clients.length / itemsPerView)}%`, // Makes container the right size for smooth scrolling
                  transition: 'transform 0.5s ease-in-out'
                }}
              >
                {clients.map((client, index) => (
                  <div 
                    key={client.id} 
                    className="transition-all duration-500"
                    style={{ 
                      width: `calc(${100 / clients.length}% - ${itemsPerView > 1 ? '2rem' : '1rem'})`,
                      transitionDelay: `${index * 0.1}s`,
                      opacity: isLoaded ? 1 : 0,
                      transform: isLoaded ? 'translateY(0)' : 'translateY(20px)'
                    }}
                  >
                    <div className="bg-white rounded-lg shadow-md p-4 h-24 flex items-center justify-center transition-transform duration-300 hover:scale-105">
                      <div className="relative w-full h-full">
                        <div className="w-full h-full flex items-center justify-center">
                          {client.logoUrl ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <Image 
                                src={client.logoUrl} 
                                alt={client.alt} 
                                width={120}
                                height={60}
                                className="object-contain"
                                onError={(e) => {
                                  // Fallback to text if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = `<span class="text-gray-800 font-medium">${client.name}</span>`;
                                }}
                              />
                            </div>
                          ) : (
                            <span className="text-gray-800 font-medium">{client.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={nextSlide} 
            disabled={currentIndex >= clients.length - itemsPerView || isAnimating}
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 transition-all duration-300
              ${currentIndex >= clients.length - itemsPerView || isAnimating ? 'text-gray-300 cursor-not-allowed opacity-50' : 'hover:scale-110'}`}
            style={{ color: currentIndex >= clients.length - itemsPerView || isAnimating ? '#ccc' : siteColors.primary.blue }}
            aria-label="Next clients"
          >
            <ChevronRight size={36} />
          </button>
        </div>

        {/* Mobile indicator dots */}
        <div className="flex justify-center mt-6 md:hidden">
          {Array.from({ length: Math.ceil(clients.length - itemsPerView + 1) }).map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 mx-1 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-4' : ''
              }`}
              style={{ 
                backgroundColor: i === currentIndex ? siteColors.primary.blue : '#ccc'
              }}
              onClick={() => animateSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurClients;