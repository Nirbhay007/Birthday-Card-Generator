'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhotoUploader from './PhotoUploader';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const THEMES = [
    { id: 'elegant', name: 'Elegant', color: '#d4af37', bg: '#fdfbf7' },
    { id: 'fun', name: 'Fun & Colorful', color: '#ff69b4', bg: '#fff0f5' },
    { id: 'retro', name: 'Retro Neon', color: '#00ff00', bg: '#2b2b2b' },
    { id: 'minimal', name: 'Minimal', color: '#000000', bg: '#ffffff' },
];

export default function CreateForm({ formData, setFormData }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

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
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
            <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Create a Birthday Page
                </h2>
                <p className="text-gray-500">Make someone's day special with a personalized microsite.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor='recipientName' className="block text-sm font-medium text-gray-700 mb-1">Who is it for?</label>
                    <input
                        id='recipientName'
                        name='recipientName'
                        type="text"
                        required
                        placeholder="Recipient's Name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        value={formData.recipientName}
                        style={{ color: 'black' }}
                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor='birthdayDate' className="block text-sm font-medium text-gray-700 mb-1">When is their birthday? (Optional)</label>
                    <input
                        id='birthdayDate'
                        name='birthdayDate'
                        type="date"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        value={formData.birthdayDate}
                        style={{ color: 'black' }}
                        onChange={(e) => setFormData({ ...formData, birthdayDate: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor='message' className="block text-sm font-medium text-gray-700 mb-1">Add a personal message</label>
                    <textarea
                        id='message'
                        name='message'
                        rows={4}
                        placeholder="Write something sweet..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                        value={formData.message}
                        style={{ color: 'black' }}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor='theme' className="block text-sm font-medium text-gray-700 mb-3">Choose a Theme</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {THEMES.map((theme) => (
                            <button
                                key={theme.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, theme: theme.id })}
                                className={cn(
                                    "relative p-3 rounded-xl border-2 transition-all text-left overflow-hidden group",
                                    formData.theme === theme.id ? "border-purple-600 ring-2 ring-purple-100" : "border-gray-200 hover:border-gray-300"
                                )}
                                style={{ backgroundColor: theme.bg }}
                            >
                                <div className="relative z-10">
                                    <div className="w-6 h-6 rounded-full mb-2" style={{ backgroundColor: theme.color }} />
                                    <span className="text-sm font-medium" style={{ color: theme.id === 'retro' ? '#fff' : '#333' }}>{theme.name}</span>
                                </div>
                                {formData.theme === theme.id && (
                                    <div className="absolute top-2 right-2 text-purple-600">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor='photos' className="block text-sm font-medium text-gray-700 mb-1">Upload Photos</label>
                    <PhotoUploader
                        photos={formData.photos}
                        setPhotos={(photos) => setFormData(prev => ({ ...prev, photos: typeof photos === 'function' ? photos(prev.photos) : photos }))}
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Magic...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        Generate Birthday Page
                    </>
                )}
            </button>
        </form>
    );
}
