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
        kinetic: {
          primary: '#4338CA',
          secondary: '#65A30D',
          tertiary: '#EA580C',
          neutral: '#94A3B8',
          bg: '#FFFFFF',
          surface: '#F8FAFC',
        },
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
          DEFAULT: '#0F172A',
          muted: '#64748B',
          faint: '#94A3B8',
          100: '#F8F9FB',
          200: '#F1F3F6',
          300: '#E6E9EE',
          400: '#D1D5DC',
          500: '#B1B7C0',
          600: '#64748B',
          700: '#4B5563',
          800: '#374151',
          900: '#0F172A',
        },
        canvas: '#F8F8F6',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        line: '#F0F0F0',
        indigo: {
          DEFAULT: '#4F46E5',
          light: '#EEF2FF',
        },
        teal: {
          DEFAULT: '#0D9488',
          light: '#F0FDFA',
        },
        rose: {
          DEFAULT: '#E11D48',
          light: '#FFF1F2',
        },
        amber: {
          DEFAULT: '#D97706',
          light: '#FFFBEB',
        },
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
        display: ['Montserrat', '"Space Grotesk"', 'Inter', 'sans-serif'],
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
