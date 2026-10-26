import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    './components/**/*.vue',
    './components/**/*.stories.ts',
  ],
  theme: {
    fontFamily: {
      heading: [
        'Lexend Variable',
        ...defaultTheme.fontFamily.sans,
      ],
      sans: [
        'Atkinson Hyperlegible Next Variable',
        ...defaultTheme.fontFamily.sans,
      ],
    },
    extend: {},
  },
  plugins: [],
} satisfies Config
