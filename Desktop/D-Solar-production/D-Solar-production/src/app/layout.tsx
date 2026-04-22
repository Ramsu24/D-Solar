import { Geist, Geist_Mono } from "next/font/google";
import { Montserrat, Open_Sans } from 'next/font/google';
import "./globals.css";
import LayoutClient from '@/components/LayoutClient';
export { metadata } from './metadata';

// Configure Montserrat for headers
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: '700', // Bold
  variable: '--font-montserrat',
});

// Configure Open Sans for body text
const openSans = Open_Sans({
  subsets: ['latin'],
  weight: '400', // Regular
  variable: '--font-open-sans',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "D-Solar",
    "description": "Leading solar energy solutions provider in the Philippines offering residential and commercial solar panel installation, financing options, and sustainable energy solutions.",
    "url": "https://d-solar.asia",
    "logo": "https://d-solar.asia/logo.png",
    "image": "https://d-solar.asia/og-image.png",
    "telephone": "",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PH"
    },
    "sameAs": [],
    "priceRange": "$$",
    "serviceArea": {
      "@type": "Country",
      "name": "Philippines"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Solar Energy Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Solar Panel Installation",
            "description": "Professional solar panel installation for homes and businesses in the Philippines"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Solar Design",
            "description": "Custom solar system design using Lean Six Sigma methodology"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Solar Financing",
            "description": "Zero down payment solar financing options with 25-year warranty"
          }
        }
      ]
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`font-sans m-0 p-0 overflow-x-hidden ${montserrat.variable} ${openSans.variable} ${geistSans.variable} ${geistMono.variable}`}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}

