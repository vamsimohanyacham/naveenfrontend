/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Add the correct paths to your project files
  ],
  darkMode : 'class', //Enable class based dark mode
  theme: {
    extend: {
      colors: {
        customColor: '#436971',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],  // Register the Roboto font here
      },
    },
  },
  plugins: [],
}
 
 