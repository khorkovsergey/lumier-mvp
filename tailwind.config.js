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
      // ── Color system — Deep Ocean at Night ──────────────────
      colors: {
        // Ocean depth surfaces (elevation: 300 → 200 → 100)
        ivory: {
          50:  '#E8EFF8',   // text-primary shade (for rare bg use)
          100: '#1C2C40',   // bg-float — near surface
          200: '#152030',   // bg-raised — mid-depth
          300: '#0E1520',   // bg-base — ocean floor
        },
        // Warm accent — emotion, human side
        gold: {
          200: '#2A1E10',   // very subtle warm tint on dark
          300: '#A87838',   // darker gold (borders, pressed)
          400: '#D4954A',   // primary accent — THE gold
          500: '#B87D3A',   // pressed state
          600: '#EBB978',   // lighter gold (text on dark)
        },
        // Neutral scale (inverted for dark theme)
        ink: {
          50:  '#0E1520',   // darkest (matches bg-base)
          100: '#152030',
          200: '#1C2C40',
          300: '#445066',   // text-muted
          400: '#6B7F96',
          500: '#8899AF',   // text-secondary
          600: '#B0C0D5',
          700: '#D0DAEB',
          800: '#E8EFF8',   // text-primary
          900: '#F5F8FF',   // near-white
        },
        // Cool accent — clarity, logic
        ocean: {
          300: '#345A6E',   // dark muted
          400: '#4A8FA8',   // primary ocean
          500: '#60B8CE',   // lighter ocean
          600: '#88D0E2',   // light ocean (text)
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
        'surface':  '0 1px 3px rgba(0,0,0,0.30), 0 1px 2px rgba(0,0,0,0.20)',
        'card':     '0 2px 16px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.04) inset',
        'card-hover':'0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.06) inset',
        'selected': '0 4px 24px rgba(212,149,74,0.18), 0 0 0 1px rgba(212,149,74,0.12)',
        'float':    '0 16px 48px rgba(0,0,0,0.50), 0 4px 16px rgba(0,0,0,0.30)',
        'gold-glow':'0 0 24px rgba(212,149,74,0.20), 0 4px 16px rgba(0,0,0,0.35)',
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
