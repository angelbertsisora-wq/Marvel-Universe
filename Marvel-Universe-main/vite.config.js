//

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Marvel-Universe/' : '/', // Use base path only for production
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from all network interfaces
    port: 5173,
    strictPort: false, // Try next available port if 5173 is taken
    open: true, // Automatically open browser
  },
})
