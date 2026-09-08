'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Loader2, Camera, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_DIM = 1600;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function compressImage(file) {
    return new Promise((resolve) => {
        // Skip tiny files or non-images
        if (!file.type.startsWith('image/') || file.size < 300 * 1024) {
            resolve(file);
            return;
        }
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            try {
                const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
                if (scale >= 1 && file.type === 'image/jpeg') {
                    URL.revokeObjectURL(url);
                    resolve(file);
                    return;
                }
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(
                    (blob) => {
                        URL.revokeObjectURL(url);
                        if (!blob) { resolve(file); return; }
                        resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
                    },
                    'image/jpeg',
                    0.82
                );
            } catch {
                URL.revokeObjectURL(url);
                resolve(file);
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(file);
        };
        img.src = url;
    });
}

export default function PhotoUploader({ photos, setPhotos, maxPhotos = 4 }) {
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const cameraInputRef = useRef(null);

    // Defer network upload to form submission.
    // Client-side downscaling and instant local preview (0 Blob operations consumed).
    const handleAddFiles = useCallback(async (fileList) => {
        setErrorMsg('');
        const files = Array.from(fileList || []);
        if (files.length === 0) return;

        if (photos.length + files.length > maxPhotos) {
            setErrorMsg(`You can upload up to ${maxPhotos} photo${maxPhotos === 1 ? '' : 's'} in the free birthday card.`);
            return;
        }

        // Validate file sizes before processing
        for (const f of files) {
            if (f.size > MAX_FILE_SIZE) {
                setErrorMsg(`"${f.name}" exceeds 5MB (${(f.size / (1024 * 1024)).toFixed(1)}MB). Please select photos under 5MB.`);
                return;
            }
        }

        setProcessing(true);
        const newPhotos = [];
        for (let i = 0; i < files.length; i++) {
            setProgress(`Preparing photo ${i + 1} of ${files.length}...`);
            try {
                const compressed = await compressImage(files[i]);
                const previewUrl = URL.createObjectURL(compressed);
                newPhotos.push({
                    preview: previewUrl,
                    file: compressed,
                    name: files[i].name,
                });
            } catch (err) {
                console.error('Image compression error', err);
                setErrorMsg('Failed to process photo. Please try another image.');
            }
        }

        if (newPhotos.length > 0) {
            setPhotos((prev) => [...prev, ...newPhotos]);
        }
        setProgress('');
        setProcessing(false);
    }, [photos, maxPhotos, setPhotos]);

    const onDrop = useCallback(async (acceptedFiles) => {
        await handleAddFiles(acceptedFiles);
    }, [handleAddFiles]);

    const removePhoto = (index) => {
        setErrorMsg('');
        const item = photos[index];
        if (item && typeof item === 'object' && item.preview) {
            try { URL.revokeObjectURL(item.preview); } catch {}
        }
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const movePhoto = (index, dir) => {
        setPhotos((prev) => {
            const next = [...prev];
            const j = index + dir;
            if (j < 0 || j >= next.length) return prev;
            [next[index], next[j]] = [next[j], next[index]];
            return next;
        });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        disabled: processing || photos.length >= maxPhotos,
    });

    return (
        <div className="w-full space-y-3">
            {errorMsg && (
                <div role="alert" className="flex items-center justify-between gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                    <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                        {errorMsg}
                    </span>
                    <button
                        type="button"
                        onClick={() => setErrorMsg('')}
                        className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                        aria-label="Dismiss error"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 gap-2">
                <div
                    {...getRootProps()}
                    className={cn(
                        'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors',
                        isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400',
                        (processing || photos.length >= maxPhotos) && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-1.5 text-gray-500">
                        {processing ? <Loader2 className="w-7 h-7 animate-spin text-purple-600" /> : <Upload className="w-7 h-7 text-purple-500" />}
                        <p className="text-xs font-bold text-gray-700">{isDragActive ? 'Drop photos here' : 'Choose from gallery'}</p>
                        <p className="text-[11px] text-gray-400">
                            {progress || (photos.length >= maxPhotos ? `Limit reached (${maxPhotos} photos)` : `JPG, PNG, WebP • max 5MB (up to ${maxPhotos})`)}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    disabled={processing || photos.length >= maxPhotos}
                    onClick={() => cameraInputRef.current?.click()}
                    className={cn(
                        'border-2 border-dashed rounded-xl p-5 text-center transition-colors border-gray-300 hover:border-pink-400 bg-pink-50/40 cursor-pointer',
                        (processing || photos.length >= maxPhotos) && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    <span className="flex flex-col items-center justify-center space-y-1.5 text-gray-500">
                        <Camera className="w-7 h-7 text-pink-500" />
                        <span className="text-xs font-bold text-gray-700">Take a photo</span>
                        <span className="text-[11px] text-gray-400">Use your camera</span>
                    </span>
                </button>
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    disabled={processing || photos.length >= maxPhotos}
                    onChange={(e) => { handleAddFiles(e.target.files); e.target.value = ''; }}
                    aria-label="Take a photo with camera"
                />
            </div>

            {photos.length > 0 && (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        {photos.map((item, index) => {
                            const previewSrc = typeof item === 'string' ? item : item.preview;
                            const key = typeof item === 'string' ? `${item}-${index}` : `${item.name || 'photo'}-${index}`;
                            return (
                                <div key={key} className="relative aspect-square group">
                                    <img
                                        src={previewSrc}
                                        alt={`Upload ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                                    />
                                    {index === 0 && (
                                        <span className="absolute bottom-1 left-1 text-[10px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded">Cover</span>
                                    )}
                                    <button
                                        onClick={() => removePhoto(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
                                        type="button"
                                        aria-label={`Remove photo ${index + 1}`}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    <div className="absolute bottom-1 right-1 flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={() => movePhoto(index, -1)}
                                            disabled={index === 0}
                                            className="bg-black/60 text-white p-1 rounded-full disabled:opacity-30 cursor-pointer"
                                            aria-label={`Move photo ${index + 1} left`}
                                        >
                                            <ChevronLeft className="w-3 h-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => movePhoto(index, 1)}
                                            disabled={index === photos.length - 1}
                                            className="bg-black/60 text-white p-1 rounded-full disabled:opacity-30 cursor-pointer"
                                            aria-label={`Move photo ${index + 1} right`}
                                        >
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[11px] text-gray-400">First photo is the cover. Use arrows to reorder.</p>
                </>
            )}
        </div>
    );
}
