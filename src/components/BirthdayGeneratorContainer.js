'use client';

import React, { useState, Suspense } from 'react';
import CreateForm from '@/components/CreateForm';
import LivePreview from '@/components/LivePreview';

export default function BirthdayGeneratorContainer() {
  const [formData, setFormData] = useState({
    recipientName: '',
    relationship: '',
    birthdayDate: '',
    age: '',
    senderName: '',
    message: '',
    theme: 'fun',
    music: 'classic',
    photos: []
  });

  const themeName = { elegant: 'Elegant', fun: 'Fun', royal: 'Royal 👑', midnight: 'Midnight', princess: 'Princess 💖', unicorn: 'Unicorn 🦄', retro: 'Retro', minimal: 'Minimal' }[formData.theme] || 'Fun';

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
      <div className="w-full lg:w-3/5">
        {/* Mobile live pill — creators always see who it's for */}
        <div className="lg:hidden sticky top-2 z-30 mb-3">
          <div className="mx-auto max-w-2xl flex items-center justify-center gap-2 bg-gray-900/90 text-white backdrop-blur-md rounded-full px-4 py-2 shadow-lg text-xs font-bold">
            <span aria-hidden="true">🎁</span>
            <span className="truncate">
              {formData.recipientName ? `For ${formData.recipientName}` : 'Name your star'} • {themeName}
              {formData.age ? ` • 🎂 ${formData.age}` : ''} • {(formData.photos || []).length} 📸
            </span>
          </div>
        </div>
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading card generator...</div>}>
          <CreateForm formData={formData} setFormData={setFormData} />
        </Suspense>
      </div>

      <div className="w-full lg:w-2/5 hidden lg:block">
        <LivePreview data={formData} />
      </div>
    </div>
  );
}
