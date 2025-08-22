'use client';
import React, { useEffect, useState } from 'react';
import Carousel from '@/components/carousel';

export default function SocialProgramsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const socialPrograms = [
    {
      title: 'FEED-DREAMS',
      description: 'Realizing Aspirations!',
      initiatives: [
        'Technological and Entrepreneurial Center for Innovation (TECI)',
        'Empowerment of OSY for Entrepreneurial Opportunities',
        'Employment Program for OSY (Out of School Youth)',
        'Community-wide Social Enterprise Program for Families',
        'Equipping and Empowering the Underserved Communities by providing them access to basic necessities',
      ],
      image: 'FeedDreams.png',
    },
    {
      title: 'Solutions4All',
      description: 'Providing comprehensive solutions for all.',
      initiatives: [
        'Access to sustainable technology',
        'Educational resources for underserved communities',
        'Infrastructure development for disadvantaged areas',
        'Support systems for improved quality of life',
      ],
      image: 'Solutions.png',
    },
  ];

  return (
    <main className="relative min-h-screen bg-blue-50 text-gray-900 overflow-hidden">
      {/* Solar panel background image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
           style={{ backgroundImage: 'url(/Panel.png)' }} />
      
      {/* Carousel Section */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <Carousel />
      </div>
      {/* Hero Section with Solar Panel and Tractor Image */}
    <div className="relative z-10 w-full bg-cover bg-center h-96 flex items-end"
         style={{ backgroundImage: 'url(/solar-farm.jpg)' }}>
      <div className="container mx-auto px-4 pb-12">
        <div className="bg-white/80 p-8 rounded-lg max-w-3xl backdrop-blur-sm">
      <h1 className="text-5xl font-bold mb-4">
        <span className="text-blue-800">We are passionately dedicated to making</span>
        <br />
        <span className="text-orange-500">meaningful changes in people's lives</span>
      </h1>
        </div>
      </div>
    </div>

      {/* Mission Statement */}
      <div className="relative z-10 container mx-auto px-4 py-12 bg-white/90 rounded-lg shadow-lg mb-16">
        <h2 className="text-4xl font-bold text-center mb-8">Our Mission</h2>
        <p className="text-gray-800 text-lg leading-relaxed">
          While gaining competence in the technical arena through efficient project deliveries, D-TEC has shown that every facet of its operations is closely linked to the improvement of the well-being of the underprivileged people. It has created social programs – namely, FEED-DREAMS and Solutions4All - to effect a significant change in the lives of the disadvantaged sectors of the society. Through these programs, D-TEC has gone on to become one of those mission-driven companies making well-intentioned efforts to realize a bright future for the less fortunate ones.
        </p>
      </div>

      {/* Social Programs Section */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-8">Our <span className="text-orange-500">Social Programs</span></h2>
        <p className="text-gray-600 text-center max-w-3xl mx-auto text-lg mb-12">
          We are deeply committed to making meaningful changes in people's lives. Through our social programs, we aim to effect significant change in the lives of the disadvantaged sectors of society.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
          {socialPrograms.map((program, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-out hover:shadow-xl w-full">
              <div className="h-48 bg-center bg-cover"
                   style={{ backgroundImage: `url(${program.image})` }} />
              <div className="p-6 border-t-4 border-blue-800">
                <h2 className="text-2xl font-bold text-blue-800">{program.title}</h2>
                <p className="text-gray-600 mt-2">{program.description}</p>
                {program.initiatives && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-blue-700 mb-2">Initiatives:</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {program.initiatives.map((initiative, i) => (
                        <li key={i}>{initiative}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscribe Section */}
      <div className="relative z-10 container mx-auto px-4 py-16 mb-12">
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-3xl font-bold text-center mb-4">Get Updated</h2>
          <p className="text-center max-w-2xl mx-auto text-lg mb-8">
            Subscribe to our monthly Tech Solution Articles and stay informed about our social impact initiatives.
          </p>
          <div className="flex justify-center">
            <div className="w-full md:w-2/3 lg:w-1/2">
              <form className="flex flex-col md:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-all duration-300 font-semibold"
                >
                  Sign Up
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Sustainable Technology Section - Inspired by the Solar Panel/Farming Image */}
      <div className="relative z-10 container mx-auto px-4 py-16 mb-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold text-blue-800 mb-4">Sustainable Technology for Communities</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              At D-TEC, we integrate sustainable technology solutions like solar energy with agricultural development to 
              create lasting positive impact. Our approach combines modern technology with traditional practices to 
              empower communities and improve livelihoods while protecting the environment.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <span className="mr-2 text-blue-800">✓</span>
                Solar-powered agricultural solutions
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-blue-800">✓</span>
                Training programs for farmers in sustainable practices
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-blue-800">✓</span>
                Reducing carbon footprint while increasing productivity
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-blue-800">✓</span>
                Creating green jobs in rural communities
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/2">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="/solar-farm-tractor.jpg" 
                alt="Solar panels over agricultural land with tractor" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}