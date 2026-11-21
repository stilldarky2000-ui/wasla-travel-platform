export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wasla: {
          navy: '#0F2233',
          'navy-light': '#19354F',
          orange: '#EE5426',
          'orange-hover': '#D9461B',
          cream: '#FAF4ED',
          divider: '#C8C2B8',
          'divider-dark': '#334155',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['"Cairo"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brand: '0 8px 30px rgba(15, 34, 51, 0.06)',
        cta: '0 4px 14px rgba(238, 84, 38, 0.32)',
      },
    },
  },
  plugins: [],
};
