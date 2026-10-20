'use client';

import { useEffect } from 'react';

/**
 * A tiny, framework-level signal for browser tests (and progressive
 * enhancement): the attribute appears only after React has hydrated the
 * document. E2E helpers wait for it before the first interactive click, which
 * avoids the classic "clicked a server-rendered button before its handler was
 * attached" race.
 */
export default function HydrationMarker() {
    useEffect(() => {
        document.documentElement.dataset.hydrated = 'true';
    }, []);

    return null;
}
