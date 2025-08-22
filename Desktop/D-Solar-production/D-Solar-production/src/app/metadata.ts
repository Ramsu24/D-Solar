import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "D-Solar - Powering Filipino Energy Independence",
  description: "D-Solar is a leading solar energy solutions provider in the Philippines, offering residential and commercial solar panel installation, financing options, and sustainable energy solutions.",
  keywords: "solar energy, solar panels, renewable energy, Philippines, solar installation, solar financing, sustainable energy, green energy, solar power, D-Solar",
  authors: [{ name: "D-Solar Team" }],
  creator: "D-Solar",
  publisher: "D-Solar",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dsolar.com.ph",
    siteName: "D-Solar",
    title: "D-Solar - Powering Filipino Energy Independence",
    description: "Leading solar energy solutions provider in the Philippines. Expert installation, competitive financing, and sustainable energy solutions for homes and businesses.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "D-Solar - Solar Energy Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "D-Solar - Powering Filipino Energy Independence",
    description: "Leading solar energy solutions provider in the Philippines. Expert installation, competitive financing, and sustainable energy solutions.",
    images: ["/twitter-image.jpg"],
    creator: "@D-SolarPH",
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://dsolar.com.ph",
  },
}; 