import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Laugh, Users, Award, MessageCircle, ArrowRight, CheckCircle, Gift } from 'lucide-react';
import { getAllCategories } from '@/lib/wishesData';
import { getBreadcrumbSchema } from '@/lib/seo';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday.nirbhay.online';

export const metadata = {
  title: 'Birthday Wishes, Quotes & Greetings Library | BirthdayGen',
  description: 'Explore 100+ curated birthday wishes for best friends, lovers, family, and milestones. Copy quotes or instantly generate an interactive birthday card with virtual candles!',
  alternates: {
    canonical: '/wishes',
  },
  openGraph: {
    title: 'Birthday Wishes & Message Library | BirthdayGen',
    description: 'Find the perfect birthday message and convert it into a personalized interactive birthday web page with virtual candles and music.',
    url: `${baseUrl}/wishes`,
    siteName: 'BirthdayGen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Birthday Wishes & Message Library | BirthdayGen',
    description: 'Find the perfect birthday message and convert it into a personalized interactive birthday web page.',
  },
};

const CATEGORY_ICONS = {
  'best-friend': Users,
  'funny': Laugh,
  'romantic': Heart,
  'family': Heart,
  'milestones': Award,
  'short-sweet': MessageCircle,
};

export default function WishesIndexPage() {
  const categories = getAllCategories();

  const breadcrumbs = getBreadcrumbSchema(baseUrl, [
    { name: 'Home', url: '/' },
    { name: 'Birthday Wishes Library', url: '/wishes' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-900">
        {/* Navigation Bar */}
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center border-b border-purple-100/60 bg-white/70 backdrop-blur-md sticky top-0 z-50">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            <span className="text-2xl">🎉</span> BirthdayGen
          </Link>
          <div className="flex gap-4 sm:gap-6 text-sm font-medium text-gray-600 items-center">
            <Link href="/" className="hover:text-purple-600 transition-colors">Card Generator</Link>
            <Link href="/wishes" className="text-purple-600 font-semibold">Wishes Hub</Link>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="container mx-auto px-4 py-12 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4" /> Curated Birthday Wishes & Greetings Library
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Find the <span className="text-purple-600">Perfect Words</span> for Every Birthday
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Never struggle with writer's block again. Browse hundreds of curated birthday wishes, copy your favorites, or turn any message into an interactive digital card with virtual candles in one click.
          </p>
        </header>

        {/* Category Grid */}
        <main className="container mx-auto px-4 pb-20 max-w-6xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-600" /> Browse by Relationship & Theme
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {categories.map((category) => {
              const IconComponent = CATEGORY_ICONS[category.slug] || Sparkles;

              return (
                <div
                  key={category.slug}
                  className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {category.navTitle}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">
                      {category.shortDescription}
                    </p>
                  </div>

                  <div>
                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                        {category.wishes.length}+ Curated Wishes
                      </span>
                      <Link
                        href={`/wishes/${category.slug}`}
                        className="inline-flex items-center text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors group-hover:translate-x-1"
                      >
                        Explore <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Featured Highlight: Transform any wish into a card */}
          <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-3xl p-8 sm:p-12 shadow-xl mb-16 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl font-extrabold mb-3">Turn Any Wish Into An Interactive Surprise</h2>
              <p className="text-purple-100 leading-relaxed text-sm sm:text-base">
                Don't just text a message. Turn your heartfelt wish into a full web page with interactive virtual candles the recipient can blow out using their device microphone!
              </p>
            </div>
            <Link
              href="/#create"
              className="px-8 py-4 bg-white text-purple-700 font-bold rounded-2xl hover:bg-purple-50 transition-all shadow-lg hover:scale-105 whitespace-nowrap text-base"
            >
              Start Creating Now 🎉
            </Link>
          </section>

          {/* Why BirthdayGen Section */}
          <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 sm:p-10 border border-purple-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              How to Write the Most Memorable Birthday Message
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-4 items-start">
                <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Make It Personal</h3>
                  <p className="text-sm text-gray-600">Recall a specific funny moment, inside joke, or milestone you shared together this past year.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Wish For Their Future</h3>
                  <p className="text-sm text-gray-600">Express enthusiasm and excitement for their dreams, goals, career, and adventures in the year ahead.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Pair With Photos & Music</h3>
                  <p className="text-sm text-gray-600">A visual keepsake lasts much longer than a fleeting text message. Add cherished photos in our card maker.</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <Link href="/" className="text-xl font-bold text-white mb-3 inline-block">🎉 BirthdayGen</Link>
                <p className="text-sm text-gray-400">
                  The #1 free interactive birthday card and wishes generator.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-3">Wishes by Category</h4>
                <ul className="space-y-2 text-sm">
                  {categories.map(c => (
                    <li key={c.slug}>
                      <Link href={`/wishes/${c.slug}`} className="hover:text-white transition-colors">
                        {c.navTitle} Wishes
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-3">About BirthdayGen</h4>
                <p className="text-sm text-gray-400 mb-2">Free online greeting card & microsite generator.</p>
                <p className="text-xs text-gray-500">© {new Date().getFullYear()} BirthdayGen. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
