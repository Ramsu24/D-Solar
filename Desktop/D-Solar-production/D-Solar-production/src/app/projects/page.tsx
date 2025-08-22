'use client';
import React, { useState, useEffect, lazy, Suspense } from 'react';
import Image from 'next/image';

interface ProjectCardProps {
  title: string;
  location: string;
  solarPanelBrand: string;
  inverterBrand: string;
  imageUrl: string;
  capacity: string;
  category?: string;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  location,
  solarPanelBrand,
  inverterBrand,
  imageUrl,
  capacity,
  category,
  onClick
}) => {
  return (
    <div className="project-card-container noselect" onClick={onClick}>
      <div className="canvas">
        {/* Tracker divs for 3D hover effect */}
        {[...Array(25)].map((_, i) => (
          <div key={i} className={`tracker tr-${i + 1}`} />
        ))}
        
        <div id="card">
          <p id="prompt">Click for Details</p>
          
          {/* Project image */}
          <div className="card-image">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={true}
              loading="eager"
              style={{ objectFit: "cover" }}
            />
            
            {/* Capacity badge */}
            <div className="capacity-badge">
              {capacity}
            </div>
            
            {/* Category badge */}
            {category && (
              <div className="category-badge">
                {category}
              </div>
            )}
          </div>
          
          {/* Card content */}
          <div className="card-content">
            <h3 className="title">{title}</h3>
            <div className="subtitle">
              <p><span>Location:</span> {location}</p>
              <p><span>Solar Panel:</span> {solarPanelBrand}</p>
              <p><span>Inverter:</span> {inverterBrand}</p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .project-card-container {
          position: relative;
          width: 100%;
          max-width: 540px;
          height: 500px;
          transition: 200ms;
          margin: 0 auto;
          cursor: pointer;
          z-index: 1;
        }

        .project-card-container:active {
          max-width: 530px;
          height: 490px;
        }

        #card {
          position: absolute;
          inset: 0;
          z-index: 1;
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          transition: 700ms;
          overflow: hidden;
          background: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .card-image {
          position: relative;
          height: 250px;
          width: 100%;
          overflow: hidden;
        }

        .capacity-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background-color: #FFD700;
          color: #1A3B29;
          font-weight: bold;
          padding: 8px 16px;
          border-radius: 20px;
          z-index: 10;
        }

        .category-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background-color: #1A3B29;
          color: white;
          font-size: 0.9rem;
          padding: 6px 12px;
          border-radius: 20px;
          text-transform: capitalize;
          z-index: 10;
        }

        .card-content {
          padding: 1.75rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .subtitle {
          color: #555;
          transition-duration: 300ms;
          transition-timing-function: ease-in-out;
          margin-top: 0.75rem;
        }

        .subtitle p {
          margin: 0.5rem 0;
          font-size: 1.05rem;
        }

        .subtitle span {
          font-weight: 600;
          color: #1A3B29;
        }

        .title {
          opacity: 1;
          transition-duration: 300ms;
          transition-timing-function: ease-in-out;
          transition-delay: 100ms;
          font-size: 1.6rem;
          font-weight: bold;
          color: #1A3B29;
          margin: 0;
        }

        #prompt {
          position: absolute;
          bottom: 20px;
          left: 20px;
          z-index: 20;
          font-size: 1rem;
          font-weight: bold;
          transition: 300ms ease-in-out;
          max-width: 150px;
          color: #FFD700;
        }

        .tracker {
          position: absolute;
          z-index: 3;
          width: 100%;
          height: 100%;
        }

        .tracker:hover {
          cursor: pointer;
        }

        .tracker:hover ~ #card #prompt {
          opacity: 0;
        }

        .tracker:hover ~ #card {
          transition: 300ms;
          filter: brightness(1.1);
        }

        .project-card-container:hover #card::before {
          transition: 200ms;
          content: '';
          opacity: 80%;
        }

        .canvas {
          perspective: 800px;
          inset: -20px;
          z-index: 2;
          position: absolute;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
          grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
          gap: 0px 0px;
          grid-template-areas: 
            "tr-1 tr-2 tr-3 tr-4 tr-5"
            "tr-6 tr-7 tr-8 tr-9 tr-10"
            "tr-11 tr-12 tr-13 tr-14 tr-15"
            "tr-16 tr-17 tr-18 tr-19 tr-20"
            "tr-21 tr-22 tr-23 tr-24 tr-25";
        }

        #card::before {
          content: '';
          background: linear-gradient(43deg, #1A3B29 0%, #2563EB 46%, #FFD700 100%);
          filter: blur(2rem);
          opacity: 0;
          width: 100%;
          height: 100%;
          position: absolute;
          z-index: -1;
          transition: 200ms;
        }

        /* Grid areas for trackers */
        ${[...Array(25)].map((_, i) => `
          .tr-${i + 1} {
            grid-area: tr-${i + 1};
          }
        `).join('')}

        /* Hover effects for each tracker */
        ${[...Array(5)].map((_, row) => 
          [...Array(5)].map((_, col) => {
            const index = row * 5 + col + 1;
            const rotateX = 20 - row * 10;
            const rotateY = -10 + col * 5;
            return `
              .tr-${index}:hover ~ #card {
                transition: 125ms ease-in-out;
                transform: rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(0deg);
              }
            `;
          }).join('')
        ).join('')}

        .noselect {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Add responsive styles */
        @media (max-width: 768px) {
          .project-card-container {
            height: 450px;
          }
          
          .card-image {
            height: 220px;
          }
        }
      `}</style>
    </div>
  );
};

// Lazy load the modal component
const ProjectDetailModal = lazy(() => import('@/components/ProjectDetailModal'));

export default function ProjectsPage() {
  const [filter, setFilter] = React.useState('all');
  const [selectedProject, setSelectedProject] = useState<null | any>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollTicking = React.useRef(false);
  
  // Optimized scroll effect for animations
  useEffect(() => {
    // Set loaded state after component mounts
    setIsLoaded(true);
    
    // Optimized scroll handler with requestAnimationFrame
    const handleScroll = () => {
      if (!scrollTicking.current) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          scrollTicking.current = false;
        });
        scrollTicking.current = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const projects = [
    {
      title: "On Grid Solar PV Rooftop Installation",
      location: "Molave, Zamboanga del Sur",
      solarPanelBrand: "LONGI",
      inverterBrand: "Sun Grow Inverters",
      imageUrl: "/projects/1.png",
      capacity: "350kWp",
      category: "commercial"
    },
    {
      title: "On grid Solar PV Roof Mount Installation",
      location: "Valenzuela City, Metro Manila",
      solarPanelBrand: "Canadian Solar",
      inverterBrand: "Sun Grow Inverters",
      imageUrl: "/projects/2.png",
      capacity: "200kWp",
      category: "commercial"
    },
    {
      title: "Solar Power CDO Corbox Plant",
      location: "Cagayan De Oro",
      solarPanelBrand: "Canadian Solar",
      inverterBrand: "Sun Grow Inverters",
      imageUrl: "/projects/3.png",
      capacity: "150kWp",
      category: "industrial"
    },
    {
      title: "Industrial Rooftop Solar Installation",
      location: "Batangas City",
      solarPanelBrand: "JA Solar",
      inverterBrand: "Huawei Inverters",
      imageUrl: "/projects/4.png",
      capacity: "175kWp",
      category: "industrial"
    },
    {
      title: "Commercial Complex Solar System",
      location: "Cebu City",
      solarPanelBrand: "Canadian Solar",
      inverterBrand: "Sun Grow Inverters",
      imageUrl: "/projects/5.png",
      capacity: "250kWp",
      category: "commercial"
    },
    {
      title: "Manufacturing Plant Solar Installation",
      location: "Davao City",
      solarPanelBrand: "LONGI",
      inverterBrand: "Enphase Microinverters",
      imageUrl: "/projects/6.png",
      capacity: "300kWp",
      category: "industrial"
    }
  ];

  // Memoize filtered projects to prevent unnecessary recalculations
  const filteredProjects = React.useMemo(() => 
    filter === 'all' ? projects : projects.filter(project => project.category === filter),
    [filter]
  );

  return (
    <>
      <main className="min-h-screen pt-44 relative overflow-hidden bg-gradient-to-b from-blue-100 via-sky-100 to-white">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Sun element - optimized */}
          <div 
            className={`absolute right-0 top-0 w-128 h-128 bg-yellow-300 rounded-full will-change-transform ${
              isLoaded ? 'opacity-70' : 'opacity-0'
            }`}
            style={{
              transform: `translate(25%, -25%) scale(${1 + scrollY * 0.001})`,
            }}
          />
          
          {/* Reduced number of solar panel elements */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`panel-${i}`}
              className={`absolute bg-blue-500 rounded-md will-change-transform ${
                isLoaded ? 'opacity-60' : 'opacity-0'
              }`}
              style={{
                width: `${80 + i * 25}px`,
                height: `${60 + i * 15}px`,
                top: `${15 + i * 18}%`,
                left: `${5 + i * 20}%`,
                transform: `rotate(${i * 15}deg) translateY(${scrollY * (0.08 + i * 0.02)}px)`,
              }}
            />
          ))}
          
          {/* Reduced bottom right panels */}
          {[...Array(2)].map((_, i) => (
            <div
              key={`bottom-panel-${i}`}
              className={`absolute bg-blue-500 rounded-md will-change-transform ${
                isLoaded ? 'opacity-60' : 'opacity-0'
              }`}
              style={{
                width: `${100 + i * 30}px`,
                height: `${80 + i * 20}px`,
                bottom: `${5 + i * 15}%`,
                right: `${5 + i * 18}%`,
                transform: `rotate(${-10 - i * 8}deg) translateY(${-scrollY * (0.05 + i * 0.015)}px)`,
              }}
            />
          ))}
          
          {/* Larger abstract light circles with more glow */}
          <div
            className={`absolute left-1/4 bottom-1/3 w-80 h-80 rounded-full transition-all duration-1000 ${
              isLoaded ? 'opacity-50' : 'opacity-0'
            }`}
            style={{
              background: 'radial-gradient(circle, rgba(56,189,248,0.8) 0%, rgba(59,130,246,0) 70%)',
              transform: `translateY(${-scrollY * 0.03}px)`,
              willChange: 'transform',
              animation: 'pulse 18s infinite alternate'
            }}
          />
          
          <div
            className={`absolute left-3/4 top-1/3 w-96 h-96 rounded-full transition-all duration-1500 ${
              isLoaded ? 'opacity-40' : 'opacity-0'
            }`}
            style={{
              background: 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, rgba(251,191,36,0) 70%)',
              transform: `translateY(${scrollY * 0.02}px)`,
              willChange: 'transform',
              animation: 'pulse 20s infinite alternate'
            }}
          />
          
          {/* Add shimmering effect at the bottom */}
          <div
            className={`absolute bottom-0 left-0 w-full h-64 transition-opacity duration-1000 ${
              isLoaded ? 'opacity-50' : 'opacity-0'
            }`}
            style={{
              background: 'linear-gradient(to top, rgba(56,189,248,0.3), rgba(56,189,248,0))',
              animation: 'shimmer 15s infinite'
            }}
          />
          
          {/* Big sun in corner */}
          <div 
            className={`absolute right-0 top-0 w-64 h-64 bg-yellow-200 rounded-full transition-all duration-1000 ease-out ${
              isLoaded ? 'opacity-60' : 'opacity-0'
            }`}
            style={{
              transform: `translate(30%, -10%) scale(${1 + scrollY * 0.0139})`
            }}
          />
          
          {/* Floating solar panels */}
          {[...Array(5)].map((_, i) => (
            <div
              key={`panel-${i}`}
              className={`absolute bg-blue-400 rounded-md transition-all duration-1000 ease-out ${
                isLoaded ? 'opacity-50' : 'opacity-0'
              }`}
              style={{
                width: `${60 + i * 20}px`,
                height: `${50 + i * 10}px`,
                top: `${20 + i * 15}%`,
                left: `${5 + i * 18}%`,
                transform: `rotate(${i * 9}deg) translateY(${scrollY * (0.1 + i * 0.004)}px)`,
                transition: 'transform 0.1s ease-out, opacity 1s ease-out',
                transitionDelay: `${i * 0}s`,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }}
            />
          ))}
          
          {/* Bottom right panels */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`bottom-panel-${i}`}
              className={`absolute bg-blue-400 rounded-md transition-all duration-1000 ease-out ${
                isLoaded ? 'opacity-50' : 'opacity-0'
              }`}
              style={{
                width: `${80 + i * 20}px`,
                height: `${60 + i * 15}px`,
                bottom: `${5 + i * 10}%`,
                right: `${5 + i * 10}%`,
                transform: `rotate(${-5 - i * 5}deg) translateY(${-scrollY * (0.01 + i * 0.005)}px)`,
                transition: 'transform 0.2s ease-out, opacity 1s ease-out',
                transitionDelay: `${0.5 + i * 0.1}s`,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }}
            />
          ))}
        </div>
        
        {/* Optimized animation keyframes */}
        <style jsx global>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes float1 {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes float2 {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
        
      {/* Spacer to prevent header overlap */}
      <div className="absolute top-0 left-0 w-full h-40 bg-transparent"></div>
      
      {/* Hero section */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-16 mt-8 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Solar Projects</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Explore our featured solar installations powering businesses and communities across the Philippines
          </p>
        </div>
      </div>
      
      {/* Filter section */}
        <div className="py-10 bg-gradient-to-b from-blue-600/20 to-transparent relative z-10">
        <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-blue-800 drop-shadow-sm">Browse Our Projects</h2>
              <p className="text-blue-600 mt-2">Filter by installation type</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-full text-lg transition-all duration-300 ${
                filter === 'all' 
                    ? 'bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg transform scale-105' 
                    : 'bg-white/80 backdrop-blur-sm text-blue-800 border-2 border-blue-800 hover:bg-blue-50 hover:scale-105 hover:shadow-md'
              }`}
            >
              All Projects
            </button>
            <button 
              onClick={() => setFilter('commercial')}
                className={`px-6 py-3 rounded-full text-lg transition-all duration-300 ${
                filter === 'commercial' 
                    ? 'bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg transform scale-105' 
                    : 'bg-white/80 backdrop-blur-sm text-blue-800 border-2 border-blue-800 hover:bg-blue-50 hover:scale-105 hover:shadow-md'
              }`}
            >
              Commercial
            </button>
            <button 
              onClick={() => setFilter('industrial')}
                className={`px-6 py-3 rounded-full text-lg transition-all duration-300 ${
                filter === 'industrial' 
                    ? 'bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg transform scale-105' 
                    : 'bg-white/80 backdrop-blur-sm text-blue-800 border-2 border-blue-800 hover:bg-blue-50 hover:scale-105 hover:shadow-md'
              }`}
            >
              Industrial
            </button>
          </div>
        </div>
      </div>
      
      {/* Projects section */}
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 justify-items-center">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              location={project.location}
              solarPanelBrand={project.solarPanelBrand}
              inverterBrand={project.inverterBrand}
              imageUrl={project.imageUrl}
              capacity={project.capacity}
              category={project.category}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      </div>
      
      {/* Additional info section */}
        <div className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-800">Why Choose D-Solar For Your Project?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border-t-4 border-yellow-400 transform transition-all duration-300 hover:-translate-y-2">
              <h3 className="text-xl font-bold mb-4 text-blue-800">Expert Installation</h3>
              <p className="text-gray-700">
                Our certified technicians have installed solar systems of all sizes across the Philippines, ensuring quality and reliability.
              </p>
            </div>
            
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border-t-4 border-yellow-400 transform transition-all duration-300 hover:-translate-y-2">
              <h3 className="text-xl font-bold mb-4 text-blue-800">Premium Equipment</h3>
              <p className="text-gray-700">
                We partner with industry-leading manufacturers to provide top-quality solar panels and inverters with long-term warranties.
              </p>
            </div>
            
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border-t-4 border-yellow-400 transform transition-all duration-300 hover:-translate-y-2">
              <h3 className="text-xl font-bold mb-4 text-blue-800">Ongoing Support</h3>
              <p className="text-gray-700">
                From initial consultation to post-installation maintenance, our team provides comprehensive support throughout your solar journey.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA section */}
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 relative z-10 overflow-hidden">
          {/* Decorative solar panel shapes */}
          <div className="absolute -top-8 left-10 w-28 h-20 bg-yellow-300 rounded-md opacity-60 transform -rotate-12" 
               style={{ animation: 'float3 18s infinite alternate ease-in-out' }}></div>
          <div className="absolute -bottom-5 right-1/4 w-24 h-16 bg-yellow-300 rounded-md opacity-50 transform rotate-6"
               style={{ animation: 'float2 22s infinite alternate ease-in-out' }}></div>
          <div className="absolute top-1/2 right-16 w-16 h-12 bg-yellow-300 rounded-md opacity-40 transform -rotate-8"
               style={{ animation: 'float1 16s infinite alternate ease-in-out' }}></div>
          
          <div className="container mx-auto px-4 text-center py-16 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white drop-shadow-md">Ready to Start Your Solar Project?</h2>
            <p className="text-xl max-w-3xl mx-auto mb-8 text-white/90">
            Contact us today for a free consultation and discover how we can help you harness the power of solar energy.
          </p>
            <button className="bg-white text-yellow-500 font-bold py-3 px-10 rounded-full hover:bg-blue-800 hover:text-white transition-colors shadow-lg transform hover:scale-105 transition-transform">
            Get Free Solar Analysis
          </button>
        </div>
      </div>
      </main>
      
      {/* Modal - moved outside the main container */}
      {selectedProject && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            Loading...
          </div>
        </div>}>
          <ProjectDetailModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        </Suspense>
      )}
    </>
  );
} 