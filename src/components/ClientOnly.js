'use client';

import { useSyncExternalStore } from 'react';

// A stable no-op subscription: the value only changes once, when the browser
// starts hydrating. useSyncExternalStore avoids the cascading render that a
// setState-in-useEffect mount flag causes, while keeping the same SSR contract.
const subscribe = () => () => {};

/**
 * Renders fallback during Server-Side Rendering (SSR), and switches to children
 * only after mounting on the client. Prevents heavy client trees from burning
 * server CPU cycles.
 */
export default function ClientOnly({ children, fallback = null }) {
    const mounted = useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    );

    if (!mounted) {
        return fallback;
    }

    return children;
}
