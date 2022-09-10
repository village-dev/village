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
                black: '#141614',
                white: '#FFFFFD',
                cream: '#FFFFF4',
                green: '#009C4E',
                lightgreen: '#E7FFEC',
            },
        },
    },
    plugins: [],
}
