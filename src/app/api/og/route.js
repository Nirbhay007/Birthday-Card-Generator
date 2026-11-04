import { THEME_BG, normalizeOgInput, ogStorageKey, ogPublicUrl } from '@/lib/og';

const IMMUTABLE_CACHE = 'public, immutable, no-transform, max-age=31536000, s-maxage=31536000';

// Upper bound on the R2 existence probe. If storage is slow or unreachable we
// would rather render the image (correct, just slower) than stall the crawler.
const PROBE_TIMEOUT_MS = 1500;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const input = normalizeOgInput(searchParams);
        const [bg1, bg2, fg] = THEME_BG[input.theme] || THEME_BG.fun;

        // Internal pre-render hook, used by src/lib/og-warm.js. Only an
        // authorised warm request is allowed to boot Satori + resvg; every
        // other caller gets a redirect to a PNG that is already in R2.
        // Without this the warmer would follow the redirect below and store
        // the generic default image under a card's own key, permanently.
        const warmSecret = (process.env.CRON_SECRET || '').trim();
        const isWarmRender =
            searchParams.get('warm') === '1' &&
            warmSecret.length > 0 &&
            request.headers.get('authorization') === `Bearer ${warmSecret}`;

        if (!isWarmRender) {
            // Fast path. Cards are rendered once and stored in R2; every later
            // unfurl is served as a static object by Vercel's edge network
            // instead of booting Satori + resvg inside a function.
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
                    // Fall through to fallback
                }
            }

            // Fast fallback path: When a custom card image has not been pre-rendered into R2,
            // redirect to the pre-rendered default preview image.
            // Booting Satori / resvg here would add ~1s to every unfurl.
            const defaultOgUrl = ogPublicUrl('og/v1/default.png');
            if (defaultOgUrl) {
                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: defaultOgUrl,
                        'Cache-Control': IMMUTABLE_CACHE,
                    },
                });
            }
        }

        // Slow path: an authorised warm request, or local dev without R2.
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
