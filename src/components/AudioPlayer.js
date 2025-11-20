'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer({ src = "/happy-birthday.mp3", autoPlay = true }) {
    const [playing, setPlaying] = useState(true);
    const audioRef = useRef(null);

    useEffect(() => {
        if (autoPlay && audioRef.current) {
            // Browsers block autoplay until interaction. We try, but if it fails, we wait for interaction.
            audioRef.current.play().then(() => {
                setPlaying(true);
            }).catch(() => {
                // Autoplay blocked
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
                className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg hover:shadow-xl transition-all text-gray-800"
                aria-label={playing ? "Mute music" : "Play music"}
            >
                {playing ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
        </div>
    );
}
