import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sparkles, ArrowLeft, Gift, Lightbulb, HelpCircle, Cake } from 'lucide-react';
import SupportButton from '@/components/SupportButton';
import WhatsNew from '@/components/WhatsNew';
import { AGE_PAGES, getAgePage, getAllAgePages } from '@/lib/ageWishesData';
import { getAllCategories } from '@/lib/wishesData';
import { getBreadcrumbSchema, getItemListSchema, getCollectionSchema, getFAQSchema } from '@/lib/seo';
import WishCard from '@/app/wishes/[slug]/WishCard';
import MonetizationSlot from '@/components/MonetizationSlot';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday.nirbhay.online';

export async function generateStaticParams() {
  return AGE_PAGES.map((a) => ({
    age: a.age,
  }));
}

export async function generateMetadata({ params }) {
  const { age } = await params;
  const page = getAgePage(age);

  if (!page) {
    return {
      title: 'Birthday Wishes by Age Not Found | BirthdayGen',
      description: 'The requested milestone-age birthday wishes could not be found.',
    };
  }

  const ogImage = `/api/og?name=${encodeURIComponent(page.navTitle)}&age=${page.age}&theme=${page.theme || 'fun'}`;

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: {
      canonical: `/ages/${page.age}`,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `${baseUrl}/ages/${page.age}`,
      siteName: 'BirthdayGen',
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${page.navTitle} birthday wishes` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.metaTitle,
      description: page.metaDescription,
      images: [ogImage],
    },
  };
}

export default async function AgeWishesPage({ params }) {
  const { age } = await params;
  const page = getAgePage(age);

  if (!page) {
    notFound();
  }

  const otherAges = getAllAgePages().filter((a) => a.age !== page.age);
  const categories = getAllCategories().slice(0, 8);

  const breadcrumbs = getBreadcrumbSchema(baseUrl, [
    { name: 'Home', url: '/' },
    { name: 'Wishes by Age', url: '/ages' },
    { name: page.navTitle, url: `/ages/${page.age}` },
  ]);

  const collectionSchema = getCollectionSchema(baseUrl, { ...page, canonicalUrl: `${baseUrl}/ages/${page.age}` });
  const itemListSchema = getItemListSchema(baseUrl, page.title, page.wishes);
  const faqSchema = page.faqs && page.faqs.length > 0 ? getFAQSchema(page.faqs) : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-900">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center border-b border-purple-100/60 bg-white/70 backdrop-blur-md sticky top-0 z-50">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            <span className="text-2xl">🎉</span> BirthdayGen
          </Link>
          <div className="flex gap-4 sm:gap-6 text-sm font-medium text-gray-600 items-center">
            <Link href="/" className="hover:text-purple-600 transition-colors">Card Generator</Link>
            <Link href="/ages" className="hover:text-purple-600 transition-colors">All Ages</Link>
            <WhatsNew />
          </div>
        </nav>

        <div className="container mx-auto px-4 pt-6 max-w-5xl">
          <nav aria-label="Breadcrumb" className="text-xs text-gray-500 flex items-center space-x-2">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/ages" className="hover:underline">Wishes by Age</Link>
            <span>/</span>
            <span className="font-semibold text-purple-600">{page.navTitle}</span>
          </nav>
        </div>

        <header className="container mx-auto px-4 py-10 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <Cake className="w-3.5 h-3.5" /> Turning {page.age} • Curated Wishes
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
            {page.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mb-6">
            {page.intro}
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <Link
              href="/#create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" /> Create Interactive Birthday Card
            </Link>
            <Link
              href="/ages"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-gray-700 font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Browse Other Ages
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 max-w-5xl">
          <MonetizationSlot slotId="ages-top" className="my-4" />
        </div>

        <main className="container mx-auto px-4 pb-20 max-w-5xl">
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Gift className="w-6 h-6 text-purple-600" /> Best {page.navTitle} Birthday Messages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {page.wishes.map((wish) => (
                <WishCard key={wish.id} wish={wish} source={`ages/${page.age}`} />
              ))}
            </div>
          </section>

          {page.tips && (
            <section className="bg-white rounded-3xl p-8 border border-purple-100 shadow-sm mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-amber-500" /> Tips for a Perfect {page.navTitle} Birthday
              </h2>
              <ul className="space-y-3 text-gray-700">
                {page.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm sm:text-base">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {page.faqs && page.faqs.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-purple-600" /> Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {page.faqs.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between font-bold text-gray-900 text-base sm:text-lg">
                      <span>{faq.question}</span>
                      <span className="ml-4 transition group-open:-rotate-180 text-purple-600">▼</span>
                    </summary>
                    <p className="mt-3 text-gray-600 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section className="bg-gradient-to-br from-white to-purple-50/50 rounded-3xl p-8 border border-purple-100 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Explore Other Milestone Ages</h2>
            <div className="flex flex-wrap gap-2.5">
              {otherAges.map((a) => (
                <Link
                  key={a.age}
                  href={`/ages/${a.age}`}
                  className="px-4 py-2 rounded-xl bg-white border border-purple-100 text-purple-700 text-sm font-semibold hover:bg-purple-600 hover:text-white transition-all shadow-xs"
                >
                  {a.navTitle} Wishes →
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-white/70 rounded-3xl p-8 border border-purple-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Or Browse Wishes by Relationship</h2>
            <div className="flex flex-wrap gap-2.5">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/wishes/${c.slug}`}
                  className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 text-sm font-semibold hover:bg-purple-600 hover:text-white transition-all"
                >
                  {c.navTitle} →
                </Link>
              ))}
            </div>
          </section>
        </main>

        <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
          <div className="container mx-auto px-4 max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <p>© {new Date().getFullYear()} BirthdayGen. Create free interactive birthday cards.</p>
            <div className="flex gap-4">
              <Link href="/" className="hover:text-white transition-colors">Card Generator</Link>
              <Link href="/wishes" className="hover:text-white transition-colors">Wishes Hub</Link>
              <Link href="/ages" className="hover:text-white transition-colors">Wishes by Age</Link>
              <SupportButton variant="link" />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
