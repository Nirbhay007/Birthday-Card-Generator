'use client';

import React, { useState } from 'react';
import CreateForm from '@/components/CreateForm';
import LivePreview from '@/components/LivePreview';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState({
    recipientName: '',
    birthdayDate: '',
    message: '',
    theme: 'elegant',
    photos: []
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-md mb-6">
            <span className="text-2xl mr-2">🎉</span>
            <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              BirthdayGen
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Create the <span className="text-purple-600">Perfect</span><br />
            Birthday Surprise
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Design a beautiful, interactive birthday page in seconds.
            Add photos, a personal message, and let them blow out the candles!
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12 items-start max-w-6xl mx-auto">
          <div className="w-full lg:w-3/5">
            <CreateForm formData={formData} setFormData={setFormData} />
          </div>

          <div className="w-full lg:w-2/5 hidden lg:block">
            <LivePreview data={formData} />
          </div>
        </div>
      </div>
    </main>
  );
}
