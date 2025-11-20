'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PhotoGallery({ photos }) {
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

    const openLightbox = (index) => setSelectedPhotoIndex(index);
    const closeLightbox = () => setSelectedPhotoIndex(null);

    const nextPhoto = (e) => {
        e.stopPropagation();
        setSelectedPhotoIndex((prev) => (prev + 1) % photos.length);
    };

    const prevPhoto = (e) => {
        e.stopPropagation();
        setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    if (!photos || photos.length === 0) return null;

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                    <motion.div
                        key={photo.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="aspect-square cursor-pointer rounded-xl overflow-hidden shadow-md"
                        onClick={() => openLightbox(index)}
                    >
                        <img
                            src={photo.url}
                            alt="Memory"
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedPhotoIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <button
                            onClick={prevPhoto}
                            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full hidden md:block"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>

                        <motion.img
                            key={selectedPhotoIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={photos[selectedPhotoIndex].url}
                            alt="Full size memory"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />

                        <button
                            onClick={nextPhoto}
                            className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full hidden md:block"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
