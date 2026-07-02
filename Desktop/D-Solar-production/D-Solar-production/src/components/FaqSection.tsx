import { companyFaqs } from '@/data/seoContent';

export default function FaqSection() {
  return (
    <section aria-labelledby="faq-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Frequently asked questions</p>
        <h2 id="faq-heading" className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
          Solar questions answered for Filipino homes and businesses
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600">
          Clear answers about pricing, net metering, financing, installation time, and long-term system performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {companyFaqs.map((faq, index) => (
          <article key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
            <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              FAQ {index + 1}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
