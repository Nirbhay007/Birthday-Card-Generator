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

export async function generateMetadata({ params }) {
    const { id } = await params;
    const page = await prisma.birthdayPage.findUnique({
        where: { id },
    });

    if (!page) {
        return {
            title: 'Birthday Page Not Found | BirthdayGen',
            description: 'The requested personalized birthday card could not be found.',
        };
    }

    const title = `Happy Birthday ${page.recipientName}! 🎉 - Personalized Birthday Card`;
    const forLine = page.relationship ? ` for your ${page.relationship}` : '';
    const description = page.message ? `"${page.message.slice(0, 150)}..."` : `A special interactive digital birthday surprise${forLine} created for ${page.recipientName} on BirthdayGen. Tap to open the surprise, blow virtual candles and view photo memories.`;
    const ogImage = `/api/og?name=${encodeURIComponent(page.recipientName)}${page.age ? `&age=${page.age}` : ''}&theme=${encodeURIComponent(page.theme || 'elegant')}`;

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
            images: [{ url: ogImage, width: 1200, height: 630, alt: `Happy Birthday ${page.recipientName} - tap to open surprise` }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
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
    const page = await prisma.birthdayPage.findUnique({
        where: { id },
        include: {
            photos: {
                orderBy: {
                    order: 'asc',
                },
            },
        },
    });

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
                    <BirthdayExperience
                        page={page}
                        photos={page.photos}
                        gallery={<PhotoGallery photos={page.photos} />}
                        audioSlot={page.music !== 'off' ? <AudioPlayer track={page.music || 'classic'} /> : null}
                        shareSlot={
                            <footer className="text-center pb-12 pt-6">
                                <p className="text-sm opacity-70 mb-4 font-medium">Made with ❤️ using BirthdayGen{page.senderName ? ` by ${page.senderName}` : ''}</p>
                                <ShareButtons pageId={page.id} title={`Happy Birthday ${page.recipientName}!`} text={`🎉 I made a birthday surprise for ${page.recipientName} — tap to open, blow candles & view memories!`} />

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
