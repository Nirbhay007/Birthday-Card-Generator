'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer({ src = "/happy-birthday.mp3", autoPlay = true }) {
    const [playing, setPlaying] = useState(true);
    const audioRef = useRef(null);

    useEffect(() => {
        if (autoPlay && audioRef.current) {
            audioRef.current.play().then(() => {
                setPlaying(true);
            }).catch(() => {
                // Autoplay blocked by browser policy
                setPlaying(false);
            });
        }
    }, [autoPlay]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (playing) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setPlaying(!playing);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <audio ref={audioRef} src={src} loop />
            <button
                onClick={togglePlay}
                className="bg-gray-900/90 text-white backdrop-blur-md p-3.5 rounded-full shadow-2xl hover:bg-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-purple-500 flex items-center justify-center"
                aria-label={playing ? "Mute background birthday music" : "Play background birthday music"}
                title={playing ? "Mute music" : "Play music"}
            >
                {playing ? <Volume2 className="w-6 h-6 text-purple-400" /> : <VolumeX className="w-6 h-6 text-gray-400" />}
            </button>
            <span className="sr-only" aria-live="polite">
                {playing ? "Background birthday music is currently playing" : "Background birthday music is muted"}
            </span>
        </div>
    );
}
