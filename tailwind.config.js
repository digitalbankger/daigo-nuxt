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
        primary: '#C2A271',
        //primary: '#1f8cb3',
        cur: '#4C51BD',
        hoverbtn:  '#F7F7F7',
        textbtnhover: '#49454F',
        iconcolor: '#49454F',
        cpink: '#ff71c7',
        cpinklight: '#FFEBF1',
        cgreen: '#16B819',
        border: '#11111134',
        productbg: "#F7F7F7"
      },
      borderRadius: {
        '6': '6px',
        '2.5xl': '1.25em',
        '4xl': '2.5rem',
      },
      backgroundSize: {
        '50': '50%',
        '80': '80%',
        '70': '70%',
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
        nauryz: ['NauryzRedKeds', 'sans-serif'],
        mont: ['Montserrat', 'ui-sans-serif', 'system-ui'],
        sofia: ['Sofia Sans', 'ui-sans-serif', 'system-ui'],
        haido: ['"TG Haido Grotesk"', "ui-sans-serif", "system-ui"],
        atziluth: ['AtziluthScript', 'cursive'],
      },
      fontSize: {
        slider: 'clamp(28px, 8vw, 56px)',
        product: 'clamp(30px, 8vw, 46px)',
        head: 'clamp(56px, 8vw, 80px)',
        cardhead: 'clamp(20px, 8vw, 32px)',
        sliderSmall: '20px',
        '2xl': '1.5rem',
        '1.5xl': '1.37rem',
        '80': '80px',
        '5.5xl': '3.5rem',
      },
      screens: {
        xs: { max: '250px' },
        mm: { max: '430px' },
        'xs-max': { max: '350px' },
      },
      width: {
        '18': '4rem',
        '30': '8rem',
        '34': '9rem',
        '38': '11rem',
        '66': '17rem',
        '210': '210px',
        '1/45': '23%',
      },
      boxShadow: {
        productcard: '0px 1px 4px 0px #3F3F3F26',
        productcardlg: '0px 1px 18px 0px #3F3F3F26',
        light: '0 1px 4px rgba(0, 0, 0, 0.06)',
        fp: '0px 1px 6px 0px #00000014',
        pc: '0px 1px 5px 0px #00000014',
      },
      rotate: {
        '135': '135deg',
        '270': '270deg'
      },
      padding: {
        '34': '34px'
      },
      keyframes: {
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        float: 'floatY 4s ease-in-out infinite',
      },
    } 
  },
  plugins: [],
}

