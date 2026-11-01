'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Loader2, Mail, Check, X, Send } from 'lucide-react';
import { track } from '@/lib/track';
import { isValidEmail } from '@/lib/utils';
import { loadBuyerContact } from '@/lib/payments';

/**
 * Scheduled delivery (VIP owner only).
 *
 * Two honest paths, matching the backend:
 *   - recipient email  → we send the card automatically at the chosen time.
 *   - creator email    → we email the creator a ready-to-send WhatsApp link.
 *
 * No WhatsApp provider is connected, so the UI never promises an automatic
 * WhatsApp message. It says exactly which of the two things will happen.
 */

function defaultLocalDateTime(birthdayDate) {
    const now = new Date();
    let target = null;
    if (birthdayDate) {
        // The API can hand us a full ISO timestamp; keep only the date part so
        // appending a local time never produces an Invalid Date.
        const dateOnly = String(birthdayDate).slice(0, 10);
        const parsed = new Date(`${dateOnly}T09:00:00`);
        if (!Number.isNaN(parsed.getTime()) && parsed.getTime() > now.getTime() + 5 * 60 * 1000) {
            target = parsed;
        }
    }
    if (!target) {
        target = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        target.setHours(9, 0, 0, 0);
    }
    const pad = (n) => String(n).padStart(2, '0');
    return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`;
}

function formatSchedule(value) {
    if (!value) return '';
    try {
        return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
    } catch {
        return '';
    }
}

export default function DeliveryScheduler({ pageId, isVip, birthdayDate = null, defaultCreatorEmail = '' }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [delivery, setDelivery] = useState(null);
    const [scheduledAt, setScheduledAt] = useState(() => defaultLocalDateTime(birthdayDate));
    const [recipientEmail, setRecipientEmail] = useState('');
    const [creatorEmail, setCreatorEmail] = useState(defaultCreatorEmail || '');
    const [status, setStatus] = useState({ phase: 'idle', message: '' });

    const timezone = useMemo(() => {
        try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'; } catch { return 'Asia/Kolkata'; }
    }, []);

    const editToken = () => {
        try { return localStorage.getItem(`bgen_edit_token_${pageId}`) || ''; } catch { return ''; }
    };

    // Prefill the creator's email from the same browser-local receipt details
    // used by checkout, so the WhatsApp-assist path is one tap away.
    useEffect(() => {
        if (defaultCreatorEmail) return;
        try {
            const saved = loadBuyerContact();
            if (saved.email) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCreatorEmail((current) => current || saved.email);
            }
        } catch { }
    }, [defaultCreatorEmail]);

    useEffect(() => {
        if (!isVip || !pageId) return;
        let alive = true;
        const token = editToken();
        if (!token) return;
        fetch(`/api/delivery?pageId=${encodeURIComponent(pageId)}&token=${encodeURIComponent(token)}`)
            .then((r) => r.json())
            .then((data) => {
                if (!alive || !data?.success) return;
                if (data.delivery && data.delivery.status !== 'cancelled') {
                    setDelivery(data.delivery);
                    setRecipientEmail(data.delivery.recipientEmail || '');
                    setCreatorEmail(data.delivery.creatorEmail || '');
                }
            })
            .catch(() => { });
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVip, pageId]);

    if (!isVip) return null;

    const save = async () => {
        const token = editToken();
        if (!token) {
            setStatus({ phase: 'error', message: 'Open this card from the browser where you created it to schedule delivery.' });
            return;
        }
        if (!scheduledAt) {
            setStatus({ phase: 'error', message: 'Pick a delivery date and time.' });
            return;
        }
        const to = String(recipientEmail || '').trim();
        const cc = String(creatorEmail || '').trim();
        if (to && !isValidEmail(to)) {
            setStatus({ phase: 'error', message: 'Enter a valid recipient email, or leave it blank.' });
            return;
        }
        if (cc && !isValidEmail(cc)) {
            setStatus({ phase: 'error', message: 'Enter a valid email for your send reminder.' });
            return;
        }
        if (!to && !cc) {
            setStatus({ phase: 'error', message: 'Add the recipient email for automatic delivery, or your own email for a send reminder.' });
            return;
        }

        setLoading(true);
        setStatus({ phase: 'saving', message: 'Saving the schedule…' });
        try {
            const res = await fetch('/api/delivery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pageId,
                    editToken: token,
                    scheduledAt: new Date(scheduledAt).toISOString(),
                    timezone,
                    recipientEmail: to || null,
                    creatorEmail: cc || null,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) throw new Error(data.error || 'Could not save the schedule.');
            setDelivery(data.delivery);
            setStatus({
                phase: 'saved',
                message: to
                    ? `Scheduled. We'll email the card to ${to} within 5 minutes of the chosen time.`
                    : `Scheduled. We'll email you a ready-to-send WhatsApp link within 5 minutes of the chosen time.`,
            });
            track('delivery_scheduled');
        } catch (err) {
            setStatus({ phase: 'error', message: err?.message || 'Could not save the schedule.' });
        } finally {
            setLoading(false);
        }
    };

    const cancel = async () => {
        const token = editToken();
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/delivery?pageId=${encodeURIComponent(pageId)}&token=${encodeURIComponent(token)}`, {
                method: 'DELETE',
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) throw new Error(data.error || 'Could not cancel the schedule.');
            setDelivery(null);
            setStatus({ phase: 'saved', message: 'Scheduled delivery cancelled.' });
            track('delivery_cancelled');
        } catch (err) {
            setStatus({ phase: 'error', message: err?.message || 'Could not cancel the schedule.' });
        } finally {
            setLoading(false);
        }
    };

    const active = delivery && delivery.status !== 'cancelled';

    return (
        <section className="mb-14" aria-label="Scheduled delivery">
            <div className="mx-auto max-w-xl rounded-2xl border border-purple-200 bg-white/80 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
                    aria-expanded={open}
                >
                    <span className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                            <CalendarClock className="w-4 h-4" aria-hidden="true" />
                        </span>
                        <span>
                            <span className="block text-sm font-extrabold text-gray-900">Schedule the delivery</span>
                            <span className="block text-[11px] text-gray-500 mt-0.5">
                                {active
                                    ? `Set for ${formatSchedule(active.scheduledAt)}`
                                    : 'Send it at the right moment, even if you are busy.'}
                            </span>
                        </span>
                    </span>
                    <span className="text-[11px] font-bold text-purple-700">{open ? 'Close' : active ? 'Edit' : 'Set up'}</span>
                </button>

                {open && (
                    <div className="mt-4 space-y-3">
                        {active && (
                            <div className="rounded-xl bg-purple-50 border border-purple-200 px-3 py-2.5 text-[11px] text-purple-900 flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
                                <span>
                                    <strong>{formatSchedule(active.scheduledAt)}</strong>
                                    {active.recipientEmail
                                        ? ` · email to ${active.recipientEmail}`
                                        : ' · WhatsApp reminder to you'}
                                    {active.status === 'sent' ? ' · sent' : ''}
                                </span>
                            </div>
                        )}

                        <label className="block">
                            <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Delivery time</span>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <span className="block text-[10px] text-gray-400 mt-1">
                                Times are in {timezone}. Cards go out on our next delivery sweep — within 5 minutes of this time.
                            </span>
                        </label>

                        <label className="block">
                            <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                Recipient email <span className="normal-case font-normal text-gray-400">(best — sends automatically)</span>
                            </span>
                            <input
                                type="email"
                                inputMode="email"
                                autoComplete="off"
                                placeholder="their@email.com"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                        </label>

                        <label className="block">
                            <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                Your email <span className="normal-case font-normal text-gray-400">(for a WhatsApp send reminder)</span>
                            </span>
                            <input
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                placeholder="you@email.com"
                                value={creatorEmail}
                                onChange={(e) => setCreatorEmail(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                        </label>

                        <p className="text-[10.5px] text-gray-500 leading-relaxed flex items-start gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <span>
                                With their email, the card sends itself. Without it, we email you a ready-to-send WhatsApp link — we never message them from an unknown number.
                            </span>
                        </p>

                        {status.phase === 'error' && (
                            <p className="text-xs font-semibold text-rose-600">{status.message}</p>
                        )}
                        {status.phase === 'saved' && (
                            <p className="text-xs font-semibold text-emerald-700">{status.message}</p>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={save}
                                disabled={loading}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2.5 text-xs font-extrabold transition-colors disabled:opacity-60 cursor-pointer"
                            >
                                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                {active ? 'Update schedule' : 'Schedule delivery'}
                            </button>
                            {active && (
                                <button
                                    type="button"
                                    onClick={cancel}
                                    disabled={loading}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2.5 text-xs font-bold transition-colors disabled:opacity-60 cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" /> Cancel
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
