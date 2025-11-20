import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CandleBlower from '@/components/CandleBlower';
import PhotoGallery from '@/components/PhotoGallery';
import AudioPlayer from '@/components/AudioPlayer';
import ShareButtons from '@/components/ShareButtons';

export async function generateMetadata({ params }) {
    const { id } = await params;
    const page = await prisma.birthdayPage.findUnique({
        where: { id },
    });

    if (!page) {
        return {
            title: 'Birthday Page Not Found',
        };
    }

    return {
        title: `Happy Birthday ${page.recipientName}!`,
        description: page.message || 'A special birthday wish for you.',
        openGraph: {
            title: `Happy Birthday ${page.recipientName}!`,
            description: page.message || 'A special birthday wish for you.',
            type: 'website',
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

    return (
        <main className="min-h-screen transition-colors duration-500" data-theme={page.theme}
            style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)'
            }}
        >
            {page.audioEnabled && <AudioPlayer />}

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Hero Section */}
                <div className="text-center mb-12 space-y-6">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                        Happy Birthday
                    </h1>
                    <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse">
                        {page.recipientName}!
                    </h2>
                    {page.message && (
                        <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto leading-relaxed italic">
                            "{page.message}"
                        </p>
                    )}
                </div>

                {/* Interactive Candle Blowing */}
                <div className="mb-16 bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                    <CandleBlower />
                </div>

                {/* Photo Gallery */}
                {page.photos.length > 0 && (
                    <div className="mb-16 space-y-6">
                        <h3 className="text-2xl font-bold text-center opacity-80">Memories</h3>
                        <PhotoGallery photos={page.photos} />
                    </div>
                )}

                {/* Footer / Share */}
                <div className="text-center pb-12">
                    <p className="text-sm opacity-60 mb-4">Made with ❤️ using BirthdayGen</p>
                    <ShareButtons title={`Happy Birthday ${page.recipientName}!`} />

                    <div className="mt-12">
                        <a href="/" className="inline-block px-6 py-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors text-sm font-medium">
                            Create your own page
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
