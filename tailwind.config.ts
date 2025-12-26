import type { Config } from 'tailwindcss';

const config: Config = {
  // Use the `.dark` class on <html> to control dark mode (matches theme.ts behavior)
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
};

export default config;
