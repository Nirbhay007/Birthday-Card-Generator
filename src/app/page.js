import React from 'react';
import Link from 'next/link';
import BirthdayGeneratorContainer from '@/components/BirthdayGeneratorContainer';
import MonetizationSlot from '@/components/MonetizationSlot';
import { Sparkles, Heart, Music, Image as ImageIcon, Wind, ShieldCheck, Zap, HelpCircle, ArrowRight, BookOpen } from 'lucide-react';
import { getSoftwareApplicationSchema, getFAQSchema, getHowToSchema } from '@/lib/seo';
import { WISH_CATEGORIES } from '@/lib/wishesData';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday.nirbhay.online';

const FAQS = [
  {
    question: "What is BirthdayGen?",
    answer: "BirthdayGen is a free online tool that lets you generate interactive, personalized digital birthday card microsites featuring custom messages, photo galleries, ambient music, and interactive virtual candle blowing."
  },
  {
    question: "How does the virtual candle blowing work?",
    answer: "Using Web Audio API technology, BirthdayGen accesses the device microphone (with user permission) to detect blowing sounds or air movement, allowing the recipient to blow out virtual birthday candles directly on their screen!"
  },
  {
    question: "Is BirthdayGen free to use?",
    answer: "Yes, BirthdayGen is 100% free with no hidden charges, registration required, or software download needed."
  },
  {
    question: "How long does a created birthday page stay active?",
    answer: "Every generated birthday page receives a unique permanent link that can be shared anytime via WhatsApp, SMS, email, or social media."
  },
  {
    question: "Can I customize the design themes and add photos?",
    answer: "Yes! You can select from 4 beautiful themes (Elegant, Fun & Colorful, Retro Neon, Minimal) and upload personal photo memories to create a custom photo gallery."
  },
  {
    question: "Are user photos and data private?",
    answer: "Absolutely. BirthdayGen stores photo references securely only for your created page. We do not sell user data, run intrusive ads, or track personal identities."
  }
];

export default function Home() {
  const softwareSchema = getSoftwareApplicationSchema(baseUrl);
  const faqSchema = getFAQSchema(FAQS);
  const howToSchema = getHowToSchema(baseUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-900">
        {/* Navigation Header */}
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center border-b border-purple-100/50">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            <span className="text-2xl">🎉</span> BirthdayGen
          </Link>
          <div className="flex gap-4 sm:gap-6 text-sm font-medium text-gray-600 items-center">
            <a href="#how-it-works" className="hover:text-purple-600 transition-colors hidden sm:inline">How It Works</a>
            <a href="#features" className="hover:text-purple-600 transition-colors hidden sm:inline">Features</a>
            <Link href="/wishes" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Wishes Hub
            </Link>
            <a href="#faqs" className="hover:text-purple-600 transition-colors">FAQs</a>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12">
          <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-white rounded-full shadow-sm border border-purple-100 mb-6">
              <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">
                #1 Free Interactive Birthday Microsite Maker
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
              Create the <span className="text-purple-600">Perfect</span><br />
              Personalized Birthday Surprise
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Design a beautiful, interactive digital birthday card in seconds.
              Add custom photos, personal messages, background music, and let them blow out real virtual candles!
            </p>
          </header>

          {/* Interactive Generator Container */}
          <section id="create" className="mb-20">
            <BirthdayGeneratorContainer />
          </section>

          {/* AI Search Summary Block (Search Everywhere / GEO Optimization) */}
          <section className="max-w-4xl mx-auto my-16 bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-purple-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-600" />
              What is BirthdayGen? (Quick Summary)
            </h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>BirthdayGen</strong> is a free, web-based digital birthday card generator that turns standard birthday greetings into interactive web experiences. Unlike traditional static e-cards, BirthdayGen microsites offer <strong>real-time microphone virtual candle blowing</strong>, custom memory photo carousels, responsive theme switching, and background birthday song audio playback—accessible instantly on mobile and desktop without app downloads.
            </p>
          </section>

          {/* Features Grid */}
          <section id="features" className="max-w-6xl mx-auto my-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Choose BirthdayGen Interactive Cards?</h2>
              <p className="text-gray-600 max-w-xl mx-auto">Packed with modern features designed to make birthdays unforgettable.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <Wind className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Virtual Candle Blowing</h3>
                <p className="text-sm text-gray-600">Mic-activated candle blowing brings real birthday magic directly to any device screen.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <ImageIcon className="w-10 h-10 text-pink-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Photo Memory Gallery</h3>
                <p className="text-sm text-gray-600">Upload cherished memories into an interactive full-screen photo slideshow.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <Music className="w-10 h-10 text-indigo-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Ambient Music Playback</h3>
                <p className="text-sm text-gray-600">Includes celebratory audio themes that welcome the birthday recipient with warmth.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <Heart className="w-10 h-10 text-rose-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Personalized Messages</h3>
                <p className="text-sm text-gray-600">Express your love with custom heartfelt text, quotes, or funny birthday memories.</p>
              </div>
            </div>
          </section>

          {/* Step-by-Step Guide Section */}
          <section id="how-it-works" className="max-w-4xl mx-auto my-20 bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">How to Create Your Birthday Page in 3 Easy Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">1</div>
                <h3 className="font-bold text-gray-900 mb-2">Enter Details</h3>
                <p className="text-sm text-gray-600">Add the recipient's name, birthday date, and your personalized greeting message.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">2</div>
                <h3 className="font-bold text-gray-900 mb-2">Upload & Style</h3>
                <p className="text-sm text-gray-600">Select a design theme (Elegant, Fun, Retro, Minimal) and attach favorite photos.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">3</div>
                <h3 className="font-bold text-gray-900 mb-2">Share the Link</h3>
                <p className="text-sm text-gray-600">Click generate to receive an instant, shareable URL to send via WhatsApp or social media.</p>
              </div>
            </div>
          </section>

          {/* Comparison Matrix Table (SEO & Information Gain) */}
          <section className="max-w-4xl mx-auto my-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Birthday Cards Comparison</h2>
            <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-purple-50 text-purple-900 border-b border-gray-200">
                    <th className="p-4 font-bold">Feature</th>
                    <th className="p-4 font-bold">BirthdayGen Microsite</th>
                    <th className="p-4 font-bold">Standard E-Card (PDF/JPG)</th>
                    <th className="p-4 font-bold">Paper Greeting Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  <tr>
                    <td className="p-4 font-semibold">Interactive Candle Blowing</td>
                    <td className="p-4 text-green-600 font-bold">Yes (Mic Activated)</td>
                    <td className="p-4 text-red-500">No</td>
                    <td className="p-4 text-red-500">No</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Photo Memories Album</td>
                    <td className="p-4 text-green-600 font-bold">Yes (Multi-Photo)</td>
                    <td className="p-4 text-gray-500">Static single image</td>
                    <td className="p-4 text-gray-500">Static printed photo</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Background Music</td>
                    <td className="p-4 text-green-600 font-bold">Yes</td>
                    <td className="p-4 text-red-500">No</td>
                    <td className="p-4 text-red-500">No</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Cost & Delivery</td>
                    <td className="p-4 text-green-600 font-bold">100% Free / Instant</td>
                    <td className="p-4 text-gray-600">Free or Subscription</td>
                    <td className="p-4 text-gray-600">$5–$10 + Shipping</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SEO Internal Linking: Curated Birthday Wishes Library Showcase */}
          <section className="max-w-6xl mx-auto my-20 bg-white p-8 sm:p-12 rounded-3xl border border-purple-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  Topical Resource Hub
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">
                  Browse Birthday Wishes & Message Inspiration
                </h2>
                <p className="text-gray-600 mt-1 max-w-xl">
                  Looking for the right words? Explore our handpicked messages and instantly use them in your custom interactive card.
                </p>
              </div>
              <Link
                href="/wishes"
                className="inline-flex items-center gap-1 text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors shrink-0"
              >
                <span>View Full Library</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {WISH_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/wishes/${cat.slug}`}
                  className="p-5 rounded-2xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50/40 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-1 text-base">
                      {cat.navTitle} Wishes
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {cat.shortDescription}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold text-purple-600">
                    <span>{cat.wishes.length}+ Quotes</span>
                    <span className="group-hover:translate-x-1 transition-transform">Read wishes →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQs Section */}
          <section id="faqs" className="max-w-4xl mx-auto my-20">
            <div className="text-center mb-10">
              <HelpCircle className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <details key={idx} className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between font-bold text-gray-900 text-lg">
                    <span>{faq.question}</span>
                    <span className="ml-4 transition group-open:-rotate-180 text-purple-600">▼</span>
                  </summary>
                  <p className="mt-4 text-gray-600 leading-relaxed text-base">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CLS-safe non-intrusive monetization slot (inactive by default) */}
          <div className="max-w-4xl mx-auto">
            <MonetizationSlot slotId="home-footer" />
          </div>

          {/* E-E-A-T Trust & Editorial Note */}
          <section className="max-w-4xl mx-auto my-20 bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-purple-100 text-center">
            <ShieldCheck className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Built with Privacy & Joy in Mind</h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
              BirthdayGen is created by web experience specialists dedicated to replacing generic greetings with meaningful digital moments. All generated pages use HTTPS encryption, and photo uploads are handled with standard web security best practices.
            </p>
          </section>
        </div>

        {/* Semantic Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-1">
                <Link href="/" className="text-xl font-bold text-white mb-3 inline-block">🎉 BirthdayGen</Link>
                <p className="text-sm text-gray-400">
                  The ultimate free interactive birthday card microsite generator with photo galleries, music, and mic candle blowing.
                </p>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-3">Quick Navigation</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#create" className="hover:text-white transition-colors">Create Birthday Card</a></li>
                  <li><Link href="/wishes" className="hover:text-white transition-colors">Birthday Wishes Hub</Link></li>
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Key Features</a></li>
                  <li><a href="#faqs" className="hover:text-white transition-colors">FAQs</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-3">Popular Wishes</h3>
                <ul className="space-y-2 text-sm">
                  {WISH_CATEGORIES.slice(0, 4).map((c) => (
                    <li key={c.slug}>
                      <Link href={`/wishes/${c.slug}`} className="hover:text-white transition-colors">
                        {c.navTitle} Wishes
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-3">Trust & Transparency</h3>
                <p className="text-sm text-gray-400 mb-2">Free to use forever. No signup required.</p>
                <p className="text-xs text-gray-500">© {new Date().getFullYear()} BirthdayGen. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
