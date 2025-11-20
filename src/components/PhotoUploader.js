'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PhotoUploader({ photos, setPhotos, maxPhotos = 8 }) {
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (photos.length + acceptedFiles.length > maxPhotos) {
            alert(`You can only upload up to ${maxPhotos} photos.`);
            return;
        }

        setUploading(true);
        const newPhotos = [];

        for (const file of acceptedFiles) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();
                if (data.success) {
                    newPhotos.push(data.url);
                } else {
                    console.error('Upload failed', data.error);
                }
            } catch (error) {
                console.error('Upload error', error);
            }
        }

        setPhotos((prev) => [...prev, ...newPhotos]);
        setUploading(false);
    }, [photos, maxPhotos, setPhotos]);

    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        disabled: uploading || photos.length >= maxPhotos
    });

    return (
        <div className="w-full space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                    isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
                    (uploading || photos.length >= maxPhotos) && "opacity-50 cursor-not-allowed"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                    {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                        <Upload className="w-8 h-8" />
                    )}
                    <p className="text-sm font-medium">
                        {isDragActive ? "Drop photos here" : "Drag & drop photos, or click to select"}
                    </p>
                    <p className="text-xs text-gray-400">
                        Max {maxPhotos} photos (JPG, PNG, WebP)
                    </p>
                </div>
            </div>

            {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {photos.map((url, index) => (
                        <div key={url} className="relative aspect-square group">
                            <img
                                src={url}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg border border-gray-200"
                            />
                            <button
                                onClick={() => removePhoto(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                type="button"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
