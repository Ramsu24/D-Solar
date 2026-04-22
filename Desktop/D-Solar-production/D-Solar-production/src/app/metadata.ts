import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://d-solar.asia"),
  title: {
    default: "D-Solar | #1 Solar Panel Installation in the Philippines",
    template: "%s | D-Solar Philippines",
  },
  description: "D-Solar is a leading solar energy solutions provider in the Philippines. ₱0 down payment, 25-year warranty, typhoon-ready solar panel installation for homes and businesses. Cut energy bills by up to 70%.",
  keywords: "solar panel installation Philippines, solar energy Philippines, residential solar panels, commercial solar installation, solar financing Philippines, net metering Philippines, renewable energy, green energy, D-Solar, solar power system, solar loan Philippines, zero down payment solar",
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
    url: "https://d-solar.asia",
    siteName: "D-Solar",
    title: "D-Solar - Powering Filipino Energy Independence",
    description: "Leading solar energy solutions provider in the Philippines. Expert installation, competitive financing, and sustainable energy solutions for homes and businesses.",
    images: [
      {
        url: "https://d-solar.asia/og-image.png",
        width: 1200,
        height: 630,
        alt: "D-Solar - Solar Energy Solutions Philippines",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "D-Solar - Powering Filipino Energy Independence",
    description: "Leading solar energy solutions provider in the Philippines. Expert installation, competitive financing, and sustainable energy solutions.",
    images: ["https://d-solar.asia/og-image.png"],
    creator: "@D-SolarPH",
  },
  verification: {
    google: "ZAiKKplJGVB_MfpA-DN30WyM7I-cVTZKe32xpNIMeRE",
  },
  alternates: {
    canonical: "https://d-solar.asia",
  },
}; 