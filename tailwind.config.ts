```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50', // Green
        secondary: '#8BC34A', // Light Green
        accent: '#FFC107', // Amber
        dark: '#212121', // Dark Gray
        'dark-light': '#424242', // Slightly lighter dark
        'text-light': '#E0E0E0', // Light gray for text
        'text-dark': '#BDBDBD', // Darker gray for secondary text
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-sm': '0 0 5px rgba(76, 175, 80, 0.5)',
        'glow-md': '0 0 15px rgba(76, 175, 80, 0.7)',
        'glow-lg': '0 0 25px rgba(76, 175, 80, 0.9)',
      },
    },
  },
  plugins: [],
};
export default config;
```