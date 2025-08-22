'use client';
import React, { useEffect, useState } from 'react';
import Carousel from '@/components/carousel';




export default function AboutAndServicesPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const services = [
    {
      icon: <img src="tools.png" alt="Tools Logo" className="w-14 h-14 mx-auto" />,
      title: 'Solar Design',
      description:
        'We use global state of the art tools using Lean Six Sigma for understanding your energy consumption, making an efficient and economic solar design; computing from optimal solar design to payback period.',
    },
    {
      icon: <img src="install.png" alt="Install Logo" className="w-14 h-14 mx-auto" />,
      title: 'Solar Installation',
      description:
        'Our brand-certified technical team will do site surveys for panel and system layout, roof leak-free solar panel mounting, and full system installation for complete setup.',
    },
    {
      icon: <img src="warranty.png" alt="Warranty Logo" className="w-14 h-14 mx-auto" />,
      title: 'Post-Sales Support',
      description:
        'We have internationally trained post-sales support team from SunPower USA that will assist your concerns in real-time, deploying our after sales team within 24-48 hrs ',
    },
  ];

  const reasons = [
    {
      icon: <img src="quality.png" alt="Quality Logo" className="w-14 h-14 mx-auto" />,
      title: 'High Quality',
      description:
        'We adhere to the highest standards of your needs, ensuring timely service, thorough operations, and quick turnaround times.',
    },
    {
      icon: <img src="excellent.png" alt="Excellent Logo" className="w-14 h-14 mx-auto" />,
      title: 'Excellent Support',
      description:
        'Your satisfaction is our ultimate goal. We provide excellent support to ensure your solar system operates efficiently.',
    },
  ];

  return (
    <main className="relative min-h-screen bg-blue-50 text-gray-900 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: 'url(/Panel.png)' }}
      />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-5xl font-bold text-center mb-12"></h1> <br />
        <Carousel />
      </div>

      


      <div className="relative z-10 container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-8">About <span style={{ color: 'rgb(212, 119, 32)' }}>D-SOLAR</span></h2>
        <p className="text-gray-600 text-center max-w-3xl mx-auto text-lg">
          Since 2018, D-Solar has specialized in solar system installation for industrial and commercial businesses, focusing on large scale power solutions. Our experienced team designs and installs custom solar solutions for maximum efficiency and savings, promoting quality and sustainability while helping clients reduce their carbon footprint and achieve
          It also vanguards cooperativism among its workers, it being one of the country’s first solutions provider whose workers make up among its major stakeholders and play a decisive role in the enterprise’s nationwide operations. It further seeks to contribute to societal transformation through its socially-adaptive product and service offerings as well as through its social programs namely FEED-DREAMS and Solutions4All
        </p>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Our <span style={{ color: 'rgb(212, 119, 32)' }}>Services</span></h2>
        <p className="text-gray-600 text-center max-w-3xl mx-auto text-lg"></p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl w-full md:w-11/12 lg:w-10/12 mx-auto"
            >
              <div className="flex flex-col items-center text-center">
                {service.icon}
                <h2 className="text-xl font-bold text-blue-800 mt-4">{service.title}</h2>
                <p className="text-gray-600 mt-2 text-sm">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us?</h2>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full md:w-2/3 lg:w-1/2">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg p-6 transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl w-full mx-auto"
              >
                <div className="flex flex-col items-center text-center">
                  {reason.icon}
                  <h2 className="text-xl font-bold text-blue-800 mt-4">{reason.title}</h2>
                  <p className="text-gray-600 mt-2 text-sm">{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
