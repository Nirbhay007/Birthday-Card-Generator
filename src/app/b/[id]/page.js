import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CandleBlower from '@/components/CandleBlower';
import PhotoGallery from '@/components/PhotoGallery';
import AudioPlayer from '@/components/AudioPlayer';
import ShareButtons from '@/components/ShareButtons';
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
    const description = page.message ? `"${page.message.slice(0, 150)}..."` : `A special interactive digital birthday wish created for ${page.recipientName} on BirthdayGen.`;

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
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
        robots: {
            index: true,
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
                className="min-h-screen transition-colors duration-500"
                data-theme={page.theme}
                style={{
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)'
                }}
            >
                {page.audioEnabled && <AudioPlayer />}

                <nav className="container mx-auto px-4 py-4" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-xs opacity-75">
                        <li><a href="/" className="hover:underline">Home</a></li>
                        <li><span>/</span></li>
                        <li className="font-semibold text-purple-600">Wish for {page.recipientName}</li>
                    </ol>
                </nav>

                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    {/* Hero Header */}
                    <header className="text-center mb-12 space-y-4">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                            Happy Birthday
                        </h1>
                        <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse">
                            {page.recipientName}!
                        </h2>
                        {page.message && (
                            <blockquote className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto leading-relaxed italic border-l-4 border-purple-500 pl-4 py-2 my-6 bg-white/20 rounded-r-xl">
                                "{page.message}"
                            </blockquote>
                        )}
                    </header>

                    {/* Interactive Candle Blowing */}
                    <div className="mb-16 bg-white/50 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-white/30">
                        <CandleBlower />
                    </div>

                    {/* Photo Gallery */}
                    {page.photos.length > 0 && (
                        <section className="mb-16 space-y-6" aria-label="Photo Memories">
                            <h3 className="text-2xl font-bold text-center opacity-90">Cherished Memories</h3>
                            <PhotoGallery photos={page.photos} />
                        </section>
                    )}

                    {/* Footer / Sharing & Contextual Internal Link */}
                    <footer className="text-center pb-12 pt-6">
                        <p className="text-sm opacity-70 mb-4 font-medium">Made with ❤️ using BirthdayGen</p>
                        <ShareButtons title={`Happy Birthday ${page.recipientName}!`} />

                        <div className="mt-12">
                            <a
                                href="/"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all text-sm font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                            >
                                <span>🎉 Create your own free interactive birthday card with BirthdayGen</span>
                            </a>
                        </div>
                    </footer>
                </div>
            </main>
        </>
    );
}
