'use client';

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScrollProgressBar from '@/components/ScrollProgressBar'
import { Analytics } from "@vercel/analytics/react"
import { usePathname } from 'next/navigation'

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      <Header />
      {!isAdminPage && <ScrollProgressBar height={10} showPercentage={false} />}
      <div>
        {children}
      </div>
      {!isAdminPage && <Footer />}
      <Analytics />
    </>
  );
}
