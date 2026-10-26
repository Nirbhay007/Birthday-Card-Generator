'use client';

import Link from 'next/link';
import { track } from '@/lib/track';

/**
 * A next/link that records a PII-free funnel event on click.
 *
 * Used for the recipient → creator CTA on card pages so the viral loop
 * (recipient opens a card → creates their own) is measurable without
 * turning the card page into a client component.
 */
export default function TrackedLink({ href, event, eventData, onClick, children, ...props }) {
    return (
        <Link
            href={href}
            onClick={(e) => {
                if (event) track(event, eventData);
                if (onClick) onClick(e);
            }}
            {...props}
        >
            {children}
        </Link>
    );
}
