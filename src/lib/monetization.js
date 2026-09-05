/**
 * Centralized Monetization Configuration & Feature Flags
 *
 * Current Status: ALL MONETIZATION MODES ARE DISABLED (Default).
 * This file acts as the single source of truth for activating future monetization
 * (e.g. Google AdSense, Mediavine, Affiliate Gift Recommendations, Pro Themes)
 * with zero code refactoring needed later.
 */

export const MONETIZATION_CONFIG = {
  // Banner / Display ads (e.g. AdSense, Carbon, Mediavine)
  enableAds: process.env.NEXT_PUBLIC_ENABLE_ADS === 'true', // Defaults to false
  adSenseClientId: process.env.NEXT_PUBLIC_ADSENSE_ID || '',

  // Affiliate recommendations (e.g. Amazon gift guides, flower delivery, cake delivery)
  enableAffiliateGifts: process.env.NEXT_PUBLIC_ENABLE_AFFILIATE === 'true', // Defaults to false

  // Premium / Pro tier features (e.g. custom audio upload, watermark removal, custom domain)
  enableProTier: process.env.NEXT_PUBLIC_ENABLE_PRO_TIER === 'true', // Defaults to false

  // Email / Birthday reminder lead capture
  enableReminderCapture: true, // Non-intrusive organic lead capture for audience building
};

/**
 * Returns whether ad containers should render or stay completely hidden.
 */
export function isAdsEnabled() {
  return MONETIZATION_CONFIG.enableAds && !!MONETIZATION_CONFIG.adSenseClientId;
}

/**
 * Returns whether affiliate gift recommendation blocks should render.
 */
export function isAffiliateEnabled() {
  return MONETIZATION_CONFIG.enableAffiliateGifts;
}

/**
 * Returns whether Pro features / badges are actively gating content or just previewing.
 */
export function isProEnabled() {
  return MONETIZATION_CONFIG.enableProTier;
}
