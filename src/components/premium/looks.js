/**
 * Premium looks (visual themes) + music catalogue for the "Look and sound"
 * step. Theme travels in the magic link as ?theme=<id>; music as ?music=<id>.
 */

export const PTHEMES = [
    { id: 'midnight', label: 'Midnight Gold', swatch: 'linear-gradient(135deg,#1e0f38,#f2c14e)' },
    { id: 'rose', label: 'Rose Wine', swatch: 'linear-gradient(135deg,#3b0a22,#fb7185)' },
    { id: 'ocean', label: 'Deep Ocean', swatch: 'linear-gradient(135deg,#04263b,#5eead4)' },
    { id: 'sunset', label: 'Ember Sunset', swatch: 'linear-gradient(135deg,#3a1503,#fb923c)' },
];

export const PTHEME_IDS = PTHEMES.map((t) => t.id);

export function getPTheme(id) {
    return PTHEMES.find((t) => t.id === id) || PTHEMES[0];
}
