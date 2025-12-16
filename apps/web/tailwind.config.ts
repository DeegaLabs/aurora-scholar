import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta acadêmica neutra
        primary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        academic: {
          light: '#f5f5f5',
          DEFAULT: '#1a1a1a',
          dark: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Crimson Pro', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        wider: '0.05em',
        widest: '0.1em',
        'extra-wide': '0.3em',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '75ch',
            color: '#374151',
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-delay-1': 'fadeIn 0.6s ease-out 0.1s forwards',
        'fade-in-delay-2': 'fadeIn 0.6s ease-out 0.2s forwards',
        'fade-in-delay-3': 'fadeIn 0.6s ease-out 0.3s forwards',
      },
    },
  },
  plugins: [],
};

export default config;
