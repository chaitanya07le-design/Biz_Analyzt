/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: '#8b5cf6',
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#8b5cf6',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#5b21b6',
        },
        ink: {
          DEFAULT: '#111834',
          muted: '#6B7280',
          faint: '#9CA3AF',
          100: '#F8F9FB',
          200: '#F1F3F6',
          300: '#E6E9EE',
          400: '#D1D5DC',
          500: '#B1B7C0',
          600: '#6B7280',
          700: '#4B5563',
          800: '#374151',
          900: '#111834',
        },
        canvas: {
          DEFAULT: '#FAFAFF',
          soft: '#F8F9FC',
        },
        line: '#F0F0F0',
        success: {
          DEFAULT: '#16A34A',
          bg: '#ECFDF3',
        },
        danger: {
          DEFAULT: '#DC2626',
          bg: '#FEF2F2',
        },
        warning: {
          DEFAULT: '#D97706',
          bg: '#FFFBEB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Text', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(0,0,0,0.04)',
        'card-hover': '0 12px 24px rgba(0,0,0,0.06)',
        soft: '0 1px 3px rgba(0,0,0,0.05)',
        focus: '0 0 0 3px rgba(139,92,246,0.15)',
      },
      borderRadius: {
        lg: '12px',
        xl: '14px',
        '2xl': '16px',
        '3xl': '24px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
