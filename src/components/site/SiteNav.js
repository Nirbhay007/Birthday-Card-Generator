'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import WhatsNew from '@/components/WhatsNew';

const NAV_LINKS = [
    { href: '#how-it-works', label: 'How it works' },
    { href: '#themes', label: 'Themes' },
    { href: '/wishes', label: 'Wish ideas' },
    { href: '#faqs', label: 'FAQs' },
];

/**
 * Sticky marketing nav. Single row on desktop, collapsible panel on mobile.
 * One conversion intent: "Create a free card" → the generator anchor.
 */
export default function SiteNav() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-ink/[0.06] bg-paper/85 backdrop-blur-md">
            <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                    <Image src="/icon.svg" alt="BirthdayGen logo" width={30} height={30} className="h-[30px] w-[30px]" priority unoptimized />
                    <span className="font-display text-lg font-extrabold tracking-tight">BirthdayGen</span>
                </Link>

                <div className="hidden items-center gap-7 md:flex">
                    {NAV_LINKS.map((l) => (
                        <a key={l.href} href={l.href} className="text-sm font-medium text-ink/70 transition-colors hover:text-ink">
                            {l.label}
                        </a>
                    ))}
                    <WhatsNew />
                    <a href="#create" className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
                        Create a free card
                    </a>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls="mobile-nav"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink md:hidden"
                >
                    <span className="sr-only">Toggle menu</span>
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {open && (
                <div id="mobile-nav" className="border-t border-ink/[0.06] bg-paper px-4 pb-5 pt-2 md:hidden">
                    <div className="flex flex-col">
                        {NAV_LINKS.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                onClick={() => setOpen(false)}
                                className="rounded-xl px-3 py-3 text-sm font-medium text-ink/80 transition-colors hover:bg-ink/5"
                            >
                                {l.label}
                            </a>
                        ))}
                        <div className="mt-2 px-3">
                            <WhatsNew />
                        </div>
                        <a
                            href="#create"
                            onClick={() => setOpen(false)}
                            className="mt-4 rounded-full bg-ink px-5 py-3 text-center text-sm font-semibold text-white"
                        >
                            Create a free card
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
