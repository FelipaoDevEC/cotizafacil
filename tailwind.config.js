/** @type {import('tailwindcss').Config} */
export default {
  // Archivos donde Tailwind buscará las clases CSS.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      // Paleta principal de Cotizafácil.
      colors: {
        principal: "#17324D",  // Azul oscuro: confianza.
        accion: "#F97316",     // Naranja: botones principales.
        fondo: "#F8FAFC",      // Fondo claro.
        texto: "#1E293B",      // Texto principal.
      },
    },
  },

  plugins: [],
};