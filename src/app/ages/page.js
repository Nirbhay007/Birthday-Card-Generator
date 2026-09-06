import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Gift, Cake } from 'lucide-react';
import SupportButton from '@/components/SupportButton';
import WhatsNew from '@/components/WhatsNew';
import { getAllAgePages } from '@/lib/ageWishesData';
import { getAllCategories } from '@/lib/wishesData';
import { getBreadcrumbSchema } from '@/lib/seo';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday.nirbhay.online';

export const metadata = {
  title: 'Birthday Wishes by Age: 16th, 18th, 21st, 30th, 50th & More | BirthdayGen',
  description: 'Find the perfect birthday wish for every milestone age — sweet 16, 18th, 21st, 30th, 40th, 50th, 60th. Copy a message or send an interactive card with candles!',
  alternates: {
    canonical: '/ages',
  },
  openGraph: {
    title: 'Birthday Wishes by Milestone Age | BirthdayGen',
    description: 'Milestone-age birthday wishes from sweet 16 to golden 50th. Turn any wish into an interactive surprise card!',
    url: `${baseUrl}/ages`,
    siteName: 'BirthdayGen',
    type: 'website',
    images: [{ url: '/api/og?name=Milestones&theme=royal', width: 1200, height: 630, alt: 'Birthday wishes by age' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Birthday Wishes by Milestone Age | BirthdayGen',
    description: 'Milestone-age birthday wishes from sweet 16 to golden 50th.',
    images: ['/api/og?name=Milestones&theme=royal'],
  },
};

export default function AgesIndexPage() {
  const ages = getAllAgePages();
  const categories = getAllCategories().slice(0, 8);

  const breadcrumbs = getBreadcrumbSchema(baseUrl, [
    { name: 'Home', url: '/' },
    { name: 'Wishes by Age', url: '/ages' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-900">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center border-b border-purple-100/60 bg-white/70 backdrop-blur-md sticky top-0 z-50">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            <span className="text-2xl">🎉</span> BirthdayGen
          </Link>
          <div className="flex gap-4 sm:gap-6 text-sm font-medium text-gray-600 items-center">
            <Link href="/" className="hover:text-purple-600 transition-colors">Card Generator</Link>
            <Link href="/wishes" className="hover:text-purple-600 transition-colors">Wishes Hub</Link>
            <WhatsNew />
          </div>
        </nav>

        <header className="container mx-auto px-4 py-12 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-6">
            <Cake className="w-4 h-4" /> Milestone Age Collections
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Birthday Wishes for Every <span className="text-purple-600">Milestone Age</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Sweet 16, legal 18, wild 21, thriving 30, golden 50 — every milestone deserves words that fit the moment. Pick an age, steal a wish, send a surprise.
          </p>
        </header>

        <main className="container mx-auto px-4 pb-20 max-w-6xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-600" /> Browse by Age
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {ages.map((a) => (
              <Link
                key={a.age}
                href={`/ages/${a.age}`}
                className="group bg-white rounded-3xl p-6 border border-purple-100/80 shadow-sm hover:shadow-xl transition-all duration-300 text-center hover:-translate-y-1"
              >
                <div className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                  {a.age}
                </div>
                <p className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors text-sm sm:text-base">{a.title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.shortDescription}</p>
                <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-purple-600">
                  {a.wishes.length} wishes <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>

          <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-3xl p-8 sm:p-12 shadow-xl mb-16 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl font-extrabold mb-3">Turning Their Milestone Into a Moment</h2>
              <p className="text-purple-100 leading-relaxed text-sm sm:text-base">
                A milestone age deserves more than a text. Build an interactive page with their age on the candles, favourite photos, and music — free in 30 seconds.
              </p>
            </div>
            <Link
              href="/#create"
              className="px-8 py-4 bg-white text-purple-700 font-bold rounded-2xl hover:bg-purple-50 transition-all shadow-lg hover:scale-105 whitespace-nowrap text-base"
            >
              Start Creating Now 🎉
            </Link>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 sm:p-10 border border-purple-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" /> Or Browse by Relationship
            </h2>
            <p className="text-center text-gray-600 text-sm mb-6">Know who it is for but not the vibe? Start here.</p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/wishes/${c.slug}`}
                  className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 text-sm font-semibold hover:bg-purple-600 hover:text-white transition-all"
                >
                  {c.navTitle} Wishes →
                </Link>
              ))}
              <Link
                href="/wishes"
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all"
              >
                All 21 collections →
              </Link>
            </div>
          </section>
        </main>

        <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
          <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
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
