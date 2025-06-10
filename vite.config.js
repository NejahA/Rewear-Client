import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
      tailwindcss(),

  ],
  server: {
    proxy: {
      '/api': 'https://fantastic-engine-ww965p6rpv4c994-10000.app.github.dev/'
    }
  },
})
