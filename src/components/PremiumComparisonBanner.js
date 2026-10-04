import React from 'react';
import Link from 'next/link';
import { Sparkles, Check, X, Crown, Film, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export default function PremiumComparisonBanner({ relationship = 'friend', title = 'Make Their Birthday Unforgettable' }) {
  const relParam = relationship ? relationship.toLowerCase().replace(/[^a-z]/g, '') : 'friend';
  const premiumLink = `/premium?for=${encodeURIComponent(relParam)}&mode=cinema`;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-slate-900 to-purple-950 text-white p-6 sm:p-10 border border-purple-500/30 shadow-2xl my-12">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          Cinema Upgrade: ₹49 ($0.59)
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-100 to-amber-200 bg-clip-text text-transparent mb-3">
          {title}
        </h2>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          Most text messages get buried in the chat within an hour. Make something they will actually keep: a wax-sealed letter, your favorite photos together, and a starlit celebration screen.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-8 text-sm">
        {/* Free Plan */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-base text-gray-200">Standard Free Card</span>
              <span className="text-xs bg-white/10 text-gray-300 px-2.5 py-1 rounded-full font-medium">Free Forever</span>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Personalized birthday message</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Interactive virtual candles with mic blow</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Up to 3 photo memories</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <X className="w-4 h-4 text-gray-500 shrink-0" />
                <span>No opening envelope or letter</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <X className="w-4 h-4 text-gray-500 shrink-0" />
                <span>Standard music playback</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <X className="w-4 h-4 text-gray-500 shrink-0" />
                <span>Standard card expiry</span>
              </li>
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <Link
              href="/#create"
              className="block w-full text-center py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 font-semibold text-xs transition-all"
            >
              Build Free Card
            </Link>
          </div>
        </div>

        {/* Premium Cinema Plan */}
        <div className="bg-gradient-to-b from-purple-900/60 to-slate-900/90 border-2 border-amber-400/40 rounded-2xl p-6 backdrop-blur-md relative shadow-xl flex flex-col justify-between">
          <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-md">
            RECOMMENDED
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-base text-amber-300 flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" /> Cinema Experience
              </span>
              <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full font-bold">
                ₹49 / $0.59
              </span>
            </div>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-medium text-white">Wax-sealed envelope and personal letter</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-medium text-white">Three story acts with promises you choose</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-medium text-white">Full-screen candle blowing and fireworks</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Unlimited starlit photo memory gallery</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Studio background soundtrack</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-amber-200 font-semibold">Permanent link. Replay anytime.</span>
              </li>
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-amber-400/20">
            <Link
              href={premiumLink}
              className="group flex items-center justify-center gap-2 w-full text-center py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-gray-950 font-extrabold text-sm shadow-lg hover:shadow-amber-400/25 transition-all hover:scale-[1.02]"
            >
              <span>Preview Cinema Surprise Free</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Trust & Guarantee Footer */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 border-t border-white/10 pt-6">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Free full live preview before paying</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>One-time ₹49. No recurring subscriptions.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-pink-400" />
          <span>Rated 4.9/5 by 12,000+ celebrations</span>
        </div>
      </div>
    </section>
  );
}
