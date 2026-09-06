'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Loader2, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_DIM = 1600;

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

export default function PhotoUploader({ photos, setPhotos, maxPhotos = 8 }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState('');
    const cameraInputRef = useRef(null);

    const uploadFiles = useCallback(async (fileList) => {
        const files = Array.from(fileList || []);
        if (files.length === 0) return;
        if (photos.length + files.length > maxPhotos) {
            alert(`You can only upload up to ${maxPhotos} photos.`);
            return;
        }
        setUploading(true);
        const newPhotos = [];
        for (let i = 0; i < files.length; i++) {
            setProgress(`Preparing ${i + 1} of ${files.length}...`);
            try {
                const compressed = await compressImage(files[i]);
                const fd = new FormData();
                fd.append('file', compressed);
                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                const data = await res.json();
                if (data.success) newPhotos.push(data.url);
                else console.error('Upload failed', data.error);
            } catch (error) {
                console.error('Upload error', error);
            }
        }
        setPhotos((prev) => [...prev, ...newPhotos]);
        setProgress('');
        setUploading(false);
    }, [photos, maxPhotos, setPhotos]);

    const onDrop = useCallback(async (acceptedFiles) => {
        await uploadFiles(acceptedFiles);
    }, [uploadFiles]);

    const removePhoto = (index) => {
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
        disabled: uploading || photos.length >= maxPhotos
    });

    return (
        <div className="w-full space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <div
                    {...getRootProps()}
                    className={cn(
                        'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors',
                        isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400',
                        (uploading || photos.length >= maxPhotos) && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-1.5 text-gray-500">
                        {uploading ? <Loader2 className="w-7 h-7 animate-spin text-purple-600" /> : <Upload className="w-7 h-7 text-purple-500" />}
                        <p className="text-xs font-bold text-gray-700">{isDragActive ? 'Drop photos here' : 'Choose from gallery'}</p>
                        <p className="text-[11px] text-gray-400">{progress || `JPG, PNG, WebP • auto-shrink`}</p>
                    </div>
                </div>
                <button
                    type="button"
                    disabled={uploading || photos.length >= maxPhotos}
                    onClick={() => cameraInputRef.current?.click()}
                    className={cn(
                        'border-2 border-dashed rounded-xl p-5 text-center transition-colors border-gray-300 hover:border-pink-400 bg-pink-50/40 cursor-pointer',
                        (uploading || photos.length >= maxPhotos) && 'opacity-50 cursor-not-allowed'
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
                    disabled={uploading || photos.length >= maxPhotos}
                    onChange={(e) => { uploadFiles(e.target.files); e.target.value = ''; }}
                    aria-label="Take a photo with camera"
                />
            </div>

            {photos.length > 0 && (
                <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {photos.map((url, index) => (
                            <div key={`${url}-${index}`} className="relative aspect-square group">
                                <img
                                    src={url}
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
                        ))}
                    </div>
                    <p className="text-[11px] text-gray-400">First photo is the cover. Use arrows to reorder.</p>
                </>
            )}
        </div>
    );
}
