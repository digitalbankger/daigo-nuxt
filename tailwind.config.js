/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
  ],
  theme: { 
    extend: {
      colors: {
        primary: '#4F8EFF',
        hoverbtn:  '#F7F7F7',
        textbtnhover: '#49454F',
        iconcolor: '#49454F',
        cpink: '#ff71c7',
        border: '#11111134',
        productbg: "#F7F7F7"
      },
      borderRadius: {
        '6': '6px',
        '2.5xl': '1.25em',
        '4xl': '2.5rem',
      },
      height: {
        '50': '50px',
        'order': '54px',
        '105': '105px',
      },
      minHeight: {
        '40': '10rem'
      },
      fontFamily: {
        sans: ['Golos', 'sans-serif'],
      },
      fontSize: {
        slider: 'clamp(36px, 8vw, 56px)',
        sliderSmall: '20px',
        '2xl': '1.5rem',
        '1.5xl': '1.37rem',
        '80': '80px',
        '5.5xl': '3.5rem',
      },
      screens: {
        xs: { max: '250px' },
        mm: { max: '430px' },

      },
      width: {
        '18': '4rem',
        '30': '8rem',
        '34': '9rem',
        '38': '11rem',
        '66': '17rem',
        '210': '210px',
      },
      boxShadow: {
        productcard: '0px 1px 2px 0px #3F3F3F26',
        poductcardlg: '0px 1px 18px 0px #3F3F3F26',
        light: '0 1px 4px rgba(0, 0, 0, 0.06)',
      },
      rotate: {
        '135': '135deg',
        '270': '270deg'
      },
      padding: {
        '34': '34px'
      }
    } 
  },
  plugins: [],
}

