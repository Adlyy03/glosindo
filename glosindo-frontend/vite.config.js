import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,

    https: {
      key: fs.readFileSync(
        '/home/adly/.local/share/mkcert/glosindo/192.168.175.78+2-key.pem'
      ),
      cert: fs.readFileSync(
        '/home/adly/.local/share/mkcert/glosindo/192.168.175.78+2.pem'
      ),
    },

    strictPort: false,
  },
});
