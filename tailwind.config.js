/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色
        primary: {
          DEFAULT: '#4D83FF',
          hover: '#3F7AFF',
          light: '#EEF6FF',
        },
        // 文字颜色
        text: {
          primary: '#1E2533',
          secondary: '#4E5969',
          tertiary: '#84888F',
        },
        // 背景颜色
        bg: {
          white: '#FFFFFF',
          light: '#FBFCFF',
          gray: '#EDF3FA',
        },
        // 边框颜色
        border: '#EDEDEE',
        // 侧边栏
        sidebar: '#000000',
      },
      borderRadius: {
        'card': '8px',
      },
    },
  },
  plugins: [],
}
