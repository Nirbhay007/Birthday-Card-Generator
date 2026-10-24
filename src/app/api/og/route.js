import { THEME_BG, normalizeOgInput, ogStorageKey, ogPublicUrl } from '@/lib/og';

export const runtime = 'edge';

const IMMUTABLE_CACHE = 'public, immutable, no-transform, max-age=31536000, s-maxage=31536000';

// Upper bound on the R2 existence probe. If storage is slow or unreachable we
// would rather render the image (correct, just slower) than stall the crawler.
const PROBE_TIMEOUT_MS = 1500;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const input = normalizeOgInput(searchParams);
        const [bg1, bg2, fg] = THEME_BG[input.theme] || THEME_BG.fun;

        // Fast path. Cards are rendered once and stored in R2; every later
        // unfurl (from any region) is served that static object by
        // Cloudflare's CDN. Redirecting avoids booting Satori + resvg here,
        // which is where ~1.2s of CPU per cold render was going.
        const storedUrl = ogPublicUrl(ogStorageKey(input));
        if (storedUrl) {
            try {
                const probe = await fetch(storedUrl, {
                    method: 'HEAD',
                    signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
                });
                if (probe.ok) {
                    return new Response(null, {
                        status: 302,
                        headers: {
                            Location: storedUrl,
                            'Cache-Control': IMMUTABLE_CACHE,
                        },
                    });
                }
            } catch {
                // Fall through to on-demand rendering.
            }
        }

        // Slow path: nothing stored yet. Importing here (rather than at module
        // scope) keeps the WASM renderer out of the isolate's boot path, so
        // the redirect above stays cheap.
        const { ImageResponse } = await import('next/og');

        const senderBadge = input.sender
            ? `A SPECIAL SURPRISE FROM ${input.sender.toUpperCase()}`
            : 'YOU HAVE A BIRTHDAY SURPRISE';

        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        backgroundColor: bg1,
                        backgroundImage: `linear-gradient(135deg, ${bg1}, ${bg2})`,
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        padding: '40px 60px',
                        position: 'relative',
                    }}
                >
                    {/* Top Surprise Badge */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 26,
                            letterSpacing: 2,
                            fontWeight: 800,
                            color: '#ffffff',
                            backgroundColor: '#9333ea',
                            backgroundImage: 'linear-gradient(90deg, #7c3aed, #ec4899)',
                            padding: '10px 28px',
                            borderRadius: 9999,
                            boxShadow: '0 8px 24px rgba(147, 51, 234, 0.3)',
                        }}
                    >
                        {senderBadge}
                    </div>

                    {/* Happy Birthday title */}
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 76,
                            fontWeight: 900,
                            color: fg,
                            marginTop: 22,
                            lineHeight: 1.1,
                            textAlign: 'center',
                        }}
                    >
                        Happy Birthday
                    </div>

                    {/* Recipient Name Highlight */}
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 88,
                            fontWeight: 900,
                            color: '#ffffff',
                            backgroundColor: '#9333ea',
                            backgroundImage: 'linear-gradient(90deg, #9333ea, #ec4899, #f59e0b)',
                            padding: '6px 42px',
                            borderRadius: 24,
                            marginTop: 14,
                            boxShadow: '0 12px 32px rgba(236, 72, 153, 0.35)',
                        }}
                    >
                        {input.name}!
                    </div>

                    {/* Subtitle / Age */}
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 32,
                            fontWeight: 700,
                            color: fg,
                            marginTop: 24,
                            opacity: 0.95,
                        }}
                    >
                        {input.age ? `Turning ${input.age} • Tap to Blow Out Virtual Candles` : 'Tap to Blow Out Virtual Candles & Open Wishes'}
                    </div>

                    {/* Interactive hints */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            fontSize: 24,
                            color: fg,
                            marginTop: 12,
                            opacity: 0.75,
                            fontWeight: 600,
                        }}
                    >
                        <span>Music</span>
                        <span>•</span>
                        <span>Photo Gallery</span>
                        <span>•</span>
                        <span>Virtual Gift Box</span>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                headers: {
                    'Cache-Control': IMMUTABLE_CACHE,
                },
            }
        );
    } catch (e) {
        return new Response(`OG error: ${e?.message || 'unknown'}`, { status: 500 });
    }
}
