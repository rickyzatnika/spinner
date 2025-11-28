/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(-1deg)' },
          '100%': { transform: 'translateY(0px) rotate(0deg)' },
        },
        wobble: {
          '0%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(2deg)' },
          '50%': { transform: 'rotate(0deg)' },
          '75%': { transform: 'rotate(-2deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        pop: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '40%': { transform: 'scale(1.12) rotate(-6deg)' },
          '70%': { transform: 'scale(0.98) rotate(2deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        wobble: 'wobble 0.6s ease-in-out infinite',
        pop: 'pop 0.75s cubic-bezier(.2,.9,.2,1) both',
      },
    },
  },
  plugins: [],
};
