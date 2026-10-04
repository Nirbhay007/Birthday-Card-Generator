import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Crown, Film, ArrowRight, ShieldCheck, Copy, Check, Gift, HelpCircle, Star } from 'lucide-react';
import SupportButton from '@/components/SupportButton';
import WhatsNew from '@/components/WhatsNew';
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday.nirbhay.online';

export const metadata = {
  title: 'Free Anniversary Surprise Maker | Love Letter & Celebration Page | BirthdayGen',
  description: 'Create a personal anniversary surprise website. An envelope that opens, your favorite photos together, promises from the heart, and music. Free to preview.',
  alternates: {
    canonical: '/anniversary',
  },
  openGraph: {
    title: 'Free Anniversary Surprise Maker | BirthdayGen',
    description: 'Create an anniversary surprise website with a personal letter, shared promises, and photos.',
    url: `${baseUrl}/anniversary`,
    siteName: 'BirthdayGen',
    type: 'website',
    images: [{ url: '/api/og?name=Our+Anniversary&theme=royal', width: 1200, height: 630, alt: 'Anniversary Surprise Maker' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Anniversary Surprise Maker | BirthdayGen',
    description: 'Create an anniversary surprise website with a personal letter, shared promises, and photos.',
    images: ['/api/og?name=Our+Anniversary&theme=royal'],
  },
};

const ANNIVERSARY_WISHES = [
  {
    year: '1st Anniversary',
    text: "One full year down, and I still look forward to coming home to you every day. Happy first anniversary. Let's keep building this life together.",
    tag: 'Paper Anniversary'
  },
  {
    year: '5th Anniversary',
    text: "Five years flew by so fast. Thank you for keeping me grounded, laughing with me through the chaos, and being my absolute favorite person. Happy anniversary.",
    tag: 'Wood Anniversary'
  },
  {
    year: '10th Anniversary',
    text: "Ten years together. We built a home, made a million memories, and got through every hard day together. I would choose you all over again. Happy tenth anniversary.",
    tag: 'Tin Anniversary'
  },
  {
    year: '25th Silver Anniversary',
    text: "Twenty-five years of showing up for each other every single day. Thank you for being my rock through everything. Happy 25th anniversary.",
    tag: 'Silver Jubilee'
  },
  {
    year: 'For Husband',
    text: "Happy anniversary to the man who still makes me laugh harder than anyone else. Thank you for your patience, your steady heart, and always being in my corner.",
    tag: 'Husband'
  },
  {
    year: 'For Wife',
    text: "Happy anniversary to the woman who makes our home feel like home. You do so much for us, and I appreciate you more than you know.",
    tag: 'Wife'
  }
];

const FAQS = [
  {
    question: 'How do I create a digital anniversary surprise?',
    answer: 'Add your names, write a short personal note, and upload photos of your favorite memories. You get a private link with an opening envelope, your letter, and music.'
  },
  {
    question: 'Can I preview the anniversary experience before paying?',
    answer: 'Yes. You can preview the full interactive surprise on your screen for free. Once you are happy with how it looks, you can unlock the permanent link for ₹49 ($1).'
  },
  {
    question: 'Does the recipient need to download an app?',
    answer: 'No app needed. It opens right inside WhatsApp, Safari, or Chrome with music and animations ready to play.'
  }
];

export default function AnniversaryPage() {
  const breadcrumbs = getBreadcrumbSchema(baseUrl, [
    { name: 'Home', url: '/' },
    { name: 'Anniversary Surprise', url: '/anniversary' },
  ]);

  const faqSchema = getFAQSchema(FAQS);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-rose-950 via-slate-900 to-purple-950 text-white selection:bg-rose-500 selection:text-white">
        {/* Navigation Bar */}
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center border-b border-rose-500/20 bg-black/40 backdrop-blur-md sticky top-0 z-50">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300 bg-clip-text text-transparent">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> BirthdayGen
          </Link>
          <div className="flex gap-4 sm:gap-6 text-sm font-medium text-gray-300 items-center">
            <Link href="/" className="hover:text-rose-400 transition-colors">Birthday Card</Link>
            <Link href="/wishes" className="hover:text-rose-400 transition-colors">Wishes</Link>
            <Link href="/premium?occasion=anniversary" className="text-rose-400 font-semibold flex items-center gap-1">
              <Crown className="w-4 h-4 text-amber-400" /> Premium Cinema
            </Link>
            <WhatsNew />
          </div>
        </nav>

        {/* Hero Section */}
        <header className="container mx-auto px-4 py-16 text-center max-w-4xl relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Heart className="w-3.5 h-3.5 fill-rose-400" /> Celebrate Your Love Story
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 bg-gradient-to-r from-white via-rose-100 to-amber-200 bg-clip-text text-transparent">
            An Anniversary Surprise They Will Actually Keep
          </h1>
          <p className="text-lg md:text-xl text-rose-100/80 max-w-2xl mx-auto leading-relaxed mb-8">
            A quick WhatsApp text gets lost in the chat. Send something personal they can open, read, and hold onto: a wax-sealed envelope, your favorite photos, and real promises from your heart.
          </p>

          <div className="flex flex-wrap gap-4 justify-center items-center">
            <Link
              href="/premium?occasion=anniversary&for=partner"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 text-white font-extrabold text-base shadow-xl hover:shadow-rose-500/25 transition-all hover:scale-105"
            >
              <Film className="w-5 h-5" /> Create Anniversary Cinema Surprise
            </Link>
            <Link
              href="/#create"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-white/10 hover:bg-white/15 text-gray-200 font-semibold text-sm border border-white/10 transition-all"
            >
              Build Standard Card Free
            </Link>
          </div>
        </header>

        {/* Cinematic Acts Showcase */}
        <main className="container mx-auto px-4 pb-20 max-w-5xl">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Act 1: The Wax-Sealed Letter</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                An envelope with your partner&apos;s name in gold. It breaks open to reveal your personal love letter.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Act 2: Reasons I Love You</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Six honest reasons you love them, plus shared promises and photos from your favorite days together.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Act 3: Starlit Celebration</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Music, starlight, and an interactive celebration screen they will screenshot, replay, and keep.
              </p>
            </div>
          </section>

          {/* Curated Anniversary Wishes Section */}
          <section className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                  <Heart className="w-6 h-6 text-rose-400 fill-rose-400" /> Real Anniversary Messages
                </h2>
                <p className="text-sm text-gray-300 mt-1">
                  Copy any message below or use it directly in your surprise web page.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ANNIVERSARY_WISHES.map((w, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between hover:border-rose-500/40 transition-all">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">{w.year}</span>
                      <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">{w.tag}</span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-200 leading-relaxed italic mb-4">
                      &quot;{w.text}&quot;
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <Link
                      href={`/premium?occasion=anniversary&for=partner`}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      Use in Cinema Surprise →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing & Guarantee Strip */}
          <section className="bg-gradient-to-r from-rose-900/40 via-purple-900/40 to-slate-900/60 border border-rose-500/30 rounded-3xl p-8 sm:p-10 text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Give Them Something Special This Year
            </h2>
            <p className="text-rose-100/80 text-sm sm:text-base max-w-xl mx-auto mb-6">
              Free to customize and preview live. Unlock forever with a permanent link for just <span className="font-bold text-amber-300">₹49 ($1)</span>. No recurring subscriptions.
            </p>
            <Link
              href="/premium?occasion=anniversary&for=partner"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 text-gray-950 font-extrabold text-sm shadow-lg hover:scale-105 transition-all"
            >
              <span>Start Your Free Preview</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </section>

          {/* FAQ Accordion */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-rose-400" /> Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <details
                  key={idx}
                  className="group bg-white/5 p-6 rounded-2xl border border-white/10 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between font-bold text-white text-base">
                    <span>{faq.question}</span>
                    <span className="ml-4 transition group-open:-rotate-180 text-rose-400">▼</span>
                  </summary>
                  <p className="mt-3 text-gray-300 leading-relaxed text-sm">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-black/60 text-gray-400 py-12 border-t border-white/10">
          <div className="container mx-auto px-4 max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <p>© {new Date().getFullYear()} BirthdayGen. Anniversary surprises and interactive celebration cards.</p>
            <div className="flex gap-4">
              <Link href="/" className="hover:text-white transition-colors">Card Generator</Link>
              <Link href="/wishes" className="hover:text-white transition-colors">Wishes Hub</Link>
              <Link href="/premium" className="hover:text-white transition-colors">Premium</Link>
              <SupportButton variant="link" />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
