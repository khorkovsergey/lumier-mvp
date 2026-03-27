/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './entities/**/*.{js,ts,jsx,tsx,mdx}',
    './shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Color system ────────────────────────────────────────
      colors: {
        // Base surfaces (elevation order: 50 → 100 → 200)
        ivory: {
          50:  '#FDFCF8',   // lightest tone (spare)
          100: '#FAF7F0',   // floating surface (modals, bubbles)
          200: '#F4EDE0',   // page bg
          300: '#EDE3CC',   // elevated surface (cards)
        },
        // Single gold accent — use 400 everywhere; 300/500 for lighter/darker
        gold: {
          200: '#E8D4A8',   // very subtle background tint
          300: '#D4AF78',   // light accent, borders
          400: '#C4964A',   // primary accent — THE gold
          500: '#A87D34',   // pressed state
          600: '#8A6320',   // text on light
        },
        // Neutral text scale
        ink: {
          50:  '#F7F5F2',
          100: '#EAE6E1',
          200: '#D5CFC8',
          300: '#B5ADA4',
          400: '#8C8279',
          500: '#6B6259',
          600: '#4A4340',
          700: '#302B28',
          800: '#1E1A18',
          900: '#120F0D',
        },
      },

      // ── Typography ───────────────────────────────────────────
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:  ['var(--font-jost)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display
        'display-xl': ['3.5rem',  { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        'display-lg': ['2.75rem', { lineHeight: '1.1',  letterSpacing: '-0.01em' }],
        'display':    ['2.25rem', { lineHeight: '1.15', letterSpacing: '0' }],
        // Editorial
        'title-xl':   ['1.75rem', { lineHeight: '1.25', letterSpacing: '0' }],
        'title-lg':   ['1.375rem',{ lineHeight: '1.3',  letterSpacing: '0' }],
        'title':      ['1.125rem',{ lineHeight: '1.4',  letterSpacing: '0' }],
        // Body
        'body-lg':    ['1rem',    { lineHeight: '1.75', letterSpacing: '0' }],
        'body':       ['0.9375rem',{ lineHeight: '1.75',letterSpacing: '0' }],
        'body-sm':    ['0.875rem', { lineHeight: '1.65',letterSpacing: '0' }],
        // UI
        'label':      ['0.75rem', { lineHeight: '1',    letterSpacing: '0.08em' }],
        'caption':    ['0.6875rem',{ lineHeight: '1',   letterSpacing: '0.1em' }],
      },

      // ── Spacing grid (8pt) ───────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
      },

      // ── Border radius ────────────────────────────────────────
      borderRadius: {
        // Three levels only
        'sm':  '10px',   // chips, badges, tags
        'md':  '14px',   // inputs, buttons
        'lg':  '20px',   // cards
        'xl':  '28px',   // large cards
        'full':'9999px', // pills
      },

      // ── Box shadow ───────────────────────────────────────────
      boxShadow: {
        'surface':  '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        'card':     '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover':'0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'selected': '0 4px 20px rgba(196,150,74,0.14), 0 1px 4px rgba(196,150,74,0.1)',
        'float':    '0 16px 48px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)',
        'none': 'none',
      },

      // ── Animation ────────────────────────────────────────────
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'breathe': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.04)' },
        },
        'scan': {
          '0%':   { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'shimmer': 'shimmer 2.4s linear infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
        'scan':    'scan 2s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}
