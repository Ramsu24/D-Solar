import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Solar Financing in the Philippines | D-Solar',
  description: 'Explore solar financing options in the Philippines with little or no upfront payment for qualified projects and flexible terms through D-Solar.',
  alternates: {
    canonical: 'https://d-solar.asia/solar-financing',
  },
};

export default function SolarFinancingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">Solar Financing</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">
            Flexible solar financing that makes clean energy more accessible in the Philippines
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            D-Solar offers financing options designed to reduce the upfront burden of going solar for homes and businesses. Qualified projects may begin with little or no upfront payment, depending on the package and eligibility.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/" className="rounded-full bg-blue-900 px-6 py-3 font-semibold text-white">
              Talk to our solar team
            </Link>
            <Link href="/net-metering" className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700">
              Learn about net metering
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <article className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Why financing helps</h2>
            <p className="mt-4 text-slate-600">
              Solar financing can make it easier to install a system without waiting years to save enough for a full cash purchase.
            </p>
          </article>
          <article className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">What to expect</h2>
            <p className="mt-4 text-slate-600">
              Our team evaluates the site, explains package options, and helps customers understand the total long-term value of their solar investment.
            </p>
          </article>
        </div>
      </section>
      <Footer />
    </main>
  );
}
