/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'belfast': ['BelfastGrotesk', 'system-ui', 'sans-serif'],
        'extended': ['Extended', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};