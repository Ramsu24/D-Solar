import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useAnimation, useInView } from 'framer-motion';
import { siteColors } from '@/utils/theme';

// Partner logos
const partnerLogos = [
  { name: 'Enphase', logo: '/enphase-logo.png', needsInvert: false },
  { name: 'Deye', logo: '/deye-logo.png', needsInvert: false },
  { name: 'Dyness', logo: '/dyness-logo.png', needsInvert: false },
  { name: 'CanadianSolar', logo: '/canadiansolar-logo.png', needsInvert: false },
  { name: 'Panasonic', logo: '/Panasonic-logo.png', needsInvert: false },
  { name: 'Huawei', logo: '/Huawei-Logo.png', needsInvert: false },
  { name: 'Solis', logo: '/Solis-Logo.png', needsInvert: false },
  { name: 'JA Solar', logo: '/JA Solar-logo.png', needsInvert: false }
];

interface ServiceCardProps {
  title: string;
  description: string;
  imagePath: string;
  index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, imagePath, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: false, amount: 0.3 });
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.6,
            delay: index * 0.2,
          } 
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="relative rounded-xl overflow-hidden shadow-2xl flex flex-col"
      style={{ 
        background: `linear-gradient(to bottom right, ${siteColors.primary.blue}CC, ${siteColors.primary.blue}EE)` 
      }}
    >
      <div 
        className="absolute w-32 h-32 rounded-full blur-2xl pointer-events-none"
        style={{ 
          left: `${mousePosition.x}%`, 
          top: `${mousePosition.y}%`, 
          transform: 'translate(-50%, -50%)', 
          opacity: isHovered ? 0.3 : 0,
          transition: 'opacity 0.3s ease',
          backgroundColor: `${siteColors.primary.orange}50`
        }}
      />
      
      <div className="relative h-56 overflow-hidden">
        <Image
          src={imagePath}
          alt={title}
          fill
          className={`transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'} object-cover`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent" />
      </div>
      
      <motion.div 
        className="p-6 flex-grow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold mb-3" style={{ color: siteColors.primary.orange }}>{title}</h3>
        <p className="text-gray-100">{description}</p>
      </motion.div>
      
      <motion.div 
        className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: siteColors.primary.orange }}
        animate={{ 
          rotate: isHovered ? 360 : 0,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.5 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.div>
    </motion.div>
  );
};

const ServicesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
  const controls = useAnimation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const services = [
    {
      title: "Solar Design",
      description: "We employ cutting-edge global technologies, integrating Lean Six Sigma methodologies to analyze your energy consumption with precision. Our approach ensures the development of an optimized, cost-efficient solar design, providing comprehensive insights—from ideal system configuration to payback period—maximizing both performance and financial returns.",
      imagePath: "/1.jpg",
    },
    {
      title: "Solar Installation",
      description: "Our brand-certified technical team conducts meticulous site surveys to optimize panel and system layouts, ensuring precision-engineered, leak-free solar panel mounting and seamless full-system installation. We exclusively offer premium German and Japanese solar panels, backed by an industry-leading 25- to 30-year warranty, providing long-term reliability and peace of mind.",
      imagePath: "/2.jpg",
    },
    {
      title: "Post-Sales Support",
      description: "Our post-sales support team, internationally trained under SunPower USA’s rigorous standards, is equipped to address your concerns in real time. With a commitment to efficiency and excellence, we ensure rapid deployment of our after-sales specialists within 24 to 48 hours, delivering seamless and responsive service when you need it most.",
      imagePath: "/3.jpg",
    },
  ];

  const additionalInfo = [
    {
      title: "Quality Assurance",
      description: "We uphold the highest standards of excellence, leveraging SunPower-derived design quality assurance to ensure precision and reliability. Our streamlined process enables installation within just three days of quotation, followed by comprehensive post-installation check-ups to guarantee optimal system performance and long-term satisfaction.",
      imagePath: "/quality.png",
    },
    {
      title: "Client Satisfaction",
      description: "Our organization was founded to deliver unparalleled client support, backed by industry experts from SunPower USA. Leveraging a robust international customer support database, we ensure precise issue resolution with efficiency and expertise, setting a new standard in service excellence.",
      imagePath: "/excellent.png",
    },
  ];

  return (
    <div 
      ref={sectionRef}
      className="relative py-16 overflow-hidden"
      style={{ background: `linear-gradient(to bottom, ${siteColors.primary.blue}, ${siteColors.primary.blue}DD)` }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Dynamic background effects */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ 
          left: `${mousePosition.x}%`, 
          top: `${mousePosition.y}%`, 
          transform: 'translate(-50%, -50%)', 
          opacity: isHovering ? 0.3 : 0.1,
          transition: 'opacity 0.3s ease',
          backgroundColor: `${siteColors.primary.blue}33`
        }}
      />
      <div 
        className="absolute w-64 h-64 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ 
          right: '5%', 
          top: '15%',
          backgroundColor: `${siteColors.primary.orange}33`
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 0.6,
              } 
            },
          }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Our </span>
            <span style={{ color: siteColors.primary.orange }}>Services</span>
          </h2>
          <div className="h-1 w-24 mx-auto" style={{ backgroundColor: siteColors.primary.orange }}></div>
        </motion.div>

        {/* Main services section with 3D card effect */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <ServiceCard 
              key={service.title}
              title={service.title}
              description={service.description}
              imagePath={service.imagePath}
              index={index}
            />
          ))}
        </div>

        {/* Additional info section with scroll reveal */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { 
                staggerChildren: 0.3,
                delayChildren: 0.3,
              } 
            },
          }}
        >
          {additionalInfo.map((info, index) => (
            <motion.div 
              key={info.title}
              className="rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-6 p-8"
              style={{ background: `linear-gradient(to bottom right, ${siteColors.primary.blue}99, ${siteColors.primary.blue}CC)` }}
              variants={{
                hidden: { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
                visible: { 
                  opacity: 1, 
                  x: 0,
                  transition: { duration: 0.5 } 
                },
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div className="relative w-24 h-24 flex-shrink-0 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                <Image
                  src={info.imagePath}
                  alt={info.title}
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: siteColors.primary.orange }}>{info.title}</h3>
                <p className="text-gray-100">{info.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Why Choose Us with animated highlight */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.8 } 
            },
          }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-white">Why </span>
            <span style={{ color: siteColors.primary.orange }}>Choose Us?</span>
          </h2>
          <div className="h-1 w-32 mx-auto" style={{ backgroundColor: siteColors.primary.orange }}></div>
        </motion.div>

        {/* Partner logos with horizontal scroll animation */}
        <motion.div
          className="relative overflow-hidden py-8"
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { duration: 0.5 } 
            },
          }}
        >
          <div className="flex justify-center items-center flex-wrap gap-8">
            {partnerLogos.map((partner, index) => (
              <motion.div
                key={partner.name}
                className="relative w-40 h-32 bg-white/5 rounded-lg p-4 flex items-center justify-center backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={controls}
                variants={{
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      delay: index * 0.1,
                      duration: 0.5,
                    } 
                  }
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
                }}
              >
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  width={120}
                  height={80}
                  className={`object-contain opacity-90 hover:opacity-100 transition-opacity duration-300 ${partner.needsInvert ? 'filter brightness-0 invert' : ''}`}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

      
      </div>
    </div>
  );
};

export default ServicesSection; 