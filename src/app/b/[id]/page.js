import { cache } from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PhotoGallery from '@/components/PhotoGallery';
import AudioPlayer from '@/components/AudioPlayer';
import ShareButtons from '@/components/ShareButtons';
import MonetizationSlot from '@/components/MonetizationSlot';
import BirthdayExperience from '@/components/BirthdayExperience';
import { getBreadcrumbSchema, getGreetingCardSchema } from '@/lib/seo';

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
 * Preview mode (for the site owner to peek at any page without counting):
 * append ?preview=1 to the URL, e.g. /b/abc123?preview=1
 * While previewing, no view/love/share counters are incremented
 * (enforced client-side + in the react API), and shared/copied links are
 * stripped of the flag so recipients count normally.
 */
function isPreviewMode(searchParams) {
    if (!searchParams) return false;
    const raw = searchParams.preview;
    const val = Array.isArray(raw) ? raw[0] : raw;
    // Bare ?preview (val === '') counts as preview on.
    // Explicit ?preview=0 / false / no / off opts back out.
    if (val === undefined || val === null) return false;
    const v = String(val).toLowerCase();
    return v === '' || v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const page = await getBirthdayPage(id);

    if (!page) {
        return {
            title: 'Birthday Page Not Found | BirthdayGen',
            description: 'The requested personalized birthday card could not be found.',
        };
    }

    const senderParam = page.senderName ? `&sender=${encodeURIComponent(page.senderName)}` : '';
    const ogImage = `/api/og?name=${encodeURIComponent(page.recipientName)}${page.age ? `&age=${page.age}` : ''}&theme=${encodeURIComponent(page.theme || 'elegant')}${senderParam}`;
    const absoluteOgImage = `${baseUrl}${ogImage}`;

    const title = `Happy Birthday ${page.recipientName}! 🎂`;
    const description = `A special birthday surprise for ${page.recipientName} - open on your phone to blow out the candles! ✨`;

    return {
        title: `${title} | BirthdayGen`,
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

export default async function BirthdayPage({ params, searchParams }) {
    const { id } = await params;
    // In Next 15+, searchParams is a Promise — await it when thenable.
    const resolvedSearch = searchParams && typeof searchParams.then === 'function'
        ? await searchParams
        : (searchParams || {});
    const preview = isPreviewMode(resolvedSearch);
    const page = await getBirthdayPage(id);

    if (!page) {
        notFound();
    }

    const breadcrumbs = getBreadcrumbSchema(baseUrl, [
        { name: 'Home', url: '/' },
        { name: `Birthday Page for ${page.recipientName}`, url: `/b/${id}` },
    ]);

    const greetingCardSchema = getGreetingCardSchema(baseUrl, page);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(greetingCardSchema) }}
            />

            <main
                className="min-h-screen transition-colors duration-500 relative overflow-hidden"
                data-theme={page.theme}
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
                    {preview && (
                        <p className="mb-4 text-center text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 rounded-full px-4 py-2">
                            👀 Preview mode — views & reactions are paused. <Link href={`/b/${id}`} className="underline">Exit preview</Link>
                        </p>
                    )}
                    <BirthdayExperience
                        page={page}
                        preview={preview}
                        photos={page.photos}
                        gallery={<PhotoGallery photos={page.photos} />}
                        audioSlot={page.music !== 'off' ? <AudioPlayer track={page.music || 'classic'} /> : null}
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

                                <div className="max-w-xl mx-auto my-6">
                                    <MonetizationSlot slotId={`card-footer-${page.id}`} />
                                </div>

                                <div className="mt-8 sticky bottom-4 z-30 bg-white/85 backdrop-blur-md border border-purple-100 rounded-2xl p-4 shadow-xl">
                                    <p className="text-sm font-bold text-gray-900 mb-3">💜 Loved this surprise? Create yours free in 30 seconds</p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                        <Link
                                            href="/"
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-95 transition-all text-sm font-bold shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
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
