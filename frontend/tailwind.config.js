/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0A192F",
          darkNavy: "#071120",
          slate: "#0F172A",
          paypal: "#0070BA",
          paypalDark: "#003087",
          cyan: "#00CFDE",
          accent: "#2563EB",
          lightBg: "#F8FAFC",
          cardBg: "#FFFFFF",
          border: "#E2E8F0",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          recovered: "#6366F1",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'premium': '0 10px 25px -5px rgba(0, 112, 186, 0.08), 0 8px 10px -6px rgba(0, 112, 186, 0.04)',
        'glass': '0 8px 32px 0 rgba(10, 25, 47, 0.1)',
      }
    },
  },
  plugins: [],
}
