/** @type {import('next').NextConfig} */
const nextConfig = {
    // QA runs a second dev server without clobbering the developer's .next dir.
    distDir: process.env.NEXT_DIST_DIR || '.next',
    // The dev indicator sits in the bottom-left corner, exactly where the card
    // owner toolbar lives. Hide it only for the isolated QA dev server.
    devIndicators: process.env.NEXT_DIST_DIR === '.next-qa' ? false : undefined,
    // Don't advertise the framework version to the world.
    poweredByHeader: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.public.blob.vercel-storage.com',
            },
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
            },
            {
                protocol: 'https',
                hostname: '**.r2.dev',
            },
            {
                protocol: 'https',
                hostname: '*.r2.dev',
            },
        ],
    },

    async headers() {
        // Content-Security-Policy notes:
        // - 'unsafe-inline' in script-src is required by Next.js inline
        //   bootstrap scripts and our JSON-LD blocks (App Router nonces would
        //   force every page to render dynamically, killing ISR/CDN caching).
        // - 'wasm-unsafe-eval' + worker-src blob: are required by heic-to,
        //   which compiles WASM and spawns a blob worker for client-side HEIC
        //   conversion. Without them, HEIC photo uploads break silently.
        // - img/media allow `https:` broadly because user media lives on
        //   Cloudflare R2 (custom domain varies per environment) and Vercel
        //   Blob; scripts/frames/connections stay narrowly allow-listed.
        const isDev = process.env.NODE_ENV !== 'production';
        const csp = [
            "default-src 'self'",
            // React's dev-only debugging features need eval(); production
            // never does. Without this, Next's dev overlay reports an eval
            // error on every page and its pill covers fixed UI in QA.
            // cdn.razorpay.com serves the risk-detection bundle loaded by
            // Razorpay's checkout script; without it the checkout logs a CSP
            // error and loses device-risk signals.
            `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} 'wasm-unsafe-eval' https://checkout.razorpay.com https://cdn.razorpay.com https://va.vercel-scripts.com https://www.googletagmanager.com`,
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data: https://fonts.gstatic.com",
            "media-src 'self' blob: https:",
            "worker-src 'self' blob:",
            "connect-src 'self' https://api.razorpay.com https://cdn.razorpay.com https://lumberjack.razorpay.com https://vitals.vercel-insights.com https://www.google-analytics.com https://region1.google-analytics.com",
            "frame-src https://api.razorpay.com https://checkout.razorpay.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'",
            "upgrade-insecure-requests",
        ].join('; ');

        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'Content-Security-Policy', value: csp },
                    // Aligned with frame-ancestors 'self' above.
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    // Microphone is used on card pages (candle blowing); the
                    // rest stay off.
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(), usb=()' },
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                ],
            },
        ];
    },
};

export default nextConfig;
