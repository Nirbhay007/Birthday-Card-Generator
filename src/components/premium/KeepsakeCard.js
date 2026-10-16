'use client';

/**
 * KeepsakeCard — turns any surprise into a shareable, film-style keepsake image.
 *
 * Why this exists: a birthday surprise dies in a chat thread. A keepsake image
 * survives: it becomes the recipient's wallpaper, the giver's proof, and a
 * screenshot every friend asks about. The locked state (soft watermark) is the
 * quiet upsell; the paid state exports a clean 1080x1350 (Instagram 4:5) PNG.
 *
 * Everything renders client-side on one canvas. Remote photos are loaded with
 * crossOrigin="anonymous" so the export stays untainted. Cloudflare R2 and
 * Vercel Blob (where uploads live) send no CORS headers, so those URLs are
 * pulled through Next's same-origin image endpoint first; a photo that still
 * cannot be read falls back to a monogram medallion instead of failing.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Share2, Loader2, Lock, Sparkles, Check } from 'lucide-react';

const W = 1080;
const H = 1350;

// Hosts that never send Access-Control-Allow-Origin: the canvas cannot read
// them directly, so they must arrive through a same-origin route.
const CORS_BLOCKED_HOSTS = [/(^|\.)r2\.dev$/i, /(^|\.)public\.blob\.vercel-storage\.com$/i];

/** Resolve a photo value (URL string, or { url } record) to a canvas-loadable src. */
function toLoadableSrc(value) {
    const src = typeof value === 'string' ? value : value && typeof value === 'object' ? value.url : null;
    if (!src || typeof src !== 'string') return null;
    if (!/^https?:\/\//i.test(src)) return src; // relative, data: and blob: are already same-origin
    try {
        const u = new URL(src);
        if (typeof window !== 'undefined' && u.origin === window.location.origin) return src;
        if (CORS_BLOCKED_HOSTS.some((re) => re.test(u.hostname))) {
            // Next's optimizer fetches server-side and re-serves from our origin,
            // so the image is readable and the exported canvas stays untainted.
            return `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`;
        }
        return src;
    } catch {
        return src;
    }
}

const THEME_COLORS = {
    gold: { a: '#1e0f38', b: '#070412', gold: '#f2c14e', soft: '#f7dc9a', ink: '#f6f1e7' },
    aurora: { a: '#073a2c', b: '#021811', gold: '#34d399', soft: '#6ee7b7', ink: '#f0fdf4' },
    rose: { a: '#3b0a22', b: '#12040e', gold: '#fda4af', soft: '#fecdd3', ink: '#fdf2f4' },
    cyan: { a: '#063651', b: '#02141f', gold: '#5eead4', soft: '#99f6e4', ink: '#ecfdf9' },
    sunset: { a: '#3a1503', b: '#170903', gold: '#fbbf24', soft: '#fde68a', ink: '#fff7ed' },
};

function loadImage(value) {
    const src = toLoadableSrc(value);
    return new Promise((resolve) => {
        if (!src) {
            resolve(null);
            return;
        }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null); // offline / 404 / unreadable → monogram fallback
        img.src = src;
    });
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function wrapLines(ctx, text, maxWidth, maxLines = 6, ellipsis = false) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    let truncated = false;
    for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width <= maxWidth || !line) {
            line = test;
        } else {
            lines.push(line);
            line = w;
            if (lines.length === maxLines) {
                truncated = true;
                break;
            }
        }
    }
    if (!truncated && line && lines.length < maxLines) lines.push(line);
    if (truncated && ellipsis && lines.length) {
        let last = lines[lines.length - 1];
        while (last && ctx.measureText(`${last}…`).width > maxWidth) {
            const cut = last.lastIndexOf(' ');
            last = cut > 0 ? last.slice(0, cut) : '';
        }
        lines[lines.length - 1] = `${last}…`;
    }
    return lines;
}

/**
 * @param {Object}  opts
 * @param {string}  opts.to
 * @param {string}  opts.from
 * @param {string}  [opts.photoUrl]
 * @param {string}  [opts.dedication]
 * @param {string}  [opts.occasionLabel]
 * @param {string}  [opts.dateLabel]
 * @param {boolean} opts.unlocked   false ⇒ soft watermark + lock chip
 * @param {string}  [opts.theme]    gold | aurora | rose | cyan | sunset
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderKeepsake({ to, from, photoUrl, dedication, occasionLabel, dateLabel, unlocked, theme = 'gold' }) {
    const palette = THEME_COLORS[theme] || THEME_COLORS.gold;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Best-effort webfont (canvas falls back to Georgia silently if not ready).
    try {
        await document.fonts?.load?.('700 68px "Playfair Display"');
        await document.fonts?.load?.('400 30px "Lato"');
    } catch {}

    // Backdrop: deep vertical wash + two soft light blooms.
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, palette.a);
    bg.addColorStop(0.65, palette.b);
    bg.addColorStop(1, '#040109');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const bloom = (x, y, r, color, alpha) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = alpha;
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
    };
    bloom(W * 0.2, H * 0.16, 620, palette.gold, 0.16);
    bloom(W * 0.86, H * 0.82, 700, palette.soft, 0.1);

    // Deterministic star dust (fixed seed loop, no Math.random for stable exports).
    for (let i = 0; i < 90; i++) {
        const x = ((i * 977) % W) + (i % 3) * 7;
        const y = ((i * 613) % H) + (i % 5) * 3;
        const r = (i % 4) * 0.4 + 0.5;
        ctx.globalAlpha = 0.12 + ((i * 37) % 40) / 160;
        ctx.fillStyle = i % 7 === 0 ? palette.gold : '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Double gold frame (archive-plate feel).
    ctx.strokeStyle = palette.gold;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 3;
    roundRect(ctx, 46, 46, W - 92, H - 92, 40);
    ctx.stroke();
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1.5;
    roundRect(ctx, 66, 66, W - 132, H - 132, 30);
    ctx.stroke();
    ctx.globalAlpha = 1;

    const cx = W / 2;
    let y = 190;

    // Occasion eyebrow
    ctx.textAlign = 'center';
    ctx.fillStyle = palette.soft;
    ctx.font = '700 26px "Lato", system-ui, sans-serif';
    ctx.globalAlpha = 0.9;
    ctx.fillText(`✦ ${String(occasionLabel || 'A Birthday Surprise').toUpperCase()} ✦`, cx, y);
    ctx.globalAlpha = 1;
    y += 118; // → medallion top at 308

    // ---- Pre-measure the whole text stack before placing the medallion ----
    // Long names + long dedications used to push the signature into the footer.
    // Measure first, then let the medallion absorb the slack so the last
    // signature baseline always clears the date row (H - 104).
    ctx.font = '800 84px "Playfair Display", Georgia, serif';
    const nameLines = wrapLines(ctx, `Dear ${String(to || 'You')}`, W - 240, 2);

    let dedLines = [];
    let dedFontPx = 40;
    let dedLineH = 58;
    if (dedication) {
        ctx.font = `italic 400 ${dedFontPx}px "Playfair Display", Georgia, serif`;
        dedLines = wrapLines(ctx, `“${dedication}”`, W - 260, 4);
        if (dedLines.length > 2) {
            dedFontPx = 34;
            dedLineH = 50;
            ctx.font = `italic 400 ${dedFontPx}px "Playfair Display", Georgia, serif`;
            dedLines = wrapLines(ctx, `“${dedication}”`, W - 280, 3, true);
        }
    }

    const nameLineH = 96;
    const nameBlock = nameLines.length * nameLineH + 6;
    const dedBlock = dedLines.length ? dedLines.length * dedLineH + 22 : 0;
    const LAST_BASELINE = H - 152; // 1198 — signature descenders stay clear of the date
    const MEDALLION_TOP = 308;
    let gapBelow = 96;
    let divGap = 74;
    let sigGap = 62;
    let size = LAST_BASELINE - MEDALLION_TOP - gapBelow - nameBlock - dedBlock - divGap - sigGap;
    if (size < 300) {
        // Tight case (two-line name + full dedication): compress the rhythm
        gapBelow = 80;
        divGap = 64;
        sigGap = 54;
        size = LAST_BASELINE - MEDALLION_TOP - gapBelow - nameBlock - dedBlock - divGap - sigGap;
    }
    size = Math.round(Math.max(300, Math.min(460, size)));

    // Portrait medallion
    const img = await loadImage(photoUrl);
    const px = cx - size / 2;
    const py = y;
    ctx.save();
    roundRect(ctx, px, py, size, size, 48);
    ctx.clip();
    if (img) {
        // Cover-fit the photo inside the medallion.
        const scale = Math.max(size / img.width, size / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, px + (size - dw) / 2, py + (size - dh) / 2, dw, dh);
        // Cinematic bottom shade over the photo.
        const shade = ctx.createLinearGradient(0, py + size * 0.55, 0, py + size);
        shade.addColorStop(0, 'rgba(0,0,0,0)');
        shade.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = shade;
        ctx.fillRect(px, py, size, size);
    } else {
        const grad = ctx.createLinearGradient(px, py, px + size, py + size);
        grad.addColorStop(0, '#241540');
        grad.addColorStop(1, '#0c0618');
        ctx.fillStyle = grad;
        ctx.fillRect(px, py, size, size);
        // Gold monogram medallion when there is no (CORS-readable) photo.
        ctx.fillStyle = palette.gold;
        ctx.font = `800 ${Math.round(size * 0.48)}px "Playfair Display", Georgia, serif`;
        ctx.textBaseline = 'middle';
        ctx.fillText((String(to || '♥').trim().charAt(0) || '♥').toUpperCase(), cx, py + size / 2 + 8);
        ctx.textBaseline = 'alphabetic';
    }
    ctx.restore();
    ctx.strokeStyle = palette.gold;
    ctx.lineWidth = 6;
    roundRect(ctx, px, py, size, size, 48);
    ctx.stroke();
    y += size + gapBelow;

    // Wax seal chip on the frame corner (scales with the medallion)
    const sealR = Math.max(30, Math.round(size * 0.1));
    const sealInset = Math.max(18, Math.round(size * 0.057));
    ctx.beginPath();
    ctx.arc(px + size - sealInset, py + size - sealInset, sealR, 0, Math.PI * 2);
    ctx.fillStyle = '#8b1e2a';
    ctx.fill();
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#ffe9b0';
    ctx.font = `800 ${Math.max(26, Math.round(sealR * 0.87))}px "Lato", system-ui, sans-serif`;
    ctx.fillText('♥', px + size - sealInset, py + size - sealInset + Math.round(sealR * 0.3));

    // Recipient name
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 84px "Playfair Display", Georgia, serif';
    for (const line of nameLines) {
        ctx.fillText(line, cx, y);
        y += nameLineH;
    }
    y += 6;

    // Dedication, italic serif (already measured: font size steps down when long)
    if (dedLines.length) {
        ctx.fillStyle = palette.soft;
        ctx.font = `italic 400 ${dedFontPx}px "Playfair Display", Georgia, serif`;
        for (const line of dedLines) {
            ctx.fillText(line, cx, y);
            y += dedLineH;
        }
        y += 22;
    }

    // Divider
    const div = ctx.createLinearGradient(W * 0.25, 0, W * 0.75, 0);
    div.addColorStop(0, 'rgba(0,0,0,0)');
    div.addColorStop(0.5, palette.gold);
    div.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = div;
    ctx.fillRect(W * 0.25, y, W * 0.5, 2);
    y += divGap;

    // Signature
    ctx.fillStyle = palette.ink;
    ctx.font = '400 34px "Lato", system-ui, sans-serif';
    ctx.globalAlpha = 0.85;
    ctx.fillText('with all my heart,', cx, y);
    y += sigGap;
    ctx.globalAlpha = 1;
    ctx.fillStyle = palette.soft;
    ctx.font = '800 56px "Playfair Display", Georgia, serif';
    ctx.fillText(String(from || 'Your Person'), cx, y);

    // Footer: date + brand mark
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '700 24px "Lato", system-ui, sans-serif';
    ctx.fillText(dateLabel || '', cx, H - 104);
    ctx.fillStyle = palette.gold;
    ctx.globalAlpha = 0.9;
    ctx.fillText('✦  birthday gen  ✦', cx, H - 62);
    ctx.globalAlpha = 1;

    // Locked preview: soft tiled watermark + corner lock chip.
    if (!unlocked) {
        ctx.save();
        ctx.globalAlpha = 0.14;
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 44px "Lato", system-ui, sans-serif';
        ctx.translate(cx, H / 2);
        ctx.rotate(-Math.PI / 6);
        for (let row = -3; row <= 3; row++) {
            for (let col = -2; col <= 2; col++) {
                ctx.fillText('PREVIEW', col * 460 - 120, row * 260);
            }
        }
        ctx.restore();
    }

    return canvas;
}

export default function KeepsakeCard({
    to = 'You',
    from = 'Your Person',
    photoUrl = null,
    dedication = '',
    occasionLabel = 'A Birthday Surprise',
    theme = 'gold',
    unlocked = false,
    onUnlock = null,
    compact = false,
    autoRender = true,
}) {
    const canvasRef = useRef(null);
    const [status, setStatus] = useState('idle'); // idle | rendering | ready | saved | error
    const [canShare, setCanShare] = useState(false);
    const blobRef = useRef(null);

    const dateLabel = React.useMemo(() => {
        try {
            return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch {
            return '';
        }
    }, []);

    useEffect(() => {
        try {
            setCanShare(typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare);
        } catch {}
    }, []);

    const paint = useCallback(async () => {
        const target = canvasRef.current;
        if (!target) return;
        setStatus('rendering');
        try {
            const rendered = await renderKeepsake({ to, from, photoUrl, dedication, occasionLabel, dateLabel, unlocked, theme });
            const ctx = target.getContext('2d');
            target.width = W;
            target.height = H;
            ctx.drawImage(rendered, 0, 0);
            blobRef.current = await new Promise((resolve) => {
                try {
                    target.toBlob((b) => resolve(b), 'image/png', 0.94);
                } catch {
                    resolve(null);
                }
            });
            setStatus('ready');
        } catch {
            setStatus('error');
        }
    }, [to, from, photoUrl, dedication, occasionLabel, dateLabel, unlocked, theme]);

    useEffect(() => {
        if (autoRender) paint();
    }, [autoRender, paint]);

    const download = async () => {
        try {
            let blob = blobRef.current;
            if (!blob && canvasRef.current) {
                blob = await new Promise((r) => canvasRef.current.toBlob(r, 'image/png', 0.94));
            }
            if (!blob) throw new Error('no blob');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const safe = String(to || 'keepsake').replace(/[^\w-]+/g, '-').toLowerCase();
            a.href = url;
            a.download = `birthday-keepsake-${safe}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 4000);
            setStatus('saved');
            setTimeout(() => setStatus('ready'), 2600);
        } catch {
            setStatus('error');
        }
    };

    const share = async () => {
        try {
            let blob = blobRef.current;
            if (!blob && canvasRef.current) blob = await new Promise((r) => canvasRef.current.toBlob(r, 'image/png', 0.94));
            if (!blob) throw new Error('no blob');
            const file = new File([blob], `birthday-keepsake-${Date.now()}.png`, { type: 'image/png' });
            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({ files: [file], title: `A keepsake for ${to}` });
            } else {
                await download();
            }
        } catch {
            // User cancelled the share sheet, or share is unsupported: never error-shout.
        }
    };

    return (
        <div className={`relative mx-auto w-full ${compact ? 'max-w-[260px]' : 'max-w-[320px]'}`}>
      {/* The plate itself */}
            <div className="relative overflow-hidden rounded-[1.6rem] border border-[rgba(242,193,78,0.4)] bg-black/50 shadow-[0_30px_80px_rgba(0,0,0,0.65)]">
                <canvas
                    ref={canvasRef}
                    width={W}
                    height={H}
                    className="block h-auto w-full"
                    aria-label={`Keepsake card for ${to}${unlocked ? '' : ' (preview)'}`}
                    role="img"
                />
                {status === 'rendering' && (
                    <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-[2px]">
                        <Loader2 className="h-7 w-7 animate-spin text-[#f2c14e]" aria-hidden="true" />
                    </div>
                )}
                {!unlocked && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-10 text-center">
                        <p className="inline-flex items-center gap-1.5 rounded-full border border-[#f2c14e]/40 bg-black/60 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#f7dc9a] backdrop-blur-md">
                            <Lock className="h-3 w-3" aria-hidden="true" /> Clean copy unlocks with the gift
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                {unlocked ? (
                    <>
                        <button
                            type="button"
                            onClick={download}
                            disabled={status === 'rendering'}
                            className="prm-shimmer-btn inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f2c14e] to-[#fb7185] px-5 py-3 text-sm font-extrabold text-[#241031] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                        >
                            {status === 'saved' ? <Check className="h-4 w-4" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
                            {status === 'saved' ? 'Saved to your photos' : 'Save keepsake image'}
                        </button>
                        {(canShare || typeof navigator === 'undefined') && (
                            <button
                                type="button"
                                onClick={share}
                                disabled={status === 'rendering'}
                                className="keepsake-ghost-btn inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition-colors disabled:opacity-60"
                            >
                                <Share2 className="h-4 w-4" aria-hidden="true" /> Share
                            </button>
                        )}
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={onUnlock || undefined}
                        className="prm-shimmer-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f2c14e] to-[#fb7185] px-5 py-3 text-sm font-extrabold text-[#241031] transition-transform hover:scale-[1.02] active:scale-95"
                    >
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        Unlock the clean keepsake
                    </button>
                )}
            </div>
            <p className="mt-2 text-center text-[11px] leading-relaxed opacity-70">
                {unlocked
                    ? `A 1080 × 1350 image, made to be set as a wallpaper or posted for ${to}.`
                    : 'Free preview. The clean, watermark-free image is part of the paid keepsake.'}
            </p>
        </div>
    );
}
