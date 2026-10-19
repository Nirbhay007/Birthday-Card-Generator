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
                // Marketing "porcelain" theme — neutral warm-white base, ink
                // type, one vermilion accent. No lavender tints, no gradients.
                ink: '#1C1917',
                paper: '#FAF9F7',
                muted: '#57534E',
                brand: {
                    50: '#FCF4F0',
                    100: '#F9E6DE',
                    200: '#F4CBBB',
                    300: '#ECA98D',
                    400: '#E17C55',
                    500: '#D6542B',
                    600: '#C5401A',
                    700: '#A33514',
                    800: '#852C12',
                    900: '#6E2613',
                    950: '#3B1309',
                },
                // VIP semantics only (badges, keepsake moments). Never decorative.
                gold: {
                    DEFAULT: '#F2C14E',
                    soft: '#FBF3DC',
                },
                // Legacy components were built on Tailwind's purple-* utilities.
                // Remapping the scale to the brand vermilion keeps every
                // pre-revamp surface on-palette without touching class strings
                // (see DESIGN.md).
                purple: {
                    50: '#FCF4F0',
                    100: '#F9E6DE',
                    200: '#F4CBBB',
                    300: '#ECA98D',
                    400: '#E17C55',
                    500: '#D6542B',
                    600: '#C5401A',
                    700: '#A33514',
                    800: '#852C12',
                    900: '#6E2613',
                    950: '#3B1309',
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
                soft: '0 1px 2px rgba(28, 25, 23, 0.04), 0 12px 32px -12px rgba(28, 25, 23, 0.12)',
                lift: '0 2px 4px rgba(28, 25, 23, 0.04), 0 24px 48px -16px rgba(28, 25, 23, 0.18)',
            },
        },
    },
    plugins: [],
};
