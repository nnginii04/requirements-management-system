/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0064FF',
        secondary: '#4F46E5',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#F8FAFC',
        card: '#FFFFFF',
        border: '#E5E7EB',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
      },
    },
  },
  plugins: [],
}
