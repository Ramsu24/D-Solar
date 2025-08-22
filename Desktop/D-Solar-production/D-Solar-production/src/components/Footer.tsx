'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Mail, Phone, MapPin, Star } from 'lucide-react';
import { siteColors } from '@/utils/theme';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: siteColors.primary.blue }} className="text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: siteColors.primary.orange }}>Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2" style={{ color: siteColors.secondary.yellow }} />
                <a href="tel:+63XXXXXXXXXX" className="hover:text-accent-2 transition-colors duration-300" style={{ color: siteColors.neutrals.white }}>
                  Landline: +632-8831-7330
                  <br />
                  Mobile: +63960-471-6968
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2" style={{ color: siteColors.secondary.yellow }} />
                <a href="mailto:info@d-tec.asia" className="hover:text-accent-2 transition-colors duration-300" style={{ color: siteColors.neutrals.white }}>
                  info@d-tec.asia
                </a>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" style={{ color: siteColors.secondary.yellow }} />
                <span style={{ color: siteColors.neutrals.white }}>No.30-C Westbend Arcade, Dona Soledad Avenue, Paranaque City</span>
              </div>
              {/* FB Messenger Button */}
              <button
                onClick={() => window.open('https://m.me/D-SolarPH', '_blank')}
                className="flex items-center px-4 py-2 rounded-lg mt-4 transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: siteColors.primary.orange }}
              >
                <Facebook className="w-5 h-5 mr-2" />
                Message us on Facebook
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: siteColors.primary.orange }}>Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-accent-2 transition-colors duration-300" style={{ color: siteColors.neutrals.white }}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-accent-2 transition-colors duration-300" style={{ color: siteColors.neutrals.white }}>
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-accent-2 transition-colors duration-300" style={{ color: siteColors.neutrals.white }}>
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-accent-2 transition-colors duration-300" style={{ color: siteColors.neutrals.white }}>
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: siteColors.primary.orange }}>Certified Partners</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-2 rounded-lg transition-transform duration-300 hover:scale-105">
                <Image
                  src="/deye-logo.png"
                  alt="Deye Certification"
                  width={80}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="bg-white p-2 rounded-lg transition-transform duration-300 hover:scale-105">
                <Image
                  src="/huawei-logo.png"
                  alt="Huawei Certification"
                  width={80}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="bg-white p-2 rounded-lg transition-transform duration-300 hover:scale-105">
                <Image
                  src="/Panasonic-logo.png"
                  alt="Panasonic Certification"
                  width={80}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="bg-white p-2 rounded-lg transition-transform duration-300 hover:scale-105">
                <Image
                  src="/Solis-logo.png"
                  alt="Solis Certification"
                  width={80}
                  height={40}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Feedback Button */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: siteColors.primary.orange }}>Feedback</h3>
            <button
              onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSd6aCvJMLG0bNok-7fHBu0o6JXKDmYHv70pN45q4gxvnv8X9w/viewform?usp=header')}
              className="flex items-center px-4 py-2 rounded-lg transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: siteColors.primary.orange, color: siteColors.neutrals.white }}
            >
              Want to give feedback? Click here!
            </button>
          </div>

          {/* Social Proof */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: siteColors.primary.orange }}>Customer Reviews</h3>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="flex items-center mb-2">
                <div className="flex" style={{ color: siteColors.secondary.yellow }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5"
                      fill={i < 4.9 ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className="ml-2" style={{ color: siteColors.neutrals.white }}>4.9/5</span>
              </div>
              <p className="text-sm" style={{ color: siteColors.neutrals.lightGray }}>Based on 100+ Reviews on Facebook</p>
              <a
                href="https://facebook.com/D-SolarPH"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 hover:underline transition-all duration-300"
                style={{ color: siteColors.primary.orange }}
              >
                View Reviews →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} className="border-t">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p style={{ color: siteColors.neutrals.lightGray }}>© {new Date().getFullYear()} D-Solar. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <Link href="/privacy-policy" className="transition-colors duration-300 hover:text-accent-2" style={{ color: siteColors.neutrals.white }}>
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors duration-300 hover:text-accent-2" style={{ color: siteColors.neutrals.white }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}