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
        const age = searchParams.get('age');
        const theme = searchParams.get('theme') || 'fun';
        const [bg1, bg2, fg] = THEME_BG[theme] || THEME_BG.fun;

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
                        padding: 60,
                    }}
                >
                    <div style={{ display: 'flex', fontSize: 34, letterSpacing: 6, opacity: 0.7, color: fg, fontWeight: 700 }}>
                        🎉 BIRTHDAYGEN 🎉
                    </div>
                    <div style={{ display: 'flex', fontSize: 84, fontWeight: 900, color: fg, marginTop: 18, lineHeight: 1 }}>
                        Happy Birthday
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 96,
                            fontWeight: 900,
                            color: '#ffffff',
                            backgroundColor: '#9333ea',
                            backgroundImage: 'linear-gradient(90deg,#9333ea,#ec4899,#f59e0b)',
                            padding: '6px 42px',
                            borderRadius: 28,
                            marginTop: 16,
                        }}
                    >
                        {rawName}!
                    </div>
                    <div style={{ display: 'flex', fontSize: 32, color: fg, marginTop: 22, opacity: 0.9 }}>
                        {age ? `Turning ${age} • Tap to blow candles 🎂` : 'Tap to open surprise • Blow candles 🎂'}
                    </div>
                    <div style={{ display: 'flex', fontSize: 26, color: fg, marginTop: 10, opacity: 0.65 }}>
                        Free interactive card with photos &amp; music
                    </div>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    } catch (e) {
        return new Response(`OG error: ${e?.message || 'unknown'}`, { status: 500 });
    }
}
