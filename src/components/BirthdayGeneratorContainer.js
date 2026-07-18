'use client';

import React, { useState } from 'react';
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
        <CreateForm formData={formData} setFormData={setFormData} />
      </div>

      <div className="w-full lg:w-2/5 hidden lg:block">
        <LivePreview data={formData} />
      </div>
    </div>
  );
}
