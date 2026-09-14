'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PhotoGallery({ photos, lockedCount = 0, onUnlockVip = null }) {
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

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

    if ((!photos || photos.length === 0) && lockedCount === 0) return null;

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
                {lockedCount > 0 && (
                    <div className="aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-amber-300/80 bg-amber-50/60 flex flex-col items-center justify-center p-4 text-center text-amber-900 shadow-sm select-none">
                        <span className="text-2xl mb-1.5" aria-hidden="true">👑</span>
                        <span className="text-xs font-extrabold">+{lockedCount} more {lockedCount === 1 ? 'memory' : 'memories'}</span>
                        <span className="text-[10.5px] text-amber-800/80 mt-1 font-medium">VIP Keepsake Gallery</span>
                    </div>
                )}
            </div>

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
