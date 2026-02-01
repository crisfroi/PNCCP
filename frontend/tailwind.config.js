/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        institucional: {
          primary: '#1e3a5f',
          secondary: '#2c5282',
          accent: '#3182ce',
          light: '#ebf8ff',
          dark: '#0d2137',
        },
        estado: {
          activo: '#22543d',
          pendiente: '#744210',
          cerrado: '#553c9a',
          alerta: '#c53030',
          neutro: '#4a5568',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        panel: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
      },
    },
  },
  plugins: [],
}
