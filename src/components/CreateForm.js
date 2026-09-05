'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PhotoUploader from './PhotoUploader';
import WishInspirationModal from './WishInspirationModal';
import { Loader2, Sparkles, Bell, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const THEMES = [
    { id: 'elegant', name: 'Elegant', color: '#d4af37', bg: '#fdfbf7', textColor: '#111827' },
    { id: 'fun', name: 'Fun & Colorful', color: '#ff69b4', bg: '#fff0f5', textColor: '#111827' },
    { id: 'retro', name: 'Retro Neon', color: '#00ff00', bg: '#2b2b2b', textColor: '#ffffff' },
    { id: 'minimal', name: 'Minimal', color: '#000000', bg: '#ffffff', textColor: '#111827' },
];

export default function CreateForm({ formData, setFormData }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [inspirationOpen, setInspirationOpen] = useState(false);

    // Auto-populate message if user arrived from /wishes/[slug] with ?wish=...
    useEffect(() => {
        const wishParam = searchParams.get('wish');
        if (wishParam && !formData.message) {
            setFormData(prev => ({ ...prev, message: wishParam }));
        }
    }, [searchParams, formData.message, setFormData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/birthday', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.success) {
                router.push(`/b/${data.id}`);
            } else {
                alert('Failed to create page: ' + data.error);
            }
        } catch (error) {
            console.error('Error creating page:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto p-6 sm:p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-purple-100">
                <div className="space-y-2 text-center">
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Create a Birthday Page
                    </h2>
                    <p className="text-gray-600 text-sm">Make someone's day special with a personalized interactive microsite.</p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label htmlFor="recipientName" className="block text-sm font-semibold text-gray-800 mb-1">
                            Who is it for? <span className="text-red-500" aria-hidden="true">*</span>
                        </label>
                        <input
                            id="recipientName"
                            name="recipientName"
                            type="text"
                            required
                            aria-required="true"
                            placeholder="Recipient's Name (e.g. Sarah)"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                            value={formData.recipientName}
                            onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="birthdayDate" className="block text-sm font-semibold text-gray-800 mb-1">
                            When is their birthday? <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <input
                            id="birthdayDate"
                            name="birthdayDate"
                            type="date"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                            value={formData.birthdayDate}
                            onChange={(e) => setFormData({ ...formData, birthdayDate: e.target.value })}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="message" className="block text-sm font-semibold text-gray-800">
                                Add a personal message <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setInspirationOpen(true)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                <span>Need inspiration? Pick a wish</span>
                            </button>
                        </div>
                        <textarea
                            id="message"
                            name="message"
                            rows={4}
                            placeholder="Write something sweet, funny, or memorable..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all resize-none"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>

                    {/* Annual Birthday Reminder Capture (Future Retention & Monetization Engine) */}
                    <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={formData.remindNextYear || false}
                                onChange={(e) => setFormData({ ...formData, remindNextYear: e.target.checked })}
                                className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                                <Bell className="w-3.5 h-3.5 text-purple-600" /> Remind me next year 7 days before this birthday
                            </span>
                        </label>
                        {formData.remindNextYear && (
                            <input
                                type="email"
                                placeholder="Enter your email to receive free annual reminder..."
                                value={formData.reminderEmail || ''}
                                onChange={(e) => setFormData({ ...formData, reminderEmail: e.target.value })}
                                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-purple-200 bg-white text-gray-900 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                            />
                        )}
                    </div>

                    <div>
                        <span id="theme-label" className="block text-sm font-semibold text-gray-800 mb-3">Choose a Visual Theme</span>
                        <div role="radiogroup" aria-labelledby="theme-label" className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {THEMES.map((theme) => (
                                <button
                                    key={theme.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={formData.theme === theme.id}
                                    onClick={() => setFormData({ ...formData, theme: theme.id })}
                                    className={cn(
                                        "relative p-3 rounded-xl border-2 transition-all text-left overflow-hidden group focus:outline-none focus:ring-2 focus:ring-purple-600",
                                        formData.theme === theme.id ? "border-purple-600 ring-2 ring-purple-200" : "border-gray-200 hover:border-gray-300"
                                    )}
                                    style={{ backgroundColor: theme.bg }}
                                >
                                    <div className="relative z-10">
                                        <div className="w-6 h-6 rounded-full mb-2 border border-black/10" style={{ backgroundColor: theme.color }} />
                                        <span className="text-xs sm:text-sm font-medium" style={{ color: theme.textColor }}>{theme.name}</span>
                                    </div>
                                    {formData.theme === theme.id && (
                                        <div className="absolute top-2 right-2 text-purple-600" aria-hidden="true">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                    )}
                                </button>
                            ))}

                            {/* Pro Theme Preview Slot (Future Monetization / Upsell Staging) */}
                            <div className="relative p-3 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/50 text-left overflow-hidden select-none opacity-80">
                                <div className="relative z-10">
                                    <div className="w-6 h-6 rounded-full mb-2 bg-gradient-to-tr from-amber-400 to-yellow-200 border border-amber-300 shadow-xs" />
                                    <span className="text-xs font-semibold text-gray-800 block">Royal Gold</span>
                                    <span className="inline-flex items-center gap-0.5 mt-1 text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                                        <Crown className="w-2.5 h-2.5" /> Pro Soon
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <span className="block text-sm font-semibold text-gray-800 mb-1">Upload Favorite Photos</span>
                        <PhotoUploader
                            photos={formData.photos}
                            setPhotos={(photos) => setFormData(prev => ({ ...prev, photos: typeof photos === 'function' ? photos(prev.photos) : photos }))}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    aria-busy={loading}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-purple-300 cursor-pointer"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                            Generating Your Birthday Page...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" aria-hidden="true" />
                            Generate Free Birthday Page
                        </>
                    )}
                </button>
            </form>

            {/* Inspiration Picker Modal */}
            <WishInspirationModal
                isOpen={inspirationOpen}
                onClose={() => setInspirationOpen(false)}
                onSelectWish={(text) => setFormData(prev => ({ ...prev, message: text }))}
            />
        </>
    );
}
