/**
 * Shared Tailwind theme for Honzi Tours & Travel
 * Colors: Black, Gold, Deep Blue, Sunset tones
 */
window.HONZI_TAILWIND_CONFIG = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Google Sans Flex', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#C1A061',
          light: '#C6B289',
          dark: '#A68B4B',
        },
        deepBlue: {
          DEFAULT: '#0f172a',
          light: '#1e3a5f',
          dark: '#0c1929',
        },
        sunset: {
          DEFAULT: '#e07c54',
          light: '#f5a962',
          dark: '#c9613d',
        },
      },
    },
  },
};
