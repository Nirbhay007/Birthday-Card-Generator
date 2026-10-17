# BirthdayGen — Design System (`feat/ui-revamp`)

Anti-slop brief ledger for the 2026 UI revamp. Read this before touching styles.

## Design read

- **Product**: consumer gift product (free interactive birthday website maker). Audience: everyday gift-givers on mobile (India-first, WhatsApp share loop) plus desktop.
- **Mode**: Redesign — **overhaul of execution** (typography, spacing, color discipline, motion, composition).
- **Preserve**: routes, IA, copy voice, SEO text + JSON-LD, analytics events, payment flows, and the per-card theme engine.
- **Dials**: VARIANCE 7 / MOTION 6 / DENSITY 3.

## Theme lock

- **Marketing pages** (/, /wishes, /ages, /anniversary): light "paper" theme — paper background, ink text, violet accent.
- **Card experience** (/b/[id]): unchanged per-card `data-theme` system (it is the product itself).
- **Premium surfaces**: existing dark cinematic `.prm-*` system (restyle in a later pass; do not mix tokens).
- No mid-page theme flips. Dark panels (footer, final CTA) are components, not theme flips.

## Tokens

Defined in `globals.css` (CSS vars) and `tailwind.config.js` (utilities).

- `ink` #15111F · `paper` #F7F6FB · `muted` #5B5568 · line rgba(21,17,31,.08) · surface #FFFFFF
- `brand` (violet — the single accent): 50 #F4F1FF · 100 #EBE5FF · 200 #D9CEFF · 300 #BCA5FF · 400 #9B73FF · 500 #7C4DFF · 600 #6D33E8 · 700 #5A24C4 · 800 #4A1FA0 · 950 #241052
- `gold` #F2C14E — **VIP semantics only** (badges, keepsake, crown moments). Never decorative.
- Radii: buttons pill · cards `rounded-3xl` · inputs 12px.
- Shadows are violet-tinted and low-spread (`shadow-soft`, `shadow-lift`). No hard black shadows.

## Typography

- **Display**: Bricolage Grotesque (`font-display`) — headlines only, tracking-tight, `text-wrap: balance`.
- **Body/UI**: Geist (`--font-sans`).
- Card theme fonts (Playfair, Fredoka, Quicksand, Press Start 2P, VT323, Lato, Inter) are **product assets** — never used in marketing chrome.

## Motion

- GSAP + ScrollTrigger through `useGSAP`. One sticky-stack storytelling sequence (`JourneyPin`) + hero entrance.
- `gsap.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)')` gates every animation; mobile and reduced-motion get the static layout.
- Canvas: `CelebrationBackground` is the only canvas ambience.
- Rules: no marquee, no parallax on text, no scroll hijack, transform/opacity only.

## Iconography

- lucide-react (existing dependency). One family, `strokeWidth={1.75}`.
- No emoji in UI chrome. Emoji may stay inside card content and copy where the recipient will see them.

## Anti-slop checklist (repo-specific)

- No gradient text on marketing headings; no glassmorphism on marketing chrome.
- No rows of 3 equal cards — use asymmetric grids / bento spans.
- No fake-precise stats and no fake screenshots: every preview is a real component, theme token, or real asset.
- ≤ 1 eyebrow per 3 sections; max 3 eyebrows per page.
- Copy: headline ≤ 2 lines desktop, subtext ≤ 20 words, CTA labels keep one intent word ("Create", "Browse", "See").

## Free vs VIP truth

Free themes: `fun`, `elegant` (see `FREE_THEMES` in `src/app/b/[id]/page.js`). The other 10 are VIP (`VIP_THEMES` in `VipCustomizerModal.js`). Marketing copy must not claim "all free".
