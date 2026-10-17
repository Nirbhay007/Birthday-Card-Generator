/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Marketing "paper" theme — see DESIGN.md for the full ledger.
                ink: '#15111F',
                paper: '#F7F6FB',
                muted: '#5B5568',
                brand: {
                    50: '#F4F1FF',
                    100: '#EBE5FF',
                    200: '#D9CEFF',
                    300: '#BCA5FF',
                    400: '#9B73FF',
                    500: '#7C4DFF',
                    600: '#6D33E8',
                    700: '#5A24C4',
                    800: '#4A1FA0',
                    900: '#3B1B7E',
                    950: '#241052',
                },
                // VIP semantics only (badges, keepsake moments). Never decorative.
                gold: {
                    DEFAULT: '#F2C14E',
                    soft: '#FBF3DC',
                },
                // Legacy components were built on Tailwind's purple-* utilities.
                // Remapping the scale to brand violet harmonizes every pre-revamp
                // surface without touching their class strings (see DESIGN.md).
                purple: {
                    50: '#F4F1FF',
                    100: '#EBE5FF',
                    200: '#D9CEFF',
                    300: '#BCA5FF',
                    400: '#9B73FF',
                    500: '#7C4DFF',
                    600: '#6D33E8',
                    700: '#5A24C4',
                    800: '#4A1FA0',
                    900: '#3B1B7E',
                    950: '#241052',
                },
            },
            fontFamily: {
                sans: ['var(--font-geist)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
                display: ['var(--font-bricolage)', 'var(--font-geist)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                card: '1.5rem',
            },
            boxShadow: {
                soft: '0 1px 2px rgba(21, 17, 31, 0.04), 0 12px 32px -12px rgba(21, 17, 31, 0.12)',
                lift: '0 2px 4px rgba(21, 17, 31, 0.04), 0 24px 48px -16px rgba(21, 17, 31, 0.18)',
            },
        },
    },
    plugins: [],
};
