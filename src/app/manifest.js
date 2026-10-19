export default function manifest() {
  return {
    name: 'BirthdayGen - Personalized Birthday Card Generator',
    short_name: 'BirthdayGen',
    description: 'Create interactive personalized birthday pages with candles, music, photos, and heartfelt messages.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf9f7',
    theme_color: '#1c1917',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
