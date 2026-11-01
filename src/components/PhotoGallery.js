'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Crown, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { track } from '@/lib/track';

export default function PhotoGallery({ photos, lockedCount = 0, onUnlockVip = null, pageId = null, isVip = false }) {
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    // Locked-photo placeholders are creator-only. The recipient should see a
    // clean, finished gift — never a "3 of 8" reminder or an upsell.
    useEffect(() => {
        if (!pageId) return;
        try {
            // ?viewer=1 is the creator's "what the recipient sees" preview.
            // Never show the owner-only locked-photo upsell there.
            const viewer = new URLSearchParams(window.location.search).get('viewer') === '1';
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsOwner(!viewer && !!localStorage.getItem(`bgen_owner_${pageId}`));
        } catch { }
    }, [pageId]);

    const openLightbox = (index) => setSelectedPhotoIndex(index);
    const closeLightbox = () => setSelectedPhotoIndex(null);

    const nextPhoto = (e) => {
        if (e) e.stopPropagation();
        setSelectedPhotoIndex((prev) => (prev + 1) % photos.length);
    };

    const prevPhoto = (e) => {
        if (e) e.stopPropagation();
        setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedPhotoIndex === null) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextPhoto();
            if (e.key === 'ArrowLeft') prevPhoto();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedPhotoIndex, photos.length]);

    const showLocked = isOwner && !isVip && lockedCount > 0;
    if ((!photos || photos.length === 0) && !showLocked) return null;

    const openUpsell = () => {
        track('photo_cap_upsell_click', { path: '/b/[id]' });
        if (onUnlockVip) onUnlockVip();
        else window.dispatchEvent(new CustomEvent('vip:open'));
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(photos || []).map((photo, index) => (
                    <motion.button
                        key={photo.id || index}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="aspect-square cursor-pointer rounded-2xl overflow-hidden shadow-md focus:outline-none focus:ring-4 focus:ring-purple-500 border border-gray-100 bg-gray-100"
                        onClick={() => openLightbox(index)}
                        aria-label={`View photo memory ${index + 1}`}
                    >
                        <img
                            src={photo.url}
                            alt={`Birthday memory photo ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </motion.button>
                ))}

                {showLocked && (
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openUpsell}
                        className="aspect-square rounded-2xl overflow-hidden shadow-md border-2 border-dashed border-amber-400/70 bg-gradient-to-br from-amber-50 to-pink-50 flex flex-col items-center justify-center gap-1.5 p-3 text-center focus:outline-none focus:ring-4 focus:ring-amber-300 cursor-pointer"
                        aria-label={`${lockedCount} more photos are hidden. Unlock VIP to reveal them.`}
                    >
                        <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-amber-400/30">
                            <Lock className="w-4 h-4 text-amber-700" aria-hidden="true" />
                        </span>
                        <span className="text-[11px] font-extrabold text-amber-950 leading-tight">
                            {lockedCount} more photo{lockedCount === 1 ? '' : 's'}
                        </span>
                        <span className="text-[10px] text-amber-900/70 leading-tight">
                            Saved, not showing
                        </span>
                        <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-gray-950 text-amber-300 px-2 py-1 text-[10px] font-extrabold">
                            <Crown className="w-3 h-3" aria-hidden="true" /> Unlock all
                        </span>
                    </motion.button>
                )}
            </div>

            {showLocked && (
                <p className="mt-3 text-center text-[11px] text-gray-500">
                    Only you see this: {lockedCount} uploaded photo{lockedCount === 1 ? '' : 's'} {lockedCount === 1 ? 'is' : 'are'} hidden on the free card. VIP reveals {lockedCount === 1 ? 'it' : 'them'} instantly.
                </p>
            )}

            <AnimatePresence>
                {selectedPhotoIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={closeLightbox}
                        role="dialog"
                        aria-label="Full screen photo gallery viewer"
                        aria-modal="true"
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 text-white p-3 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Close photo modal"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <button
                            onClick={prevPhoto}
                            className="absolute left-4 text-white p-3 hover:bg-white/10 rounded-full hidden md:block transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Previous photo"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>

                        <motion.img
                            key={selectedPhotoIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={photos[selectedPhotoIndex].url}
                            alt={`Full size memory ${selectedPhotoIndex + 1} of ${photos.length}`}
                            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />

                        <button
                            onClick={nextPhoto}
                            className="absolute right-4 text-white p-3 hover:bg-white/10 rounded-full hidden md:block transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Next photo"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
