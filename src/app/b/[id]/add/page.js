import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GroupWishForm from '@/components/GroupWishForm';
import GroupWishes from '@/components/GroupWishes';

/**
 * Public contributor page for a group card.
 *
 * Only exists for paid group cards (`isGroup`). It is intentionally noindex:
 * it is a private share link, not a landing page. The card itself stays the
 * canonical, recipient-facing page.
 */
export const revalidate = 60;

export async function generateMetadata({ params }) {
    const { id } = await params;
    const page = await prisma.birthdayPage.findUnique({
        where: { id },
        select: { recipientName: true, isGroup: true },
    });

    if (!page || !page.isGroup) {
        return { title: 'Group card not found', robots: { index: false, follow: false } };
    }

    return {
        title: `Add a wish for ${page.recipientName} 🎂`,
        description: `Everyone is adding a birthday wish for ${page.recipientName}. Add yours in one tap.`,
        robots: { index: false, follow: false },
        alternates: { canonical: `/b/${id}/add` },
    };
}

export default async function GroupWishPage({ params }) {
    const { id } = await params;
    const page = await prisma.birthdayPage.findUnique({
        where: { id },
        select: {
            id: true,
            recipientName: true,
            senderName: true,
            isGroup: true,
        },
    });

    if (!page || !page.isGroup) notFound();

    return (
        <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 px-4 py-10 sm:py-16">
            <div className="mx-auto max-w-xl">
                <nav className="mb-6 text-center" aria-label="Breadcrumb">
                    <Link href={`/b/${page.id}`} className="text-xs font-bold text-purple-700 hover:text-purple-900 underline">
                        ← Back to {page.recipientName}&apos;s card
                    </Link>
                </nav>

                <GroupWishForm pageId={page.id} recipientName={page.recipientName} />

                <div className="mt-10">
                    <GroupWishes
                        pageId={page.id}
                        recipientName={page.recipientName}
                        isGroup
                        hideCta
                    />
                </div>

                <p className="mt-10 text-center text-[11px] text-gray-400">
                    Made with 💜 on{' '}
                    <Link href="/" className="font-bold underline hover:text-purple-600">
                        BirthdayGen
                    </Link>
                </p>
            </div>
        </main>
    );
}
