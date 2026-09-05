'use client';

import React from 'react';
import { isAdsEnabled, isAffiliateEnabled } from '@/lib/monetization';

/**
 * CLS-safe Monetization Container
 *
 * Designed for future monetization (Google AdSense, Mediavine, Affiliate Product recommendation).
 * By default, isAdsEnabled() returns false and this component renders cleanly without shifting layout.
 */
export default function MonetizationSlot({
  slotId,
  type = 'display', // 'display' | 'affiliate' | 'native'
  className = '',
}) {
  const adsActive = isAdsEnabled();
  const affiliateActive = isAffiliateEnabled();

  // If monetization is inactive, render nothing
  if (!adsActive && !affiliateActive) {
    return null;
  }

  return (
    <div
      id={`monetization-slot-${slotId}`}
      className={`w-full mx-auto my-6 flex flex-col items-center justify-center overflow-hidden transition-all ${className}`}
      aria-label="Advertisement or Recommended Partner"
    >
      <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 select-none">
        Advertisement
      </span>

      {/* Reserved responsive frame preventing layout shifts */}
      <div className="w-full max-w-[728px] min-h-[90px] bg-gray-50 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400">
        {/* Future AdSense / Partner script container */}
        <div id={`ad-target-${slotId}`} className="w-full h-full text-center" />
      </div>
    </div>
  );
}
