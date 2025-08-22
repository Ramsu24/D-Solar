import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, useAnimation, useInView } from 'framer-motion';

const AboutUsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <div ref={sectionRef} className="relative py-16 overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="/Solar-Panels-on-Metal-Roofs.jpg"
          alt="Solar Panels Background"
          fill
          quality={90}
          priority
          className="opacity-20 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-blue-950 mix-blend-multiply" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={controls}
          variants={{
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.6 } 
            }
          }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/90 p-2 rounded-full shadow-lg mr-4">
              <Image
                src="/logo.png"
                alt="D-Solar Logo"
                width={60}
                height={60}
                className="h-auto w-auto"
              />
            </div>
            <h2 className="text-4xl font-bold text-white">
              ABOUT <span className="text-orange-400">US</span>
            </h2>
          </div>
          <div className="w-24 h-1 bg-orange-400 mx-auto mb-6"></div>
          <p className="text-lg text-white max-w-2xl mx-auto">
            Bringing clean, renewable energy solutions to Filipino homes and businesses since 2018.
            <br />
            <a 
              href="/about" 
              className="inline-block bg-orange-400 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-colors mt-4"
            >
              Learn more about us
            </a>
          </p>
        </motion.div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left side: Company info */}
          <motion.div
            className="text-white"
            initial={{ opacity: 0, x: -30 }}
            animate={controls}
            variants={{
              visible: { 
                opacity: 1, 
                x: 0,
                transition: { 
                  duration: 0.6,
                  delay: 0.2,
                } 
              }
            }}
          >
            <h3 className="text-2xl font-semibold text-yellow-400 mb-4">
              World-Class Solar Service Provider
            </h3>
            
            <p className="text-gray-200 mb-6 text-lg">
              From 2019, D-Solar has been your trusted partner in fulfilling your solar installation needs with high standards of quality and guaranteed product efficiency.
            </p>
            
            <p className="text-gray-200 mb-6 text-lg">
              With an 8-year experience in this industry and hundreds of installations nationwide, we possess the expertise and resources needed to install your own solar system in time and within budget while ensuring utmost safety standards.
            </p>
            
            <div className="bg-blue-800/50 p-6 rounded-lg border border-blue-700 mt-8">
              <h4 className="text-xl font-bold mb-2">Our Mission</h4>
              <div className="flex items-start mb-4">
                <div className="w-1 h-16 bg-orange-400 mr-4 mt-1"></div>
                <div>
                  <p className="text-yellow-200 text-xl font-medium mb-2">BRINGING THE FILIPINO ENERGY INDEPENDENCE</p>
                  <p className="text-gray-300">Empowering Filipinos with sustainable energy solutions</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Right side: Image and Call-to-Action */}
          <motion.div
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, x: 30 }}
            animate={controls}
            variants={{
              visible: { 
                opacity: 1, 
                x: 0,
                transition: { 
                  duration: 0.6,
                  delay: 0.3,
                } 
              }
            }}
          >
            <div className="bg-white/10 backdrop-blur-sm p-1 rounded-xl overflow-hidden shadow-xl w-full max-w-md mx-auto">
              <div className="relative aspect-w-4 aspect-h-3 w-full">
                <Image
                  src="/4.jpg"        
                  alt="Solar Installation Team"
                  width={500}
                  height={400}
                  className="rounded-xl shadow-xl object-cover w-full h-auto"
                />
              </div>
            </div>
            
            <motion.div
              className="bg-gradient-to-r from-blue-800 to-blue-900 p-6 rounded-lg mt-6 shadow-lg w-full max-w-md mx-auto"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start mb-4">
                <div className="bg-orange-400 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Need Help with Solar Installation?</h4>
                  <p className="text-gray-300 mb-4">
                    Our expert team is ready to assist you with your solar energy needs
                  </p>
                  <a 
                    href="/contact" 
                    className="inline-block bg-orange-400 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-orange-500 transition-colors"
                  >
                    Contact Us Today
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* QR Code Section */}
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-white/20 max-w-md mx-auto mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={controls}
          variants={{
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 0.6,
                delay: 0.4,
              } 
            }
          }}
        >
          <div className="flex flex-col items-center text-center">
            <h4 className="text-2xl font-bold text-white mb-6">
              Scan to Get Instant Quote
            </h4>
            
            <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
              <Image
                src="/qr.png"
                alt="QR Code for Pricing"
                width={150}
                height={150}
                className="rounded-lg"
              />
              
            </div>
            
            <div className="text-center">
            <a 
              href="https://forms.office.com/Pages/ResponsePage.aspx?id=2oL6x5gizEChlRfKiUssJgG8alKsvA9Ik4XEW8xjkIJUNEhXWTVQTEpaNUxUQkZaRU1ZOVdGUktFUS4u&origin=QRCode"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-orange-400 hover:text-orange-300 transition-colors"
            >
              QR Code Link →
            </a>
              <p className="text-orange-400 font-medium text-lg mb-2">Chat or Call Us</p>
              <p className="text-2xl font-bold text-white mb-1">+63 960 621 0895</p>
              <p className="text-sm text-gray-300">Mobile and WhatsApp</p>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUsSection; 