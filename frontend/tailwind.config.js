/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nasa-blue': '#0B3D91',
        'nasa-red': '#FC3D21',
        'space-dark': '#0A0A0A',
        'meteor-orange': '#FF6B35',
        'impact-red': '#DC2626',
        'crater-brown': '#92400E',
        'earth-blue': '#1E40AF',
        'asteroid-gray': '#6B7280',
      },
      fontFamily: {
        'nasa': ['Orbitron', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'meteor': 'meteor 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        meteor: {
          '0%': { transform: 'translateX(-100px) translateY(-100px) rotate(45deg)', opacity: '1' },
          '100%': { transform: 'translateX(100vw) translateY(100vh) rotate(45deg)', opacity: '0' },
        }
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(135deg, #0A0A0A 0%, #1E1B4B 50%, #0A0A0A 100%)',
        'earth-gradient': 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)',
        'meteor-gradient': 'linear-gradient(45deg, #FF6B35 0%, #F59E0B 50%, #EF4444 100%)',
      }
    },
  },
  plugins: [],
}
