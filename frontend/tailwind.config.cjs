/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
            display: ['Asap'],
        },
        extend: {
            colors: {
                cream: '#FFFFEF',
            },
        },
    },
    plugins: [],
}
