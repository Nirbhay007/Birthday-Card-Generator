import React from 'react';
import Link from 'next/link';
import BirthdayGeneratorContainer from '@/components/BirthdayGeneratorContainer';
import CelebrationBackground from '@/components/CelebrationBackground';
import MonetizationSlot from '@/components/MonetizationSlot';
import SupportButton from '@/components/SupportButton';
import WhatsNew from '@/components/WhatsNew';
import { Sparkles, Heart, Music, Image as ImageIcon, Wind, ShieldCheck, Zap, HelpCircle, ArrowRight, BookOpen, Gift, PartyPopper, Timer } from 'lucide-react';
import { getSoftwareApplicationSchema, getFAQSchema, getHowToSchema } from '@/lib/seo';
import { WISH_CATEGORIES } from '@/lib/wishesData';
import { getAllAgePages } from '@/lib/ageWishesData';

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
    answer: "Every generated birthday page stays active for 30 days — plenty of time to celebrate and share it anywhere. Want it kept longer? Tick the free annual reminder while creating, and we'll keep your page alive for next year's birthday too."
  },
  {
    question: "Can I customize the design themes and add photos?",
    answer: "Yes! You can select from 8 beautiful free themes (Elegant, Fun & Colorful, Royal Gold, Midnight Stars, Princess, Unicorn Kids, Retro Neon, Minimal) and upload personal photo memories to create a custom photo gallery."
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
  const agePages = getAllAgePages();

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

      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-900 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[560px] pointer-events-none" aria-hidden="true">
          <CelebrationBackground theme="fun" density="light" />
        </div>
        {/* Navigation Header */}
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center border-b border-purple-100/50 relative z-10">
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
            <WhatsNew />
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12 relative z-10">
          <header className="text-center mb-10">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-white rounded-full shadow-sm border border-purple-100 mb-6">
              <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">
                Free • No signup • Ready in 30 seconds
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
              Send a <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500">Personalized Birthday Card</span><br />
              They&apos;ll Never Forget
            </h1>
            <p className="text-base sm:text-lg font-bold text-gray-700 mb-4">
              They tap a gift 🎁 → candles flicker → they blow → happy tears 🥹
            </p>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Design a free interactive birthday card in seconds — their name, your message,
              favorite photos, music and real mic-powered candle blowing, shareable on WhatsApp in one tap.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="#create" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <Gift className="w-5 h-5" /> Create a surprise — it&apos;s free
              </a>
              <Link href="/wishes" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white border border-purple-200 text-purple-700 font-bold shadow-sm hover:bg-purple-50 transition-all">
                <BookOpen className="w-4 h-4" /> Steal a perfect message
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-gray-600">
              <span className="inline-flex items-center gap-1 bg-white/80 border border-purple-100 rounded-full px-3 py-1.5"><Timer className="w-3.5 h-3.5 text-purple-600" /> 30-sec setup</span>
              <span className="inline-flex items-center gap-1 bg-white/80 border border-purple-100 rounded-full px-3 py-1.5"><PartyPopper className="w-3.5 h-3.5 text-pink-600" /> 8 free themes</span>
              <span className="inline-flex items-center gap-1 bg-white/80 border border-purple-100 rounded-full px-3 py-1.5"><Wind className="w-3.5 h-3.5 text-indigo-600" /> Mic candle blow</span>
              <span className="inline-flex items-center gap-1 bg-white/80 border border-purple-100 rounded-full px-3 py-1.5"><Heart className="w-3.5 h-3.5 text-rose-600" /> WhatsApp-ready</span>
            </div>
          </header>

          {/* Recipient journey strip */}
          <div className="max-w-4xl mx-auto mb-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            {[
              { emoji: '🎁', title: 'They tap the gift', desc: 'Gift-box reveal + confetti explosion' },
              { emoji: '🎂', title: 'They blow candles', desc: 'Mic magic + fireworks + wish made' },
              { emoji: '📸', title: 'They feel the love', desc: 'Photos, words from you, Send-love hearts' },
            ].map((s) => (
              <div key={s.title} className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl px-4 py-4 shadow-sm">
                <div className="text-3xl mb-1">{s.emoji}</div>
                <p className="font-bold text-gray-900 text-sm">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Interactive Generator Container */}
          <section id="create" className="mb-14 scroll-mt-20">
            <BirthdayGeneratorContainer />
          </section>

          {/* Theme showcase */}
          <section className="max-w-6xl mx-auto mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Pick a vibe — all 8 themes free</h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Every theme has its own colors, fonts and party background. Midnight sparkles, Royal shines, Unicorn plays.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Royal Gold 👑', bg: '#1a0f2e', accent: '#f5c518', desc: 'Luxury & drama' },
                { name: 'Midnight Stars', bg: '#0b1026', accent: '#818cf8', desc: 'Dreamy night' },
                { name: 'Princess 💖', bg: '#fff5f7', accent: '#ec4899', desc: 'Soft fairytale' },
                { name: 'Unicorn 🦄', bg: '#f5f3ff', accent: '#8b5cf6', desc: 'Kids party' },
                { name: 'Fun & Colorful', bg: '#fff0f5', accent: '#ff69b4', desc: 'Confetti pop' },
                { name: 'Elegant', bg: '#fdfbf7', accent: '#d4af37', desc: 'Timeless gold' },
                { name: 'Retro Neon', bg: '#2b2b2b', accent: '#00ff00', desc: 'Arcade cool' },
                { name: 'Minimal', bg: '#ffffff', accent: '#111827', desc: 'Clean & calm' },
              ].map((t) => (
                <div key={t.name} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow text-left">
                  <div className="h-16 rounded-xl mb-3 flex items-center justify-center text-2xl" style={{ backgroundColor: t.bg }}>
                    <span className="w-6 h-6 rounded-full border border-black/10 inline-block" style={{ backgroundColor: t.accent }} />
                  </div>
                  <p className="font-bold text-sm text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Milestone-age strip (internal linking to /ages programmatic hub) */}
          <section className="max-w-6xl mx-auto mb-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Wishes by Milestone Age</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-6">Sweet 16 to golden 50th — words written for the exact moment.</p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {agePages.map((a) => (
                <Link
                  key={a.age}
                  href={`/ages/${a.age}`}
                  className="px-4 py-2 rounded-2xl bg-white border border-purple-100 shadow-sm hover:border-purple-400 hover:shadow-md transition-all flex flex-col items-center leading-tight"
                >
                  <span className="font-extrabold text-gray-900 text-lg">{a.age}</span>
                  <span className="font-semibold text-gray-500 text-[11px]">{a.navTitle} birthday</span>
                </Link>
              ))}
              <Link
                href="/ages"
                className="px-4 py-2.5 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all"
              >
                All ages →
              </Link>
            </div>
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
                <p className="text-sm text-gray-600">Pick from 8 free themes (Royal, Midnight, Princess, Unicorn + more) and attach favorite photos.</p>
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

          {/* Sister product: anniversary cards (same audience, adjacent intent) */}
          <section className="max-w-6xl mx-auto my-20 bg-gradient-to-br from-rose-50 via-amber-50 to-rose-50 p-8 sm:p-12 rounded-3xl border border-rose-200/70 shadow-sm text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-rose-700 bg-white/70 border border-rose-200 px-3 py-1 rounded-full mb-3">
                💍 From the same makers
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Anniversary coming up too?</h2>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Birthdays aren&apos;t the only milestone. Build a cinematic anniversary invitation with
                couple photos, romantic music, galleries, and venue maps — free, same 30-second magic.
              </p>
            </div>
            <a
              href="https://invite.nirbhay.online/"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg hover:scale-105 whitespace-nowrap text-base"
            >
              <span>Make an anniversary card</span>
              <ArrowRight className="w-4 h-4" />
            </a>
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
                  <li><Link href="/ages" className="hover:text-white transition-colors">Wishes by Age</Link></li>
                  <li><a href="https://invite.nirbhay.online/" target="_blank" rel="noopener" className="hover:text-white transition-colors">Anniversary Cards 💍</a></li>
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
                <p className="text-sm text-gray-400 mb-2"><SupportButton variant="link" /></p>
                <p className="text-xs text-gray-500">© {new Date().getFullYear()} BirthdayGen. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
