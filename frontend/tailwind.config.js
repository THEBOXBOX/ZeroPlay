/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 모바일 최적화
      maxWidth: {
        'mobile': '393px',
      },
      height: {
        'mobile': '852px',
        'header': '120px',
        'navbar': '100px',
        'content': '632px',
      }
    },
  },
  plugins: [],
}