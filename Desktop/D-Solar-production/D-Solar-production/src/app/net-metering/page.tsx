import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Net Metering in the Philippines | D-Solar',
  description: 'Learn how net metering works in the Philippines, how it reduces electricity bills, and how D-Solar helps homeowners and businesses qualify for solar savings.',
  alternates: {
    canonical: 'https://d-solar.asia/net-metering',
  },
};

export default function NetMeteringPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">Net Metering</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">
            How net metering helps Filipino households and businesses save more with solar
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Net metering allows solar system owners to send excess electricity back to the grid and receive bill credits. It is one of the most practical ways to improve the return on investment for rooftop solar in the Philippines.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/" className="rounded-full bg-blue-900 px-6 py-3 font-semibold text-white">
              Request a free solar assessment
            </Link>
            <Link href="/solar-financing" className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700">
              Explore solar financing options
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <article className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">How it works</h2>
            <p className="mt-4 text-slate-600">
              During the day, your solar panels generate electricity. Any power you do not use can be exported to the grid, and your bill is adjusted through credits.
            </p>
          </article>
          <article className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Why it matters</h2>
            <p className="mt-4 text-slate-600">
              Net metering lowers electricity costs, improves energy independence, and helps solar owners recover their investment faster.
            </p>
          </article>
        </div>
      </section>
      <Footer />
    </main>
  );
}
