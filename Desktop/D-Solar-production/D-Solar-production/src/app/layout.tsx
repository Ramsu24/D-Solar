import { Geist, Geist_Mono } from "next/font/google";
import { Montserrat, Open_Sans } from 'next/font/google';
import "./globals.css";
import LayoutClient from '@/components/LayoutClient';
import { companyDetails } from '@/data/seoContent';
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
    "@type": "SolarEnergyContractor",
    "name": companyDetails.name,
    "description": "D-Solar provides residential and commercial solar panel installation, solar financing, net metering guidance, and long-term solar maintenance across the Philippines.",
    "url": companyDetails.url,
    "telephone": companyDetails.telephone,
    "email": companyDetails.email,
    "logo": companyDetails.logoUrl,
    "image": companyDetails.imageUrl,
    "foundingDate": companyDetails.foundingDate,
    "areaServed": companyDetails.serviceAreas,
    "sameAs": companyDetails.sameAs,
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PH"
    },
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
            "name": "Solar Design",
            "description": "Custom solar system design for homes and businesses in the Philippines"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Solar Panel Installation",
            "description": "Professional rooftop solar installation with quality workmanship and post-installation support"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Solar Financing",
            "description": "Flexible solar financing options with low or zero upfront payment for qualified projects"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "100"
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much does solar panel installation cost in the Philippines?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Solar installation costs depend on system size, roof condition, and energy usage. D-Solar offers tailored packages for homes and businesses, with financing options that can make going solar more affordable with little or no upfront payment."
        }
      },
      {
        "@type": "Question",
        "name": "What is net metering and how does it work in the Philippines?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Net metering allows solar system owners to send excess power back to the grid and receive credits on their electricity bill. It helps reduce monthly costs and improves the return on investment for rooftop solar systems."
        }
      },
      {
        "@type": "Question",
        "name": "Is ₱0 down payment solar really available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. D-Solar offers flexible solar financing options that may allow qualified customers to start with little or no upfront payment, depending on the package and eligibility requirements."
        }
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className={`font-sans m-0 p-0 overflow-x-hidden ${montserrat.variable} ${openSans.variable} ${geistSans.variable} ${geistMono.variable}`}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}

