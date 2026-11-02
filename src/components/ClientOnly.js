'use client';

import { useState, useEffect } from 'react';

/**
 * Renders fallback during Server-Side Rendering (SSR), and switches to children
 * only after mounting on the client. Prevents heavy client trees from burning
 * server CPU cycles.
 */
export default function ClientOnly({ children, fallback = null }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return fallback;
    }

    return children;
}
