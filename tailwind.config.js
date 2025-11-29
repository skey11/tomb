/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        techno: ['"Share Tech Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
        grotesk: ['"Space Grotesk"', "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        night: "#050510",
        neon: "#6fffe9",
        gold: "#f8d57e"
      },
      dropShadow: {
        glow: "0 0 20px rgba(111, 255, 233, 0.45)"
      }
    }
  },
  plugins: []
};
