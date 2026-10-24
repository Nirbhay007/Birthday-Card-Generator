'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureAttribution } from '@/lib/attribution';

/**
 * Records first-touch traffic attribution (UTM / `?ref=` / external referrer)
 * once per browser, before a client-side navigation can lose the query string.
 *
 * Mounted from the root layout, so a visitor who lands on `/` with
 * `?utm_source=instagram` and then browses (client-side) to a wish page or
 * starts a card still carries `utm:instagram` when the card is created.
 *
 * Recipient card views (`/b/...`) are deliberately skipped: the medium a
 * friend used to share a card says nothing about how *this* visitor found the
 * product, and tagging them with it would pollute acquisition data.
 */
export default function AttributionCapture() {
    const pathname = usePathname();

    useEffect(() => {
        try {
            if (!pathname || pathname.startsWith('/b/')) return;
            captureAttribution();
        } catch {
            // Attribution is best-effort; never break rendering for it.
        }
    }, [pathname]);

    return null;
}
