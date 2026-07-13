import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solar Energy Blog | D-Solar Philippines",
  description:
    "Read the latest articles on solar energy, renewable power solutions, net metering, and sustainable living in the Philippines from D-Solar.",
  keywords: [
    "solar energy philippines",
    "solar panel installation philippines",
    "net metering philippines",
    "solar savings philippines",
    "d-solar blog",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Solar Energy Blog | D-Solar Philippines",
    description:
      "Latest articles on solar energy, renewable power solutions, and sustainable living in the Philippines.",
    url: "https://d-solar.asia/blogs",
    siteName: "D-Solar",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Energy Blog | D-Solar Philippines",
    description:
      "Latest articles on solar energy, renewable power solutions, and sustainable living in the Philippines.",
  },
  alternates: {
    canonical: "https://d-solar.asia/blogs",
  },
};
