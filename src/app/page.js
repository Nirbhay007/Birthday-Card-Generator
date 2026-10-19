import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BirthdayGeneratorContainer from '@/components/BirthdayGeneratorContainer';
import CelebrationBackground from '@/components/CelebrationBackground';
import MonetizationSlot from '@/components/MonetizationSlot';
import CinemaShowcase from '@/components/premium/CinemaShowcase';
import SiteNav from '@/components/site/SiteNav';
import SiteFooter from '@/components/site/SiteFooter';
import HeroPreview from '@/components/site/HeroPreview';
import JourneyPin from '@/components/site/JourneyPin';
import ThemesRail from '@/components/site/ThemesRail';
import {
  Sparkles, Heart, Music, Mic, Timer, Wind, Smartphone, Crown,
  ShieldCheck, Zap, HelpCircle, ArrowRight, BookOpen, Gift, ChevronDown, Check,
} from 'lucide-react';
import { getSoftwareApplicationSchema, getFAQSchema, getHowToSchema, getVideoObjectSchema, serializeJsonLd } from '@/lib/seo';
import { WISH_CATEGORIES } from '@/lib/wishesData';
import { getAllAgePages } from '@/lib/ageWishesData';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday.nirbhay.online';

const FAQS = [
  {
    question: "What is BirthdayGen?",
    answer: "BirthdayGen is a free birthday website maker. It lets you generate an interactive, personalized birthday website with a gift reveal, custom messages, photo galleries, music and mic-powered virtual candle blowing. Shareable on WhatsApp in one tap with no signup needed."
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
    answer: "Every generated birthday page stays active for 30 days, plenty of time to celebrate and share it anywhere. Want it kept longer? Tick the free annual reminder while creating, and we'll keep your page alive for next year's birthday too."
  },
  {
    question: "Can I customize the design themes and add photos?",
    answer: "Yes! You can select from 8 beautiful free themes (Elegant, Fun & Colorful, Royal Gold, Midnight Stars, Princess, Unicorn Kids, Retro Neon, Minimal) and upload personal photo memories to create a custom photo gallery."
  },
  {
    question: "Can I make a birthday website for free?",
    answer: "Yes. Every BirthdayGen birthday website is free: pick a theme, add the name, message and photos, choose music, and share the link. Premium cinematic universes with sealed letters and extra acts start at ₹49."
  },
  {
    question: "Birthday website or birthday card: which is better?",
    answer: "A card is read once; a birthday website is an experience. Your link opens a gift reveal, blowable candles, a photo gallery and your message, replayable for years. If you only need words, start from our free birthday wishes collection."
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
  const videoSchema = getVideoObjectSchema(baseUrl);
  const agePages = getAllAgePages();
  const wishCount = WISH_CATEGORIES.reduce((n, c) => n + c.wishes.length, 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(howToSchema) }}
      />
      {videoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(videoSchema) }}
        />
      )}

      <SiteNav />

      <main className="bg-paper text-ink">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px]" aria-hidden="true">
            <CelebrationBackground theme="fun" density="light" />
          </div>

          <div className="relative mx-auto grid max-w-6xl gap-16 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-ink/[0.06] bg-white px-4 py-2 text-xs font-semibold text-ink/70 shadow-soft">
                <Sparkles className="h-3.5 w-3.5 text-brand-600" strokeWidth={1.75} />
                Free · No signup · Ready in 30 seconds
              </span>

              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
                Create a free <span className="text-brand-600">birthday website</span> they&apos;ll never forget
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                Their name, your words, favourite photos and music — plus candles they
                really blow out. One link, ready in thirty seconds.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#create"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-brand-700"
                >
                  <Gift className="h-4 w-4" strokeWidth={1.75} />
                  Create a free card
                </a>
                <Link
                  href="/wishes"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/10 bg-white px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand-300 hover:text-brand-700"
                >
                  <BookOpen className="h-4 w-4" strokeWidth={1.75} />
                  Browse {wishCount}+ wish ideas
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5 text-brand-600" strokeWidth={1.75} /> 30-sec setup
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Wind className="h-3.5 w-3.5 text-brand-600" strokeWidth={1.75} /> Mic candle blow
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-brand-600" strokeWidth={1.75} /> WhatsApp-ready
                </span>
              </div>
            </div>

            <HeroPreview />
          </div>
        </section>

        {/* ── How it works: sticky three-scene story ──────────────────── */}
        <JourneyPin />

        {/* ── The generator ─────────────────────────────────────────────── */}
        <section id="create" className="scroll-mt-20 py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Start the surprise</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                Fill three fields and watch the card build itself in the live preview.
              </p>
            </div>
            <BirthdayGeneratorContainer />
          </div>
        </section>

        {/* ── Themes rail (real theme engine previews) ─────────────────── */}
        <ThemesRail />

        {/* ── Premium showcase ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <CinemaShowcase />
        </div>

        {/* ── Features bento ───────────────────────────────────────────── */}
        <section id="features" className="scroll-mt-20 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              More than a card. A whole birthday world.
            </h2>

            <div className="mt-10 grid gap-4 lg:grid-cols-6">
              {/* Mic candles — dark hero cell */}
              <div className="rounded-3xl bg-ink p-8 text-white lg:col-span-4">
                <Mic className="h-6 w-6 text-brand-300" strokeWidth={1.75} />
                <h3 className="mt-4 font-display text-xl font-extrabold tracking-tight">Mic-powered candle blowing</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">
                  They blow into the phone and the flames go out — real breath, real confetti.
                  Powered by the Web Audio API, no app needed.
                </p>
                <div className="mt-7 flex gap-5" aria-hidden="true">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="flame-flicker h-7 w-3.5 rounded-full bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-200"
                      style={{ animationDelay: `${i * 0.22}s` }}
                    />
                  ))}
                </div>
              </div>

              {/* Photo memories */}
              <div className="overflow-hidden rounded-3xl border border-ink/[0.06] bg-white lg:col-span-2">
                <Image
                  src="/sample-memory.jpg"
                  alt="A favourite memory inside the photo gallery"
                  width={480}
                  height={280}
                  className="h-36 w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="font-display text-base font-extrabold tracking-tight">Photo memory gallery</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    Cherished photos in a full-screen slideshow they keep coming back to.
                  </p>
                </div>
              </div>

              {/* Music */}
              <div className="rounded-3xl border border-ink/[0.06] bg-white p-6 lg:col-span-2">
                <Music className="h-5 w-5 text-brand-600" strokeWidth={1.75} />
                <h3 className="mt-3 font-display text-base font-extrabold tracking-tight">A birthday soundtrack</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  Background music that welcomes them the moment the link opens.
                </p>
                <div className="mt-5 flex h-9 items-end gap-1.5" aria-hidden="true">
                  {[0.9, 0.5, 1, 0.35, 0.75, 1, 0.45, 0.85, 0.3, 0.7].map((h, i) => (
                    <span
                      key={i}
                      className="eq-bar w-1.5 rounded-full bg-brand-400"
                      style={{ height: `${h * 100}%`, animationDelay: `${i * 0.09}s` }}
                    />
                  ))}
                </div>
              </div>

              {/* WhatsApp */}
              <div className="rounded-3xl border border-ink/[0.06] bg-white p-6 lg:col-span-2">
                <Smartphone className="h-5 w-5 text-brand-600" strokeWidth={1.75} />
                <h3 className="mt-3 font-display text-base font-extrabold tracking-tight">One-tap WhatsApp share</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  Copy the link, drop it in the family group, watch the reactions land.
                </p>
              </div>

              {/* VIP keepsake */}
              <div className="rounded-3xl border border-gold/40 bg-gold-soft p-6 lg:col-span-2">
                <Crown className="h-5 w-5 text-amber-700" strokeWidth={1.75} />
                <h3 className="mt-3 font-display text-base font-extrabold tracking-tight">VIP keepsake export</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-amber-900/70">
                  Premium universes add sealed letters and a cinematic keepsake to save forever.
                </p>
                <Link href="/premium" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900">
                  See premium <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Wish library (SEO hub) ───────────────────────────────────── */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Wish library</span>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="max-w-xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Never stare at a blank message box again
              </h2>
              <Link href="/wishes" className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-800">
                View full library <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            </div>

            <div className="mt-10 grid gap-x-10 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
              {WISH_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/wishes/${cat.slug}`}
                  className="group flex items-baseline justify-between gap-4 border-b border-ink/[0.06] py-5 transition-colors hover:border-brand-300"
                >
                  <div>
                    <h3 className="font-display text-base font-bold tracking-tight text-ink group-hover:text-brand-700">
                      {cat.navTitle} wishes
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-muted">{cat.shortDescription}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-muted group-hover:text-brand-600">
                    {cat.wishes.length}+ →
                  </span>
                </Link>
              ))}
            </div>

            {/* Milestone-age strip */}
            <div className="mt-16">
              <h3 className="font-display text-xl font-extrabold tracking-tight">Wishes by milestone age</h3>
              <p className="mt-2 text-sm text-muted">Sweet 16 to golden 50th. Words written for the exact moment.</p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {agePages.map((a) => (
                  <Link
                    key={a.age}
                    href={`/ages/${a.age}`}
                    className="flex flex-col items-center rounded-2xl border border-ink/[0.06] bg-white px-4 py-2.5 leading-tight shadow-soft transition-colors hover:border-brand-300"
                  >
                    <span className="font-display text-lg font-extrabold">{a.age}</span>
                    <span className="text-[11px] font-semibold text-muted">{a.navTitle} birthday</span>
                  </Link>
                ))}
                <Link
                  href="/ages"
                  className="flex items-center rounded-2xl bg-ink px-5 py-2.5 font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  All ages →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Comparison ───────────────────────────────────────────────── */}
        <section className="pb-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-center font-display text-3xl font-extrabold tracking-tight">Birthday cards compared</h2>
            <div className="mt-8 overflow-x-auto rounded-3xl border border-ink/[0.06] bg-white shadow-soft">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/[0.06] bg-ink/[0.02] text-xs uppercase tracking-wider text-ink/50">
                    <th className="p-4 font-bold">Feature</th>
                    <th className="p-4 font-bold">BirthdayGen website</th>
                    <th className="p-4 font-bold">Standard e-card</th>
                    <th className="p-4 font-bold">Paper card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/[0.05]">
                  <tr>
                    <td className="p-4 font-semibold">Interactive candle blowing</td>
                    <td className="p-4 font-semibold text-ink">
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-brand-600" strokeWidth={1.75} />
                        Yes (mic activated)
                      </span>
                    </td>
                    <td className="p-4 text-muted">No</td>
                    <td className="p-4 text-muted">No</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Photo memories album</td>
                    <td className="p-4 font-semibold text-ink">
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-brand-600" strokeWidth={1.75} />
                        Yes (multi-photo)
                      </span>
                    </td>
                    <td className="p-4 text-muted">Static single image</td>
                    <td className="p-4 text-muted">Static printed photo</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Background music</td>
                    <td className="p-4 font-semibold text-ink">
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-brand-600" strokeWidth={1.75} />
                        Yes
                      </span>
                    </td>
                    <td className="p-4 text-muted">No</td>
                    <td className="p-4 text-muted">No</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Cost &amp; delivery</td>
                    <td className="p-4 font-semibold text-ink">
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-brand-600" strokeWidth={1.75} />
                        100% free / instant
                      </span>
                    </td>
                    <td className="p-4 text-muted">Free or subscription</td>
                    <td className="p-4 text-muted">$5–$10 + shipping</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Quick summary (GEO) + trust ──────────────────────────────── */}
        <section className="pb-20">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:px-6 lg:grid-cols-5">
            <div className="rounded-3xl border border-ink/[0.06] bg-white p-8 lg:col-span-3">
              <h2 className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
                <Zap className="h-5 w-5 text-brand-600" strokeWidth={1.75} />
                What is BirthdayGen? (Quick Summary)
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                <strong className="text-ink">BirthdayGen</strong> is a free, web-based birthday website generator that turns
                standard greetings into interactive celebrations. Unlike traditional static e-cards, BirthdayGen websites
                offer <strong className="text-ink">real-time microphone virtual candle blowing</strong>, custom memory photo
                carousels, responsive theme switching, and background birthday song audio playback, accessible instantly on
                mobile and desktop without app downloads.
              </p>
            </div>
            <div className="rounded-3xl border border-brand-100 bg-brand-50/70 p-8 lg:col-span-2">
              <h2 className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
                <ShieldCheck className="h-5 w-5 text-brand-600" strokeWidth={1.75} />
                Built with privacy & joy in mind
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Created by web experience specialists dedicated to replacing generic greetings with meaningful digital
                moments. Every page runs over HTTPS, uploads use standard web security best practices, and we never sell
                your data.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQs ─────────────────────────────────────────────────────── */}
        <section id="faqs" className="scroll-mt-20 pb-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <HelpCircle className="mx-auto h-8 w-8 text-brand-600" strokeWidth={1.75} />
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight">Frequently asked questions</h2>
            </div>
            <div className="mt-10 border-t border-ink/[0.06]">
              {FAQS.map((faq, idx) => (
                <details key={idx} className="group border-b border-ink/[0.06] py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-bold tracking-tight text-ink [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-brand-600 transition-transform group-open:rotate-180" strokeWidth={1.75} />
                  </summary>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center text-white sm:px-12">
            <div
              className="pointer-events-none absolute -top-28 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand-600/25 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
                Make their next birthday unforgettable
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/60">
                Free to build, ready in thirty seconds, made to be opened on WhatsApp.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="#create"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
                >
                  <Gift className="h-4 w-4" strokeWidth={1.75} />
                  Create a free card
                </a>
                <Link
                  href="/premium"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/50"
                >
                  See cinematic premium
                </Link>
              </div>
              <p className="mt-7 text-xs text-white/40">
                Anniversary coming up too?{' '}
                <a href="https://invite.nirbhay.online/" target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-white/70">
                  Make an anniversary card →
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* CLS-safe non-intrusive monetization slot (inactive by default) */}
        <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
          <MonetizationSlot slotId="home-footer" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <p className="flex items-center justify-center gap-2 text-center text-xs text-muted">
            <Heart className="h-3.5 w-3.5 text-brand-600" strokeWidth={1.75} />
            Every card is free forever. Premium universes are optional.
          </p>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
