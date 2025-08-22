'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { Montserrat, Open_Sans } from 'next/font/google';
import "./globals.css";
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScrollProgressBar from '@/components/ScrollProgressBar'
import { Analytics } from "@vercel/analytics/react"
import { usePathname } from 'next/navigation'

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

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <body className={`font-sans m-0 p-0 overflow-x-hidden ${montserrat.variable} ${openSans.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <Header />
      {!isAdminPage && <ScrollProgressBar height={10} showPercentage={false} />}
      <div>
        {children}
      </div>
      {!isAdminPage && <Footer />}
      <Analytics />
    </body>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <RootLayoutContent>{children}</RootLayoutContent>
    </html>
  );
}

