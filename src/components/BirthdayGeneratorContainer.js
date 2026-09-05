'use client';

import React, { useState, Suspense } from 'react';
import CreateForm from '@/components/CreateForm';
import LivePreview from '@/components/LivePreview';

export default function BirthdayGeneratorContainer() {
  const [formData, setFormData] = useState({
    recipientName: '',
    birthdayDate: '',
    message: '',
    theme: 'elegant',
    photos: []
  });

  return (
    <div className="flex flex-col lg:flex-row gap-12 items-start max-w-6xl mx-auto">
      <div className="w-full lg:w-3/5">
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
