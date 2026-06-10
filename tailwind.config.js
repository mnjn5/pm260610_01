/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0064FF',
          dark: '#0050CC',
          light: '#E6F0FF',
        },
        accent: {
          DEFAULT: '#FF6B00',
          light: '#FFF0E6',
        },
        success: '#00B050',
        error: '#E02020',
      },
      fontFamily: {
        sans: ["'Noto Sans KR'", "'Apple SD Gothic Neo'", "'Malgun Gothic'", 'sans-serif'],
      },
      borderRadius: {
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        nav: '0 2px 4px rgba(0,0,0,0.06)',
        modal: '0 8px 32px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
}
