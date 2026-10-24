import { cache } from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PhotoGallery from '@/components/PhotoGallery';
import AudioPlayer from '@/components/AudioPlayer';
import ShareButtons from '@/components/ShareButtons';
import MonetizationSlot from '@/components/MonetizationSlot';
import BirthdayExperience from '@/components/BirthdayExperience';
import { getBreadcrumbSchema, getGreetingCardSchema, serializeJsonLd } from '@/lib/seo';
import { buildOgPath } from '@/lib/og';

// ISR: cache each card page for 1 hour at the CDN.
// Card views are the bulk of traffic, and page content only changes through
// the app, which calls revalidatePath() on edits and VIP upgrades. A longer
// window avoids re-rendering healthy cards every 5 minutes while they are
// being viewed. URL flags (?created=1 / ?preview=1 / ?viewer=1) are handled
// client-side in <BirthdayExperience />, so they share this cache entry
// without breaking.
export const revalidate = 3600;
// Classic on-demand ISR opt-in for dynamic segments: prebuild nothing, but
// render-and-cache each /b/[id] the first time it is requested.
export const dynamicParams = true;

export async function generateStaticParams() {
    return [];
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday.nirbhay.online';

/**
 * Cached per-request fetcher to prevent duplicate Prisma roundtrips
 * across generateMetadata() and the BirthdayPage component.
 */
const getBirthdayPage = cache(async (id) => {
    return prisma.birthdayPage.findUnique({
        where: { id },
        include: {
            photos: {
                orderBy: {
                    order: 'asc',
                },
            },
        },
    });
});

/**
 * A note on URL flags (?preview=1, ?created=1, ?viewer=1):
 * these are handled entirely inside <BirthdayExperience /> (client component)
 * by reading window.location. The page itself never touches searchParams, so
 * Next.js can statically render each /b/[id] page and cache it at the CDN
 * (see `revalidate` above). Previously this file read searchParams, which
 * silently opted every card view into dynamic rendering — every recipient
 * open hit the server function + database even though the page is ISR.
 */

export async function generateMetadata({ params }) {
    const { id } = await params;
    const page = await getBirthdayPage(id);

    if (!page) {
        return {
            title: 'Birthday Page Not Found',
            description: 'The requested personalized birthday card could not be found.',
        };
    }

    const ogImage = buildOgPath({
        recipientName: page.recipientName,
        age: page.age,
        theme: page.theme,
        senderName: page.senderName,
    });
    const absoluteOgImage = `${baseUrl}${ogImage}`;

    const title = `Happy Birthday ${page.recipientName}! 🎂`;
    const description = `A special birthday surprise for ${page.recipientName} - open on your phone to blow out the candles! ✨`;

    return {
        title,
        description,
        alternates: {
            canonical: `/b/${id}`,
        },
        openGraph: {
            title,
            description,
            url: `${baseUrl}/b/${id}`,
            siteName: 'BirthdayGen',
            type: 'article',
            images: [
                {
                    url: absoluteOgImage,
                    width: 1200,
                    height: 630,
                    alt: `Happy Birthday ${page.recipientName} - tap to open surprise`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [absoluteOgImage],
        },
        robots: {
            // Personal UGC pages stay shareable but out of the index:
            // keeps thin duplicate-prone pages from diluting site quality.
            index: false,
            follow: true,
        },
    };
}

export default async function BirthdayPage({ params }) {
    const { id } = await params;
    const page = await getBirthdayPage(id);

    if (!page) {
        notFound();
    }

    const breadcrumbs = getBreadcrumbSchema(baseUrl, [
        { name: 'Home', url: '/' },
        { name: `Birthday Page for ${page.recipientName}`, url: `/b/${id}` },
    ]);

    const greetingCardSchema = getGreetingCardSchema(baseUrl, page);

    const isVip = !!page.isVip;
    // Pro visuals ship with the standard ₹29 VIP — column kept for future tiers.
    const isVipPro = isVip || !!page.isVipPro;
    const FREE_THEMES = ['fun', 'elegant'];
    const FREE_TRACKS = ['classic', 'off'];
    const PRO_THEMES = ['holo', 'aurora'];
    const PRO_TRACKS = ['techno', 'chamber', 'marching'];

    // In VIP mode, activate the creator's chosen theme and music track.
    // In Free mode, display clean free defaults while preserving their selected VIP
    // theme and soundtrack in the database ready for instant activation upon VIP upgrade!
    // Pro-only themes/sounds fall back gracefully when the card is not Pro.
    const activeThemeRaw = isVip || isVipPro
        ? (page.theme || 'royal')
        : (FREE_THEMES.includes(page.theme) ? page.theme : 'fun');
    const activeTheme = (!isVipPro && PRO_THEMES.includes(activeThemeRaw)) ? 'royal' : activeThemeRaw;

    const activeMusicRaw = isVip || isVipPro
        ? (page.music || 'classic')
        : (page.music === 'off' ? 'off' : 'classic');
    const activeMusic = (!isVipPro && PRO_TRACKS.includes(activeMusicRaw)) ? 'strings' : activeMusicRaw;

    const allPhotos = page.photos || [];
    const photoCap = isVipPro ? 12 : isVip ? 9 : 3;
    const visiblePhotos = (isVip || isVipPro) ? allPhotos.slice(0, photoCap) : allPhotos.slice(0, 3);
    const lockedPhotosCount = (isVip || isVipPro) ? Math.max(0, allPhotos.length - photoCap) : Math.max(0, allPhotos.length - 3);

    // Never ship the ownership secret to the browser as page data — the
    // creator's own browser holds it in localStorage (kept there at creation).
    const { editToken: _editToken, ...publicPage } = page;

    const experiencePage = {
        ...publicPage,
        theme: activeTheme,
        music: activeMusic,
        originalTheme: page.theme,
        originalMusic: page.music,
        isVip: isVip || isVipPro,
        isVipPro,
        lockedPhotosCount,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbs) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(greetingCardSchema) }}
            />

            <main
                className="min-h-screen transition-colors duration-500 relative overflow-hidden"
                data-theme={activeTheme}
                style={{
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)'
                }}
            >
                <nav className="container mx-auto px-4 py-4 relative z-20" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-xs opacity-75">
                        <li><Link href="/" className="hover:underline">Home</Link></li>
                        <li><span>/</span></li>
                        <li className="font-semibold text-purple-600">Wish for {page.recipientName}</li>
                    </ol>
                </nav>

                <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
                    <BirthdayExperience
                        page={experiencePage}
                        photos={visiblePhotos}
                        gallery={<PhotoGallery photos={visiblePhotos} lockedCount={lockedPhotosCount} />}
                        audioSlot={activeMusic !== 'off' ? <AudioPlayer track={activeMusic} /> : null}
                        shareSlot={
                            <footer className="text-center pb-24 sm:pb-12 pt-6">
                                <p className="text-sm opacity-70 mb-4 font-medium">
                                    Made with ❤️ using{' '}
                                    <Link href="/" className="font-bold underline hover:text-purple-600 transition-colors" title="BirthdayGen - Free Birthday Website Maker">
                                        BirthdayGen
                                    </Link>
                                    {page.senderName ? ` by ${page.senderName}` : ''}
                                </p>
                                <ShareButtons
                                    pageId={page.id}
                                    title={`Happy Birthday ${page.recipientName}! 🎂`}
                                    text="Open this on your phone and blow out the candles! ✨"
                                />

                                {page.isVip && (
                                    <div className="my-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 shadow-xs">
                                        <span>👑 Specially handcrafted with love for {page.recipientName}{page.senderName ? ` by ${page.senderName}` : ''}</span>
                                    </div>
                                )}

                                <div className="max-w-xl mx-auto my-6">
                                    <MonetizationSlot slotId={`card-footer-${page.id}`} />
                                </div>

                                <div className="mt-8 sticky bottom-4 z-30 bg-white/85 backdrop-blur-md border border-purple-100 rounded-2xl p-4 shadow-xl">
                                    <p className="text-sm font-bold text-gray-900 mb-3">💜 Loved this surprise? Create yours free in 30 seconds</p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                        <Link
                                            href="/"
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-all text-sm font-bold shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                                        >
                                            <span>🎉 Create your own free card</span>
                                        </Link>
                                        <Link
                                            href="/wishes"
                                            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-white hover:bg-purple-50 text-purple-700 transition-all text-sm font-semibold border border-purple-200 shadow-xs"
                                        >
                                            <span>Browse Birthday Wishes</span>
                                        </Link>
                                    </div>
                                </div>
                            </footer>
                        }
                    />
                </div>
            </main>
        </>
    );
}
