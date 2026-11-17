'use client';

import React, { useRef, useState } from 'react';
import { Download, Award, Sparkles, Check, Crown } from 'lucide-react';
import { soundEngine } from './gameAudio';

export default function KeepsakeCertificate({
    recipientName = 'Birthday Legend',
    senderName = 'Someone who loves you',
    awardTitle = 'Official World’s Most Wonderful Human',
    date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
}) {
    const canvasRef = useRef(null);
    const [downloaded, setDownloaded] = useState(false);

    const generateAndDownload = () => {
        soundEngine.playPop();
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background: Cream luxury parchment
        const bgGrad = ctx.createLinearGradient(0, 0, 1200, 800);
        bgGrad.addColorStop(0, '#fdfbf7');
        bgGrad.addColorStop(0.5, '#f7f2e8');
        bgGrad.addColorStop(1, '#eee6d5');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1200, 800);

        // Elegant Double Gold Foil Border
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 14;
        ctx.strokeRect(30, 30, 1140, 740);

        ctx.strokeStyle = '#856404';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 50, 1100, 700);

        ctx.strokeStyle = '#f5c518';
        ctx.lineWidth = 4;
        ctx.strokeRect(56, 56, 1088, 688);

        // Corner Flourishes
        const drawCornerFlourish = (x, y, rot) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.fillStyle = '#d4af37';
            ctx.font = '28px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('❦', 0, 0);
            ctx.restore();
        };
        drawCornerFlourish(75, 75, 0);
        drawCornerFlourish(1125, 75, Math.PI / 2);
        drawCornerFlourish(1125, 725, Math.PI);
        drawCornerFlourish(75, 725, -Math.PI / 2);

        // Top Header
        ctx.fillStyle = '#6b4f12';
        ctx.font = 'bold 20px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '6px';
        ctx.fillText('CERTIFICATE OF DISTINCTION & LOVE', 600, 130);

        // Big Display Title
        ctx.fillStyle = '#1c1917';
        ctx.font = 'bold 54px Georgia, serif';
        ctx.letterSpacing = '2px';
        ctx.fillText(awardTitle, 600, 205);

        // Subtext
        ctx.fillStyle = '#57534e';
        ctx.font = 'italic 22px Georgia, serif';
        ctx.fillText('This everlasting honor is proudly presented on this birthday to', 600, 275);

        // Recipient Name with Gold underline
        ctx.fillStyle = '#852c12';
        ctx.font = 'bold 64px Georgia, serif';
        ctx.fillText(recipientName, 600, 365);

        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(350, 395);
        ctx.lineTo(850, 395);
        ctx.stroke();

        // Citation / Body
        ctx.fillStyle = '#292524';
        ctx.font = '22px Georgia, serif';
        ctx.fillText('For illuminating every room, creating unforgettable memories, and being', 600, 455);
        ctx.fillText('an irreplaceable blessing in the lives of everyone fortunate enough to know you.', 600, 495);

        // Gold Wax Seal / Rosette
        ctx.save();
        ctx.translate(600, 600);
        const sealGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 60);
        sealGrad.addColorStop(0, '#fef08a');
        sealGrad.addColorStop(0.5, '#eab308');
        sealGrad.addColorStop(1, '#a16207');
        ctx.fillStyle = sealGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 52, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#713f12';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#451a03';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★ OFFICIAL ★', 0, -12);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('VIP SEAL', 0, 12);
        ctx.restore();

        // Signatures
        // Left: Date
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1c1917';
        ctx.font = 'bold 20px Georgia, serif';
        ctx.fillText(date, 300, 630);
        ctx.strokeStyle = '#a8a29e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(180, 600);
        ctx.lineTo(420, 600);
        ctx.stroke();
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#78716c';
        ctx.fillText('DATE OF CELEBRATION', 300, 660);

        // Right: Conferred By (Sender)
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1c1917';
        ctx.font = 'bold 22px Georgia, serif';
        ctx.fillText(senderName, 900, 630);
        ctx.strokeStyle = '#a8a29e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(780, 600);
        ctx.lineTo(1020, 600);
        ctx.stroke();
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#78716c';
        ctx.fillText('CONFERRED WITH LOVE BY', 900, 660);

        // Download image
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${recipientName.replace(/\s+/g, '_')}_Birthday_Certificate.png`;
        link.href = dataUrl;
        link.click();

        soundEngine.playFanfare();
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 3000);
    };

    return (
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-slate-900/90 via-amber-950/20 to-slate-950/90 border border-amber-400/30 text-center space-y-5">
            <div className="flex items-center justify-center gap-2 text-amber-400">
                <Crown className="w-5 h-5 text-amber-400" />
                <h4 className="text-base sm:text-lg font-bold text-white">
                    Official Keepsake Certificate
                </h4>
            </div>

            <p className="text-xs text-gray-300 max-w-sm mx-auto">
                Generate an ultra-high resolution golden embossed certificate to commemorate {recipientName}&apos;s special milestone.
            </p>

            <button
                type="button"
                onClick={generateAndDownload}
                className="py-3 px-8 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-gray-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 mx-auto hover:brightness-110 shadow-lg cursor-pointer transform hover:scale-105 transition-all"
            >
                {downloaded ? (
                    <>
                        <Check className="w-4 h-4 text-gray-950" />
                        <span>Certificate Downloaded!</span>
                    </>
                ) : (
                    <>
                        <Download className="w-4 h-4 text-gray-950" />
                        <span>Download Keepsake Certificate (HD)</span>
                    </>
                )}
            </button>
        </div>
    );
}
