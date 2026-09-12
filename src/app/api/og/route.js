import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const THEME_BG = {
    elegant: ['#fdfbf7', '#f3efe6', '#2c2c2c'],
    fun: ['#fff0f5', '#ffd6e8', '#831843'],
    retro: ['#2b2b2b', '#0f0f0f', '#f0f0f0'],
    minimal: ['#ffffff', '#f3f4f6', '#111827'],
    royal: ['#1a0f2e', '#4c1d95', '#fdf6e3'],
    midnight: ['#0b1026', '#312e81', '#eef2ff'],
    princess: ['#fff5f7', '#fecdd3', '#831843'],
    unicorn: ['#f5f3ff', '#ddd6fe', '#4c1d95'],
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const rawName = (searchParams.get('name') || 'Friend').slice(0, 24);
        const sender = (searchParams.get('sender') || '').slice(0, 24);
        const age = searchParams.get('age');
        const theme = searchParams.get('theme') || 'fun';
        const [bg1, bg2, fg] = THEME_BG[theme] || THEME_BG.fun;

        const senderBadge = sender
            ? `🎁 A SPECIAL SURPRISE FROM ${sender.toUpperCase()}`
            : '🎁 YOU HAVE A BIRTHDAY SURPRISE';

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
                        {rawName}!
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
                        {age ? `Turning ${age} • 🎂 Tap to Blow Out Virtual Candles` : '🎂 Tap to Blow Out Virtual Candles & Open Wishes'}
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
                        <span>🎵 Music</span>
                        <span>•</span>
                        <span>📸 Photo Gallery</span>
                        <span>•</span>
                        <span>🎈 Virtual Gift Box</span>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                headers: {
                    'Cache-Control': 'public, immutable, no-transform, max-age=31536000, s-maxage=31536000',
                },
            }
        );
    } catch (e) {
        return new Response(`OG error: ${e?.message || 'unknown'}`, { status: 500 });
    }
}
