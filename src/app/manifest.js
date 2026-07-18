export default function manifest() {
  return {
    name: 'BirthdayGen - Personalized Birthday Card Generator',
    short_name: 'BirthdayGen',
    description: 'Create interactive personalized birthday pages with candles, music, photos, and heartfelt messages.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fdfbf7',
    theme_color: '#9333ea',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
