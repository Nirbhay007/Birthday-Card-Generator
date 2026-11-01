'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Crown, Check, Copy, Sparkles, ArrowRight, X, Eye, Bell, CalendarDays, Users, Loader2, AlertTriangle } from 'lucide-react';
import {
    detectRegion,
    getVipCardPrice,
    getGroupCardPrice,
    createPremiumOrder,
    openRazorpayCheckout,
    verifyPremiumPayment,
    pollOrderStatus,
    loadBuyerContact,
    saveBuyerContact,
    formatBuyerContact,
} from '@/lib/payments';
import { isValidEmail } from '@/lib/utils';
import { track } from '@/lib/track';
import { trackShare } from '@/lib/shareTracking';

export default function PostCreationModal({
    isOpen,
    onClose,
    card, // { id, recipientName, senderName, theme, music, photosCount }
}) {
    const [copied, setCopied] = useState(false);
    const [region] = useState(() => (typeof window !== 'undefined' ? detectRegion() : 'IN'));
    const [status, setStatus] = useState({ phase: 'idle', message: '' });
    const [upgraded, setUpgraded] = useState(false);
    const [receiptExpected, setReceiptExpected] = useState(false);
    const [buyerContact, setBuyerContact] = useState({ name: '', email: '', phone: '' });
    // Origin resolves after mount so team/server share links and the first
    // client render agree (no hydration mismatch on dev or preview hosts).
    const [origin, setOrigin] = useState(null);

    // Reminder capture at the success moment (default-on). This is the moment
    // the creator has just seen the finished card, so the promise is concrete.
    const [remindNextYear, setRemindNextYear] = useState(true);
    const [reminderEmail, setReminderEmail] = useState('');
    const [reminderPhone, setReminderPhone] = useState('');
    const [reminderDate, setReminderDate] = useState(card?.birthdayDate || '');
    const [reminderStatus, setReminderStatus] = useState({ phase: 'idle', message: '' });
    const reminderSavedRef = useRef(false);
    const reminderSavingRef = useRef(false);

    // Group card purchase (separate paid SKU from VIP).
    const [groupStatus, setGroupStatus] = useState({ phase: 'idle', message: '' });
    const [groupUnlocked, setGroupUnlocked] = useState(!!card?.isGroup);
    const [groupCopied, setGroupCopied] = useState(false);

    // Recovery link (?resume=orderId&rt=token): the checkout is still open.
    const [resumeInfo, setResumeInfo] = useState(null);
    const [resumeLoading, setResumeLoading] = useState(false);
    const [uploadWarning, setUploadWarning] = useState(0);
    const photoUpsellShownRef = useRef(false);

    useEffect(() => {
        // Hydration-safe: origin and receipt details are read after mount.
        /* eslint-disable react-hooks/set-state-in-effect */
        try { setOrigin(window.location.origin); } catch {}
        // Reuse receipt details entered on the /premium paywall (same browser)
        // so a card upgrade does not ask for them again.
        try {
            const saved = loadBuyerContact();
            setBuyerContact(saved);
            if (saved.email) setReminderEmail(saved.email);
            if (saved.phone) setReminderPhone(saved.phone);
        } catch {}
        try {
            const q = new URLSearchParams(window.location.search);
            const warning = parseInt(q.get('uploadWarning') || '0', 10);
            if (Number.isFinite(warning) && warning > 0) setUploadWarning(warning);
            const resume = q.get('resume');
            const rt = q.get('rt');
            if (resume && rt) {
                setResumeLoading(true);
                fetch(`/api/premium/order/resume?orderId=${encodeURIComponent(resume)}&rt=${encodeURIComponent(rt)}`)
                    .then((r) => r.json())
                    .then((data) => {
                        if (data?.success && !data.paid && data.keyId) {
                            // Keep the exact order + its poll token so "resume"
                            // reopens the same Razorpay order instead of
                            // creating a duplicate one.
                            setResumeInfo({ ...data.order, keyId: data.keyId, pollToken: rt });
                            track('checkout_resume_shown', { path: '/b/[id]' });
                        }
                    })
                    .catch(() => { })
                    .finally(() => setResumeLoading(false));
            }
        } catch {}
        /* eslint-enable react-hooks/set-state-in-effect */
    }, []);

    useEffect(() => {
        if (!isOpen || !card) return;

        // Celebratory confetti burst on open
        try {
            confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 },
                disableForReducedMotion: true,
            });
        } catch {}
    }, [isOpen, card]);

    useEffect(() => {
        if (!isOpen || !card || photoUpsellShownRef.current) return;
        const count = Number(card.photosCount) || 0;
        if (count > 3 && !card.isVip && !card.isVipPro && !card.isGroup) {
            photoUpsellShownRef.current = true;
            track('photo_cap_upsell_shown');
        }
    }, [isOpen, card]);

    if (!isOpen || !card) return null;

    const baseUrl = origin || 'https://birthday.nirbhay.online';
    const cardUrl = `${baseUrl}/b/${card.id}`;
    const groupUrl = `${baseUrl}/b/${card.id}/add`;
    const price = getVipCardPrice(region);
    const groupPrice = getGroupCardPrice(region);
    const isVip = upgraded || groupUnlocked || !!card?.isVip || !!card?.isVipPro;
    const isGroup = groupUnlocked || !!card?.isGroup;
    const photosCount = Number(card?.photosCount) || 0;
    const lockedPhotoCount = isVip ? 0 : Math.max(0, photosCount - 3);

    const shareText = `Hey ${card.recipientName || 'there'}! 🎂 I made something special for your birthday. Open this on your phone: ${cardUrl} ✨`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

    const handleCopy = async () => {
        let copiedOk = false;
        try {
            await navigator.clipboard.writeText(cardUrl);
            copiedOk = true;
        } catch {
            try {
                const el = document.createElement('textarea');
                el.value = cardUrl;
                document.body.appendChild(el);
                el.select();
                copiedOk = document.execCommand('copy');
                document.body.removeChild(el);
            } catch { }
        }
        // Count the creator's primary distribution action. Deduped per
        // session/channel so repeated copies only count once.
        if (copiedOk) {
            trackShare({ pageId: card.id, channel: 'copy', source: 'post_creation' });
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const celebrateVip = () => {
        setUpgraded(true);
        if (String(buyerContact.email || '').trim()) setReceiptExpected(true);
        try { localStorage.setItem(`bgen_owner_${card.id}`, '1'); } catch {}
        setStatus({ phase: 'success', message: 'VIP Activated!' });
        track('upgrade_success');
        try {
            const premiumTrack = card.originalMusic || card.music || 'strings';
            window.dispatchEvent(new CustomEvent('bgen:vip_activated', { detail: { track: premiumTrack } }));
        } catch {}
        try {
            confetti({
                particleCount: 200,
                spread: 90,
                origin: { y: 0.5 },
                colors: ['#f2c14e', '#fb7185', '#a855f7', '#ffd700'],
                disableForReducedMotion: true,
            });
        } catch {}
    };

    const handleUpgrade = async () => {
        // Validate the optional receipt address before opening checkout, so a
        // typo cannot cost the buyer their payment confirmation.
        const receiptEmail = String(buyerContact.email || '').trim();
        if (receiptEmail && !isValidEmail(receiptEmail)) {
            setStatus({ phase: 'error', message: 'Enter a valid email for your receipt, or leave it blank.' });
            return;
        }
        const contact = { ...buyerContact, email: receiptEmail };
        try { saveBuyerContact(contact); } catch {}

        track('upgrade_click');
        setStatus({ phase: 'loading', message: 'Connecting to checkout…' });
        try {
            const order = await createPremiumOrder(region, { tier: 'card_vip', pageId: card.id, buyerContact: formatBuyerContact(contact) });
            setStatus({ phase: 'checkout', message: 'Opening secure checkout…' });

            // Background poll for UPI recovery (browser may lose the Razorpay
            // callback when the user switches to their UPI app).
            const abort = new AbortController();
            const poll = pollOrderStatus(order.orderId, { token: order.pollToken, signal: abort.signal });

            let callbackOk = false;
            try {
                const savedContact = contact;
                const resp = await openRazorpayCheckout({
                    order,
                    keyId: order.keyId,
                    buyerName: card.senderName || savedContact.name || '',
                    buyerEmail: savedContact.email,
                    buyerPhone: savedContact.phone,
                    region,
                });
                callbackOk = true;
                abort.abort();

                setStatus({ phase: 'verifying', message: 'Activating your VIP surprise…' });

                await verifyPremiumPayment({
                    provider: 'razorpay',
                    orderId: resp.razorpay_order_id,
                    paymentId: resp.razorpay_payment_id,
                    signature: resp.razorpay_signature,
                    pageId: card.id,
                    tier: 'card_vip',
                });

                celebrateVip();
            } catch (modalErr) {
                if (callbackOk) {
                    track('upgrade_order_failed');
                    setStatus({ phase: 'error', message: modalErr?.message || 'Verification failed.' });
                    return;
                }

                // Explicit decline: no payment is pending, so show the real
                // reason instead of waiting on the UPI recovery poll.
                if (modalErr?.code && modalErr.code !== 'DISMISSED') {
                    track('upgrade_order_failed');
                    abort.abort();
                    setStatus({ phase: 'error', message: modalErr?.message || 'Payment failed. No money moved.' });
                    return;
                }

                // Razorpay modal dismissed — check if the background poll caught the payment.
                setStatus({ phase: 'verifying', message: 'Checking payment status…' });
                const pollResult = await Promise.race([
                    poll,
                    new Promise((r) => setTimeout(() => r(null), 15_000)),
                ]);
                abort.abort();
                if (pollResult?.unlockKey) {
                    celebrateVip();
                } else {
                    track('upgrade_order_failed');
                    setStatus({ phase: 'error', message: 'Payment window closed. If money was deducted, refresh this page in a minute and your VIP upgrade will activate automatically.' });
                }
            }
        } catch (e) {
            if (e?.code === 'TEST_MODE') {
                try {
                    await verifyPremiumPayment({ provider: 'test', pageId: card.id, tier: 'card_vip' });
                    setUpgraded(true);
                    setStatus({ phase: 'success', message: 'VIP Activated in Test Mode!' });
                    try {
                        const premiumTrack = card.originalMusic || card.music || 'strings';
                        window.dispatchEvent(new CustomEvent('bgen:vip_activated', { detail: { track: premiumTrack } }));
                    } catch {}
                } catch {
                    setStatus({ phase: 'error', message: 'Test activation failed.' });
                }
            } else {
                track('upgrade_order_failed');
                setStatus({ phase: 'error', message: e?.message || 'Payment cancelled.' });
            }
        }
    };

    const handleGroupUpgrade = async () => {
        const receiptEmail = String(buyerContact.email || '').trim();
        if (receiptEmail && !isValidEmail(receiptEmail)) {
            setGroupStatus({ phase: 'error', message: 'Enter a valid email for your receipt, or leave it blank.' });
            return;
        }
        const contact = { ...buyerContact, email: receiptEmail };
        try { saveBuyerContact(contact); } catch {}

        track('group_card_click');
        setGroupStatus({ phase: 'loading', message: 'Connecting to checkout…' });
        try {
            const order = await createPremiumOrder(region, {
                tier: 'group_card',
                pageId: card.id,
                buyerContact: formatBuyerContact(contact),
            });
            setGroupStatus({ phase: 'checkout', message: 'Opening secure checkout…' });

            const abort = new AbortController();
            const poll = pollOrderStatus(order.orderId, { token: order.pollToken, signal: abort.signal });

            let callbackOk = false;
            try {
                const resp = await openRazorpayCheckout({
                    order,
                    keyId: order.keyId,
                    buyerName: card.senderName || contact.name || '',
                    buyerEmail: contact.email,
                    buyerPhone: contact.phone,
                    region,
                });
                callbackOk = true;
                abort.abort();

                setGroupStatus({ phase: 'verifying', message: 'Opening the contributor page…' });
                await verifyPremiumPayment({
                    provider: 'razorpay',
                    orderId: resp.razorpay_order_id,
                    paymentId: resp.razorpay_payment_id,
                    signature: resp.razorpay_signature,
                    pageId: card.id,
                    tier: 'group_card',
                });
                setGroupUnlocked(true);
                setGroupStatus({ phase: 'success', message: 'Group card activated!' });
                track('group_card_success');
                try {
                    confetti({
                        particleCount: 180,
                        spread: 90,
                        origin: { y: 0.5 },
                        colors: ['#38bdf8', '#f2c14e', '#a855f7', '#fb7185'],
                        disableForReducedMotion: true,
                    });
                } catch {}
            } catch (modalErr) {
                if (callbackOk) {
                    setGroupStatus({ phase: 'error', message: modalErr?.message || 'Verification failed.' });
                    return;
                }
                if (modalErr?.code && modalErr.code !== 'DISMISSED') {
                    abort.abort();
                    setGroupStatus({ phase: 'error', message: modalErr?.message || 'Payment failed. No money moved.' });
                    return;
                }
                setGroupStatus({ phase: 'verifying', message: 'Checking payment status…' });
                const pollResult = await Promise.race([
                    poll,
                    new Promise((r) => setTimeout(() => r(null), 15_000)),
                ]);
                abort.abort();
                if (pollResult?.unlockKey) {
                    setGroupUnlocked(true);
                    setGroupStatus({ phase: 'success', message: 'Group card activated!' });
                    track('group_card_success');
                } else {
                    setGroupStatus({ phase: 'error', message: 'Payment window closed. If money was deducted, refresh in a minute and the group card will activate automatically.' });
                }
            }
        } catch (e) {
            if (e?.code === 'TEST_MODE') {
                try {
                    await verifyPremiumPayment({ provider: 'test', pageId: card.id, tier: 'group_card' });
                    setGroupUnlocked(true);
                    setGroupStatus({ phase: 'success', message: 'Group card activated in Test Mode!' });
                } catch {
                    setGroupStatus({ phase: 'error', message: 'Test activation failed.' });
                }
            } else {
                setGroupStatus({ phase: 'error', message: e?.message || 'Payment cancelled.' });
            }
        }
    };

    // Resume the exact unpaid order from the recovery email. Same Razorpay
    // order id and amount — no duplicate order, no double charge.
    const handleResume = async () => {
        if (!resumeInfo?.orderId || !resumeInfo?.keyId || !resumeInfo?.pollToken) return;
        const tier = resumeInfo.tier === 'group_card' ? 'group_card' : 'card_vip';
        const setPhase = tier === 'group_card' ? setGroupStatus : setStatus;

        const receiptEmail = String(buyerContact.email || '').trim();
        if (receiptEmail && !isValidEmail(receiptEmail)) {
            setPhase({ phase: 'error', message: 'Enter a valid email for your receipt, or leave it blank.' });
            return;
        }
        const contact = { ...buyerContact, email: receiptEmail };
        try { saveBuyerContact(contact); } catch {}

        track('checkout_resume_click', { path: '/b/[id]' });
        setPhase({ phase: 'checkout', message: 'Reopening your saved checkout…' });

        const order = {
            orderId: resumeInfo.orderId,
            amount: resumeInfo.amount,
            currency: resumeInfo.currency,
            pollToken: resumeInfo.pollToken,
        };
        const abort = new AbortController();
        const poll = pollOrderStatus(order.orderId, { token: order.pollToken, signal: abort.signal });
        let callbackOk = false;

        const finish = () => {
            setResumeInfo(null);
            if (tier === 'group_card') {
                setGroupUnlocked(true);
                setGroupStatus({ phase: 'success', message: 'Group card activated!' });
                track('group_card_success');
            } else {
                celebrateVip();
            }
        };

        try {
            const resp = await openRazorpayCheckout({
                order,
                keyId: resumeInfo.keyId,
                buyerName: card.senderName || contact.name || '',
                buyerEmail: contact.email,
                buyerPhone: contact.phone,
                region: order.currency === 'INR' ? 'IN' : 'INTL',
            });
            callbackOk = true;
            abort.abort();

            setPhase({
                phase: 'verifying',
                message: tier === 'group_card' ? 'Opening the contributor page…' : 'Activating your VIP surprise…',
            });
            await verifyPremiumPayment({
                provider: 'razorpay',
                orderId: resp.razorpay_order_id,
                paymentId: resp.razorpay_payment_id,
                signature: resp.razorpay_signature,
                pageId: card.id,
                tier,
            });
            finish();
        } catch (modalErr) {
            if (callbackOk) {
                setPhase({ phase: 'error', message: modalErr?.message || 'Verification failed.' });
                return;
            }
            if (modalErr?.code && modalErr.code !== 'DISMISSED') {
                abort.abort();
                setPhase({ phase: 'error', message: modalErr?.message || 'Payment failed. No money moved.' });
                return;
            }
            setPhase({ phase: 'verifying', message: 'Checking payment status…' });
            const pollResult = await Promise.race([
                poll,
                new Promise((r) => setTimeout(() => r(null), 15_000)),
            ]);
            abort.abort();
            if (pollResult?.unlockKey) {
                finish();
            } else {
                setPhase({ phase: 'error', message: 'Payment window closed. Your saved checkout is still here — try again anytime.' });
            }
        }
    };

    const copyGroupLink = async () => {
        try {
            await navigator.clipboard.writeText(groupUrl);
            setGroupCopied(true);
            setTimeout(() => setGroupCopied(false), 2200);
        } catch {}
    };

    const saveReminder = async ({ force = false } = {}) => {
        if (!card?.id || reminderSavingRef.current) return;
        if (reminderSavedRef.current && !force) return;

        const email = String(reminderEmail || buyerContact.email || '').trim();
        // Never promise a reminder we cannot deliver. If the box is ticked
        // but the email is blank/invalid, leave it unsaved instead of failing
        // the close action.
        if (remindNextYear && !isValidEmail(email)) return;

        reminderSavingRef.current = true;
        setReminderStatus({ phase: 'saving', message: 'Saving your reminder…' });
        try {
            let editToken = null;
            try { editToken = localStorage.getItem(`bgen_edit_token_${card.id}`); } catch { }
            const payload = {
                ...(editToken ? { editToken } : {}),
                remindNextYear: !!remindNextYear,
            };
            if (remindNextYear) {
                payload.reminderEmail = email;
                if (reminderDate) payload.birthdayDate = reminderDate;
                if (String(reminderPhone || '').trim()) payload.reminderPhone = String(reminderPhone).trim();
            }
            const res = await fetch(`/api/birthday/${card.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) throw new Error(data.error || 'Could not save your reminder.');
            reminderSavedRef.current = true;
            setReminderStatus({
                phase: 'saved',
                message: remindNextYear ? 'Reminder saved. One email, in the week before.' : 'Reminder turned off.',
            });
            track(remindNextYear ? 'reminder_optin' : 'reminder_optout');
            if (remindNextYear) saveBuyerContact({ ...buyerContact, email });
        } catch (err) {
            setReminderStatus({ phase: 'error', message: err?.message || 'Could not save your reminder.' });
        } finally {
            reminderSavingRef.current = false;
        }
    };

    const handleViewCard = async () => {
        // The reminder is the one thing that must survive the close. Save it
        // first, but never block the creator on a failed network call.
        await saveReminder().catch(() => { });
        if (upgraded || groupUnlocked) {
            // Force a fresh server render. Group purchases used to fall through
            // to onClose(), which kept the pre-payment page on screen until a
            // manual refresh.
            window.location.href = `/b/${card.id}?vip=1&fresh=${Date.now()}`;
            return;
        }
        if (onClose) {
            onClose();
        } else {
            window.location.href = `/b/${card.id}`;
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-modal-title"
        >
            <div className="relative w-full max-w-lg bg-gradient-to-b from-[#190e2b] via-[#120a21] to-[#0a0514] text-white border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden max-h-[92vh] overflow-y-auto">
                {/* Background decorative glow */}
                <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

                {/* Close button */}
                <button
                    type="button"
                    onClick={handleViewCard}
                    className="absolute top-4 right-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center pt-2 pb-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 shadow-lg mb-3">
                        <Sparkles className="w-7 h-7 text-gray-950 animate-pulse" />
                    </div>
                    <h2 id="success-modal-title" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        Surprise is Ready! 🎉
                    </h2>
                    <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
                        Personalized birthday card for <strong className="text-amber-300 font-bold">{card.recipientName}</strong>
                    </p>
                </div>

                {/* Partial-upload honesty: the card is ready, but be clear
                    about what did not make it instead of silently dropping it. */}
                {uploadWarning > 0 && (
                    <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-start gap-2 text-xs text-amber-100">
                        <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                        <span>
                            <strong>{uploadWarning} photo{uploadWarning === 1 ? '' : 's'} couldn&apos;t upload.</strong>{' '}
                            Your card is ready with the rest. You can add the missing ones later from Customize.
                        </span>
                    </div>
                )}

                {/* Abandoned-checkout resume. The link is signed and tied to
                    the exact order; this is the second chance, not a nag. */}
                {resumeLoading && (
                    <div className="mb-3 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs text-purple-200">
                        <Loader2 className="w-4 h-4 animate-spin" /> Checking your saved checkout…
                    </div>
                )}
                {resumeInfo && (
                    <div className="mb-3 p-3.5 rounded-2xl bg-gradient-to-br from-amber-400/15 to-pink-500/10 border border-amber-400/40">
                        <p className="text-xs font-extrabold text-amber-200">
                            Your {resumeInfo.tier === 'group_card' ? 'group card' : 'VIP'} checkout is still waiting
                        </p>
                        <p className="text-[11px] text-purple-100/80 mt-1 leading-relaxed">
                            Nothing was charged. Pick up where you left off — the card and your details are saved.
                        </p>
                        <button
                            type="button"
                            onClick={handleResume}
                            className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 px-3 py-2.5 text-xs font-extrabold text-gray-950 hover:brightness-105 transition-all cursor-pointer"
                        >
                            <Crown className="w-4 h-4" />
                            Finish my {resumeInfo.tier === 'group_card' ? 'group card' : 'VIP'} upgrade
                        </button>
                    </div>
                )}

                {/* Link & WhatsApp Share Box */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80">
                        1. Share with {card.recipientName}
                    </p>
                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 font-mono select-all overflow-x-auto">
                        <span className="truncate flex-1">{cardUrl}</span>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackShare({ pageId: card.id, channel: 'whatsapp', source: 'post_creation' })}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-sm font-bold shadow-md hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                    >
                        <span>📲 Share to WhatsApp</span>
                    </a>

                    {/* Creator reassurance notice */}
                    <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-400/20 flex items-start gap-2 text-xs text-purple-200/90 leading-relaxed">
                        <Eye className="w-3.5 h-3.5 text-purple-300 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <div>
                                <span className="font-bold text-white">Creator Notice: </span>
                                Editing & customize controls are visible only to you on this device. When <strong>{card.recipientName}</strong> opens this link, they see only the clean, magical birthday card!
                            </div>
                            <div className="pt-1 flex items-center gap-2 flex-wrap">
                                <a
                                    href={`${cardUrl}?viewer=1`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 underline"
                                >
                                    <span>Preview Recipient View ↗</span>
                                </a>
                                <span className="text-purple-400/70 text-[10px]">• Or test link in Incognito / Private window</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reminder capture at the success moment. Default-on because
                    this is when the creator has just seen the finished card
                    and the promise ("we'll remind you next year") is concrete. */}
                <div className="mt-4 p-3.5 rounded-2xl bg-purple-950/40 border border-purple-400/25">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={remindNextYear}
                            onChange={(e) => {
                                setRemindNextYear(e.target.checked);
                                setReminderStatus({ phase: 'idle', message: '' });
                            }}
                            className="mt-0.5 w-4 h-4 text-purple-500 rounded border-white/20 bg-black/30 focus:ring-purple-400 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Bell className="w-3.5 h-3.5 text-amber-300" />
                            Remind me in the week before their next birthday
                        </span>
                    </label>
                    <p className="text-[10.5px] text-purple-200/70 pl-6 mt-1 leading-relaxed">
                        One email a year for this card. Your photos stay saved too. Unsubscribe anytime.
                    </p>
                    {remindNextYear && (
                        <div className="pl-6 mt-2.5 space-y-2">
                            {!card.birthdayDate && (
                                <label className="block">
                                    <span className="sr-only">Birthday date</span>
                                    <div className="relative">
                                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-300/60" />
                                        <input
                                            type="date"
                                            value={reminderDate}
                                            onChange={(e) => setReminderDate(e.target.value)}
                                            min={new Date().toISOString().slice(0, 10)}
                                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                                            aria-label="Birthday date for the reminder"
                                        />
                                    </div>
                                </label>
                            )}
                            <input
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={reminderEmail}
                                onChange={(e) => {
                                    setReminderEmail(e.target.value);
                                    if (reminderStatus.phase === 'error') setReminderStatus({ phase: 'idle', message: '' });
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                                aria-label="Email for the annual reminder"
                            />
                            <input
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                placeholder="WhatsApp number (optional)"
                                value={reminderPhone}
                                onChange={(e) => setReminderPhone(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                                aria-label="Optional WhatsApp number"
                            />
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => saveReminder({ force: true })}
                                    disabled={reminderStatus.phase === 'saving'}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 px-2.5 py-1.5 text-[11px] font-bold text-white transition-colors disabled:opacity-60 cursor-pointer"
                                >
                                    {reminderStatus.phase === 'saving' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3 text-amber-300" />}
                                    Save reminder
                                </button>
                                {reminderStatus.message && (
                                    <span className={`text-[10px] font-semibold ${reminderStatus.phase === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}>
                                        {reminderStatus.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* VIP Upgrade Box */}
                <div className="mt-4 p-4 sm:p-5 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-purple-900/20 to-black/40 relative overflow-hidden">
                    {/* VIP Ribbon badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            {isVip ? 'VIP Active' : 'Special Launch Offer'}
                        </span>
                        {!isVip && (
                            <span className="text-xs text-amber-300/90 font-bold">
                                <s className="opacity-50 text-[10px] mr-1">{price.mrpLabel}</s> {price.label}
                            </span>
                        )}
                    </div>

                    {isVip ? (
                        <div className="py-2 text-center space-y-3">
                            <p className="text-base font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
                                <Crown className="w-5 h-5 text-amber-400" /> VIP Activated Successfully!
                            </p>
                            <p className="text-xs text-purple-200/90 leading-relaxed">
                                {card.recipientName}&apos;s card now shines with the Golden Crown, illuminated atmosphere, and clean ad-free keepsake.
                            </p>
                            {receiptExpected && (
                                <p className="text-[11px] text-amber-200/80">
                                    We&apos;ll email your payment receipt to <strong>{buyerContact.email.trim()}</strong>.
                                </p>
                            )}
                            <div className="p-3 rounded-xl bg-black/40 border border-amber-400/30 text-left space-y-2 text-xs text-amber-200/90">
                                <p className="flex items-start gap-1.5">
                                    <span>🎨</span>
                                    <span><strong>Customize anytime:</strong> Use the floating <em>Customize</em> button on the card to switch themes, music, and photos whenever you wish.</span>
                                </p>
                                <p className="flex items-start gap-1.5">
                                    <span>🔗</span>
                                    <span><strong>Share via URL:</strong> Copy the link above to send to {card.recipientName}. They see only the pure birthday surprise.</span>
                                </p>
                                <p className="flex items-start gap-1.5">
                                    <span>🔖</span>
                                    <span><strong>Return anytime:</strong> Bookmark or save this page URL. You have permanent creator access on this browser!</span>
                                </p>
                                <div className="pt-2 border-t border-amber-400/20 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                                    <span className="text-purple-200">Want to be 100% sure? Open in an <strong>Incognito window</strong>:</span>
                                    <a
                                        href={`${cardUrl}?viewer=1`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 font-extrabold text-amber-300 hover:text-amber-200 bg-amber-400/20 border border-amber-400/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <Eye className="w-3 h-3 text-amber-300" />
                                        <span>See Recipient View ↗</span>
                                    </a>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleViewCard}
                                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-gray-950 font-extrabold text-sm shadow-lg hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Crown className="w-4 h-4 text-gray-950" />
                                <span>🚀 View {card.recipientName}&apos;s VIP Card Now</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                                👑 Make it Unforgettable with VIP
                            </h3>
                            <p className="text-xs text-purple-200/80 mb-3 leading-relaxed">
                                {lockedPhotoCount > 0
                                    ? `You added ${photosCount} photos — 3 are showing. VIP shows every one of them, plus the cinematic finish.`
                                    : 'Same surprise, turned cinematic. See it:'}
                            </p>

                            {lockedPhotoCount > 0 && (
                                <div className="mb-3 flex items-center gap-2 rounded-xl bg-black/35 border border-amber-400/30 px-3 py-2 text-[11px] text-amber-200">
                                    <span className="text-base leading-none" aria-hidden="true">📸</span>
                                    <span>
                                        <strong>{lockedPhotoCount} photo{lockedPhotoCount === 1 ? '' : 's'} hidden</strong> on the free card. They are saved — VIP reveals them instantly.
                                    </span>
                                </div>
                            )}

                            {/* Free vs VIP: show the gap, don't describe it */}
                            <div className="grid grid-cols-2 gap-3 mb-4" aria-hidden="true">
                                <div className="text-center">
                                    <div className="vipmock vipmock-free mx-auto">
                                        <div className="vipmock-inner">
                                            <span className="vipmock-initial">
                                                {(card.recipientName || '♥').trim().charAt(0).toUpperCase() || '♥'}
                                            </span>
                                            <span className="vipmock-chip">Free</span>
                                        </div>
                                    </div>
                                    <p className="vipmock-label">Today’s card</p>
                                </div>
                                <div className="text-center">
                                    <div className="vipmock vipmock-vip mx-auto">
                                        <div className="vipmock-aurora" />
                                        <div className="vipmock-inner">
                                            <span className="vipmock-initial vipmock-initial-vip">
                                                {(card.recipientName || '♥').trim().charAt(0).toUpperCase() || '♥'}
                                            </span>
                                            <span className="vipmock-crown">👑</span>
                                            <span className="vipmock-chip vipmock-chip-vip">VIP</span>
                                        </div>
                                    </div>
                                    <p className="vipmock-label vipmock-label-vip">With VIP · {price.label}</p>
                                </div>
                            </div>

                            <ul className="space-y-1.5 text-xs text-purple-100/90 mb-4">
                                {[
                                    '👑 Golden crown & luminous aura around the card',
                                    '🎨 8 VIP themes + live aurora starfield canvas',
                                    lockedPhotoCount > 0
                                        ? `📸 All ${photosCount} of your photos, not just the first 3`
                                        : '🎵 11 VIP soundtracks · 📸 gallery up to 12 photos',
                                ].map((node, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px]">✓</span>
                                        <span>{node}</span>
                                    </li>
                                ))}
                            </ul>

                            <p className="text-[11px] text-purple-200/70 mb-3 leading-relaxed">
                                Everything you have already made stays exactly as it is. VIP only adds shine.
                            </p>

                            <div className="mb-3">
                                <label htmlFor="vip-receipt-email" className="block text-[11px] font-bold uppercase tracking-wider text-purple-300/80 mb-1.5">
                                    Receipt email <span className="normal-case font-normal text-purple-300/60">(optional)</span>
                                </label>
                                <input
                                    id="vip-receipt-email"
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={buyerContact.email || ''}
                                    onChange={(e) => setBuyerContact((c) => ({ ...c, email: e.target.value }))}
                                    onBlur={() => {
                                        const email = String(buyerContact.email || '').trim();
                                        if (!email || isValidEmail(email)) saveBuyerContact({ ...buyerContact, email });
                                        // One email field is enough: if they typed a
                                        // receipt address, reuse it for the reminder.
                                        if (email && isValidEmail(email) && !reminderEmail) setReminderEmail(email);
                                    }}
                                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                                />
                                <p className="text-[10px] text-purple-300/60 mt-1">
                                    We&apos;ll email the payment confirmation here. No newsletters.
                                </p>
                            </div>

                            {status.phase === 'error' && (
                                <p className="text-xs text-rose-400 mb-3 font-medium">{status.message}</p>
                            )}

                            <button
                                type="button"
                                onClick={handleUpgrade}
                                disabled={status.phase === 'loading' || status.phase === 'verifying'}
                                className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-pink-500 text-gray-950 font-extrabold text-sm sm:text-base shadow-[0_8px_30px_rgba(242,193,78,0.3)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                <Crown className="w-4 h-4 text-gray-950" />
                                <span>{status.phase === 'loading' || status.phase === 'verifying' ? status.message : `Upgrade to VIP · ${price.label}`}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleViewCard}
                                className="w-full mt-2.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 font-semibold text-xs border border-white/15 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <span>✨ Continue with Free Card</span>
                            </button>

                            <p className="text-[10px] text-center text-purple-300/60 mt-2">
                                {region === 'IN'
                                    ? 'Instant UPI / Card activation · One-time · No app needed'
                                    : 'Instant Card activation · One-time · Global access'}
                            </p>
                        </>
                    )}
                </div>

                {/* Group card: a different job-to-be-done from VIP. One card,
                    everyone adds a wish, recipient gets a wishes wall. */}
                <div className="mt-4 p-4 rounded-2xl border border-sky-400/30 bg-gradient-to-br from-sky-500/10 via-purple-900/15 to-black/30">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-400/15 border border-sky-400/40 text-sky-200 text-[11px] font-extrabold uppercase tracking-wider">
                            <Users className="w-3.5 h-3.5" />
                            {isGroup ? 'Group card live' : 'Going-away / team card'}
                        </span>
                        {!isGroup && (
                            <span className="text-xs text-sky-200/90 font-bold">
                                <s className="opacity-50 text-[10px] mr-1">{groupPrice.mrpLabel}</s> {groupPrice.label}
                            </span>
                        )}
                    </div>

                    {isGroup ? (
                        <div className="space-y-2.5">
                            <p className="text-xs text-purple-100/90 leading-relaxed">
                                Everyone can add a wish before the big day. Share this contributor link with the group:
                            </p>
                            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 font-mono overflow-x-auto">
                                <span className="truncate flex-1">{groupUrl}</span>
                                <button
                                    type="button"
                                    onClick={copyGroupLink}
                                    className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold bg-sky-400/20 hover:bg-sky-400/30 text-sky-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                >
                                    {groupCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{groupCopied ? 'Copied' : 'Copy'}</span>
                                </button>
                            </div>
                            <a
                                href={groupUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-200 hover:text-sky-100 underline"
                            >
                                Open the contributor page ↗
                            </a>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-sm font-bold text-white mb-1">Collect wishes from everyone</h3>
                            <p className="text-xs text-purple-200/80 leading-relaxed mb-3">
                                Turn this into a shared card. Anyone with the link adds their own wish, and {card.recipientName} gets one page with all of them — plus the full VIP finish.
                            </p>
                            <ul className="space-y-1 text-[11px] text-purple-100/90 mb-3">
                                <li className="flex items-center gap-2"><span className="text-sky-300">✓</span> One contributor link for the whole group</li>
                                <li className="flex items-center gap-2"><span className="text-sky-300">✓</span> A wishes wall {card.recipientName} can keep</li>
                                <li className="flex items-center gap-2"><span className="text-sky-300">✓</span> Includes the VIP crown, themes and full gallery</li>
                            </ul>
                            {groupStatus.phase === 'error' && (
                                <p className="text-xs text-rose-400 mb-2 font-medium">{groupStatus.message}</p>
                            )}
                            <button
                                type="button"
                                onClick={handleGroupUpgrade}
                                disabled={groupStatus.phase === 'loading' || groupStatus.phase === 'verifying' || groupStatus.phase === 'checkout'}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-purple-500 text-white font-extrabold text-xs shadow-md hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                <Users className="w-4 h-4" />
                                <span>
                                    {groupStatus.phase === 'loading' || groupStatus.phase === 'checkout' || groupStatus.phase === 'verifying'
                                        ? groupStatus.message
                                        : `Make it a group card · ${groupPrice.label}`}
                                </span>
                            </button>
                        </>
                    )}
                </div>

                {/* Footer secondary action */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-purple-200/70">
                    <span>Free card is ready & active</span>
                    <button
                        type="button"
                        onClick={handleViewCard}
                        className="inline-flex items-center gap-1 font-bold text-white hover:text-amber-300 transition-colors cursor-pointer"
                    >
                        <span>View Card Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
