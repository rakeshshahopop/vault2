import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT for GitHub Pages:
// Your site will live at https://<your-username>.github.io/<repo-name>/
// so Vite needs to know that subpath ("base") to load its JS/CSS correctly.
// Replace 'REPO_NAME' below with your actual GitHub repository name.
export default defineConfig({
  base: 'rakeshshahopop/vault2',
  plugins: [react()],
  server: {
    port: 5173,
  },
});
