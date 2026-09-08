import './premium.css';
import PremiumPage from '@/components/premium/PremiumPage';
import { PTHEME_IDS } from '@/components/premium/looks';
import { REL_IDS } from '@/components/premium/relationships';
import { TRACKS, PREMIUM_TRACKS } from '@/lib/music';
import { getBreadcrumbSchema } from '@/lib/seo';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday.nirbhay.online';

const OCC_META = {
    birthday: {
        title: 'Premium Birthday Experience. A Heartfelt Surprise They Will Replay for Years',
        description:
            'A cinematic birthday surprise from the heart: wax-sealed envelope, personal letter, reasons you cherish them, meaningful promises, and an interactive candle finale. Preview free. Unlock for ₹49 (or $1 worldwide).',
    },
    anniversary: {
        title: 'Premium Anniversary Experience. Celebrate Your Story Together',
        description:
            'A cinematic anniversary surprise: wax-sealed envelope, heartfelt love letter, shared memories, renewed promises, and a starlit celebration. Preview free. Unlock for ₹49 (or $1 worldwide).',
    },
    valentine: {
        title: 'Premium Valentine Surprise. For the One Who Holds Your Heart',
        description:
            'A cinematic Valentine surprise: wax-sealed envelope, tender love letter, reasons you adore them, promises, and a starlit celebration. Preview free. Unlock for ₹49 (or $1 worldwide).',
    },
    friendship: {
        title: 'Premium Friendship Experience. For the Person Who Has Always Had Your Back',
        description:
            'A cinematic friendship surprise: wax-sealed envelope, honest letter, unforgettable memories, promises, and a celebration of your bond. Preview free. Unlock for ₹49 (or $1 worldwide).',
    },
};

function occasionOf(sp) {
    const raw = String((Array.isArray(sp?.occasion) ? sp.occasion[0] : sp?.occasion) || 'birthday').toLowerCase();
    return OCC_META[raw] ? raw : 'birthday';
}

export async function generateMetadata({ searchParams }) {
    const sp = searchParams && typeof searchParams.then === 'function' ? await searchParams : searchParams || {};
    const meta = OCC_META[occasionOf(sp)];
    return {
        title: meta.title,
        description: meta.description,
        alternates: { canonical: '/premium' },
        openGraph: {
            title: meta.title,
            description: meta.description,
            url: `${baseUrl}/premium`,
            siteName: 'BirthdayGen',
            type: 'website',
            images: [{ url: '/api/og?name=Your+Person&theme=royal', width: 1200, height: 630, alt: 'BirthdayGen Premium. Cinematic surprise universe' }],
        },
        twitter: {
            card: 'summary_large_image',
            title: meta.title,
            description: meta.description,
            images: ['/api/og?name=Your+Person&theme=royal'],
        },
    };
}

function clean(v, fallback, max = 40) {
    if (typeof v !== 'string' || !v.trim()) return fallback;
    return v.trim().slice(0, max);
}

export default async function PremiumRoute({ searchParams }) {
    const sp = searchParams && typeof searchParams.then === 'function' ? await searchParams : searchParams || {};
    const pick = (k) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]);
    const to = clean(pick('to'), 'Aisha');
    const from = clean(pick('from'), 'Your Person', 60);
    const message = clean(pick('msg'), '', 800);
    const rawAge = parseInt(pick('age'), 10);
    const age = Number.isFinite(rawAge) && rawAge >= 1 && rawAge <= 120 ? rawAge : null;
    const rawOccasion = String(pick('occasion') || 'birthday').toLowerCase();
    const occasion = ['birthday', 'anniversary', 'valentine', 'friendship'].includes(rawOccasion) ? rawOccasion : 'birthday';
    // Magic-link key: strict shape check before it ever reaches the client.
    const rawKey = String(pick('key') || '');
    const unlockKey = /^unlock_[0-9a-f]{48}$/.test(rawKey) ? rawKey : null;
    // Giver-authored content travelling inside magic links (JSON, validated).
    const parseReasons = (v) => {
        try {
            const a = JSON.parse(String(v || ''));
            if (!Array.isArray(a)) return [];
            return a
                .filter((r) => r && (r.t || r.d))
                .slice(0, 3)
                .map((r) => ({ t: String(r.t || '').slice(0, 40), d: String(r.d || '').slice(0, 160) }));
        } catch {
            return [];
        }
    };
    const parseVows = (v) => {
        try {
            const a = JSON.parse(String(v || ''));
            if (!Array.isArray(a)) return [];
            return a
                .filter((x) => typeof x === 'string' && x.trim())
                .slice(0, 3)
                .map((x) => x.trim().slice(0, 160));
        } catch {
            return [];
        }
    };
    const customReasons = parseReasons(pick('rs'));
    const customVows = parseVows(pick('vs'));
    const rawTheme = String(pick('theme') || 'midnight').toLowerCase();
    const initialPTheme = PTHEME_IDS.includes(rawTheme) ? rawTheme : 'midnight';
    const musicIds = [...PREMIUM_TRACKS.map((t) => t.id), ...TRACKS.map((t) => t.id), 'custom'];
    const rawMusic = String(pick('music') || 'beats').toLowerCase();
    const initialMusic = musicIds.includes(rawMusic) ? rawMusic : 'beats';
    const rawMusicUrl = clean(pick('musicUrl'), '', 600);
    const initialMusicUrl = rawMusicUrl && /^https?:\/\//.test(rawMusicUrl) ? rawMusicUrl : null;
    const initialMusicName = clean(pick('musicName'), '', 80);
    const rawRel = String(pick('for') || '').toLowerCase();
    const initialRel = REL_IDS.includes(rawRel) ? rawRel : '';
    const rawPhoto = clean(pick('photo') || pick('photoUrl'), '', 600);
    const initialPhotoUrl = rawPhoto && (/^https?:\/\//.test(rawPhoto) || rawPhoto.startsWith('/')) ? rawPhoto : null;
    const giftPreview = ['1', 'true', 'yes'].includes(String(pick('gift') || '').toLowerCase());
    const rawMode = String(pick('mode') || '').toLowerCase();
    const initialMode = ['cinema', 'keepsake'].includes(rawMode)
        ? rawMode
        : (customReasons.length || customVows.length ? 'keepsake' : 'cinema');

    const breadcrumbs = getBreadcrumbSchema(baseUrl, [
        { name: 'Home', url: '/' },
        { name: 'Premium Birthday Universe', url: '/premium' },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
            <PremiumPage to={to} from={from} message={message} age={age} occasion={occasion} unlockKey={unlockKey} customReasons={customReasons} customVows={customVows} initialPTheme={initialPTheme} initialMusic={initialMusic} initialMusicUrl={initialMusicUrl} initialMusicName={initialMusicName} initialRel={initialRel} initialPhotoUrl={initialPhotoUrl} giftPreview={giftPreview} initialMode={initialMode} />
        </>
    );
}
