'use client';

import React, { useState, useEffect } from 'react';
import PostCreationModal from './PostCreationModal';

export default function VipUpgradeButton({ page }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onOpenVip = () => setOpen(true);
        window.addEventListener('vip:open', onOpenVip);
        return () => window.removeEventListener('vip:open', onOpenVip);
    }, []);

    if (!page || page.isVip) return null;

    return (
        <PostCreationModal
            isOpen={open}
            onClose={() => setOpen(false)}
            card={page}
        />
    );
}
