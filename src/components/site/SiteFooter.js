import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SupportButton from '@/components/SupportButton';
import { WISH_CATEGORIES } from '@/lib/wishesData';

const footerLink = 'text-sm text-white/60 transition-colors hover:text-white';

export default function SiteFooter() {
    return (
        <footer className="bg-ink text-white">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
                <div className="grid gap-10 md:grid-cols-12">
                    <div className="md:col-span-5">
                        <div className="flex items-center gap-2">
                            <Image src="/icon.svg" alt="" width={28} height={28} aria-hidden="true" unoptimized />
                            <span className="font-display text-lg font-extrabold tracking-tight">BirthdayGen</span>
                        </div>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
                            The free interactive birthday website maker — photo galleries, music and
                            mic-powered candle blowing, shareable in one WhatsApp tap.
                        </p>
                        <p className="mt-4 text-xs text-white/40">
                            Free to create · No signup · Add the free annual reminder to keep photos for next year.
                        </p>
                    </div>

                    <nav className="md:col-span-3" aria-label="Make a card">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Make a card</h3>
                        <ul className="mt-4 space-y-2.5">
                            <li><a className={footerLink} href="#create">Create a birthday card</a></li>
                            <li><a className={footerLink} href="#how-it-works">How it works</a></li>
                            <li><a className={footerLink} href="#pricing">Pricing</a></li>
                            <li><Link className={footerLink} href="/premium" prefetch={false}>Cinematic premium</Link></li>
                            <li>
                                <a className={footerLink} href="https://invite.nirbhay.online/" target="_blank" rel="noopener">
                                    Anniversary cards
                                </a>
                            </li>
                        </ul>
                    </nav>

                    <nav className="md:col-span-4" aria-label="Wish ideas">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Wish ideas</h3>
                        <ul className="mt-4 space-y-2.5">
                            <li><Link className={footerLink} href="/wishes">All birthday wishes</Link></li>
                            {WISH_CATEGORIES.slice(0, 3).map((c) => (
                                <li key={c.slug}>
                                    <Link className={footerLink} href={`/wishes/${c.slug}`}>{c.navTitle} wishes</Link>
                                </li>
                            ))}
                            <li><Link className={footerLink} href="/ages">Wishes by age</Link></li>
                        </ul>
                    </nav>
                </div>

                <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
                    <p className="text-xs text-white/40">
                        © {new Date().getFullYear()} BirthdayGen. Made for the people you love.
                    </p>
                    <SupportButton variant="link" />
                </div>
            </div>
        </footer>
    );
}
